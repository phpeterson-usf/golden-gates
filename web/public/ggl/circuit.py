from .edge import Edge
from .node import Node, Connector
from .ggl_logging import new_logger, set_global_js_logging
from .errors import CircuitError
from collections import deque
import time

logger = new_logger(__name__)

MAX_ITERATIONS = 100  # Prevent infinite loops


class Circuit:
    """
    Circuits are a collection of Nodes which may be run()
    to produce a value in Output Nodes
    """

    def __init__(self, label='', js_logging=None, auto_propagate=True, circuit_name=None):
        self.label = label
        self.circuit_name = circuit_name
        # These are Nodes, NOT in/outpoints, pending a design for subcircuits
        self.inputs = []
        self.outputs = []
        self.all_nodes = set()
        self.running = True
        self.auto_propagate = auto_propagate

        # Set up logging for this circuit and all its components
        if js_logging is not None:
            set_global_js_logging(js_logging)

    def step(self, rising_edge=False):
        """
        Perform one propagation step in the circuit which handles both clocked and combinational propagation.
        """
        work = deque()

        # include all inputs and clock edges/rising edge propagation
        for node in self.inputs:
            work.append(node)

        if rising_edge:
            for clock in getattr(self, 'clocks', []):
                new_work = clock.propagate()
                if new_work:
                    work.extend(new_work)

        visited = set()

        while work:
            node = work.popleft()
            if node in visited:
                continue
            visited.add(node)

            try:
                new_work = node.propagate()
                if new_work:
                    for n in new_work:
                        if n not in visited:
                            work.append(n)
            except CircuitError as e:
                # Enhance the error with circuit context if not already present
                if not e.circuit_name and self.circuit_name:
                    # Create a new CircuitError with the circuit name added
                    raise CircuitError(
                        component_id=e.component_id,
                        component_type=e.component_type,
                        component_label=e.component_label,
                        error_code=e.error_code,
                        severity=e.severity,
                        port_name=e.port_name,
                        connected_component_id=e.connected_component_id,
                        circuit_name=self.circuit_name,
                        **e.additional_fields
                    ) from e
                else:
                    # Re-raise the original error if circuit_name is already set
                    raise
   
    def run(self, background=False):
        """
        Start the circuit simulation.
        If `background=True`, runs in a separate thread.
        """
        if background:
            import threading
            self.thread = threading.Thread(target=self.longrun)
            self.thread.start()
        else:
            self.longrun()

    def stop(self):
        """
        Stop the long running circuit loop using boolean self.running
        """
        logger.info("Circuit stop() called: long running circuit will stop")
        self.running = False
        if hasattr(self, 'thread'):
            self.thread.join()

    def longrun(self):
        """
        Circuit simulation supporting combinational, sequential, and cyclic logic

        run()
            comb_graph # input, constant...
            seq_graph # clock...
            loop:
                loop:
                    comb_graph.step until stabilized
                loop: # CLK HI
                    seq_graph.step until stabilized
                loop:
                    comb...
                loop: # CLK LOW
                    seq...
        """
        self.running = True

        clock_timers = {}
        for clock in getattr(self, 'clocks', []):
            if clock.mode == 'auto':
                clock_timers[clock] = time.time()

        while self.running:
            now = time.time()
            rising_edges = []
            for clock in getattr(self, 'clocks', []):
                if not self.running:
                    break
                if clock.mode == 'auto' and clock.frequency > 0:
                    interval = 1.0 / (clock.frequency * 2)  # half-period
                    if now - clock_timers[clock] >= interval:
                        clock_timers[clock] = now
                        edge_nodes = clock.toggleCLK('0')
                        print(clock.value)
                        rising_edges.extend(edge_nodes)

            # propagate combinational logic until stable
            for _ in range(MAX_ITERATIONS):
                if not self.running:
                    break
                prev = {n.label: n.value for n in self.outputs}
                self.step(rising_edge=False)
                curr = {n.label: n.value for n in self.outputs}
                if prev ==  curr:
                    break
            else:
                logger.warning("Combinational logic did not stabilize")

            self.step(rising_edge=True)
            
            if not self.running:
                break

            time.sleep(0.01)
            break

    def connect(self, src, dest, js_id=None):
        """
        Connect nodes using connectors or nodes directly.
        - For nodes with single outputs/inputs, can pass the node directly
        - For multiple outputs/inputs, must use node.output("name") or node.input("name")
        - For CircuitNode instances, automatically registers the node
        """

        # Determine source
        if isinstance(src, Connector):
            srcnode, srcname = src.node, src.name
        elif isinstance(src, Node):
            # Direct node - must have single output
            output_names = list(src.outputs.points.keys())
            if len(output_names) != 1:
                raise ValueError(
                    f"Node {src} has {len(output_names)} outputs, must use .output('name')")
            srcnode, srcname = src, output_names[0]
        else:
            raise TypeError("Source must be a Node or Connector")

        # Determine destination
        if isinstance(dest, Connector):
            destnode, destname = dest.node, dest.name
        elif isinstance(dest, Node):
            # Direct node - must have single input
            input_names = list(dest.inputs.points.keys())
            if len(input_names) != 1:
                raise ValueError(
                    f"Node {dest} has {len(input_names)} inputs, must use .input('name')")
            destnode, destname = dest, input_names[0]
        else:
            raise TypeError("Destination must be a Node or Connector")

        # Create the edge
        edge = Edge(srcnode, srcname, destnode, destname, js_id=js_id)
        srcnode.append_output_edge(srcname, edge)
        destnode.set_input_edge(destname, edge)

        # Keep a list of Input Nodes so we can start the simulation from there
        if srcnode.kind == 'Input' and srcnode not in self.inputs:
            self.inputs.append(srcnode)
            srcnode.circuit = self
        if destnode.kind == 'Output' and destnode not in self.outputs:
            self.outputs.append(destnode)

        self.all_nodes.update([srcnode, destnode])

        # Keep a list of Clock Nodes for clock propagation in the circuit.run()
        if not hasattr(self, 'clocks'):
            self.clocks = []
        if srcnode.kind == 'Clock' and srcnode not in self.clocks:
            self.clocks.append(srcnode)
        if destnode.kind == 'Clock' and destnode not in self.clocks:
            self.clocks.append(destnode)


def Component(circuit):
    """
    Create a reusable component template from a circuit definition.
    """
    def create_component_instance():
        # Create a new CircuitNode instance from the circuit template
        from .component import CircuitNode
        import time

        # Use timestamp + id for unique instance IDs
        instance_id = int(time.time() * 1000000) % 1000000
        return CircuitNode(circuit, instance_id)

    # Return a constructor that creates CircuitNode instances
    return create_component_instance
