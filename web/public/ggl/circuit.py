import asyncio
from collections import deque

from .edge import Edge
from .node import Node, Connector
from .ggl_logging import new_logger, set_global_js_logging
from .io import Input, Output, Clock
from .errors import CircuitError
from . import edge as edge_module

logger = new_logger(__name__)

MAX_ITERATIONS = 100  # Prevent runaway settle loops on unstable circuits

class Circuit:
    """
    Circuits are a collection of Nodes which may be run()
    to produce a value in Output Nodes
    """

    def __init__(self, label='', js_logging=None, circuit_name=None):
        self.label = label
        self.circuit_name = circuit_name
        # These are Nodes, NOT in/outpoints, pending a design for subcircuits
        self.inputs = []
        self.outputs = []
        # Ordered (insertion = connect() order) so cloning/propagation are
        # deterministic. A set here makes object iteration order vary per run,
        # which non-deterministically changes how feedback (latches) settle.
        self.all_nodes = []
        self.clock: Clock = None
        self.running = True
        self.input_q = None  # Queue for runtime input updates
        # When True, assigning to an Input's .value re-propagates the circuit.
        self.auto_propagate = True
        # Re-entrancy guard so propagation can't trigger nested step()s.
        self._in_step = False

        # Set up logging for this circuit and all its components
        if js_logging is not None:
            set_global_js_logging(js_logging)

    def step(self, rising_edge=False):
        """
        Perform one synchronous propagation pass: seed the work queue with the
        circuit's inputs (and, on a rising edge, the clock) and propagate until
        the circuit settles. Each node propagates at most once per pass.
        """
        self._in_step = True
        # The synchronous engine bounds cycles with the visited set below, so
        # edges must always forward their value during a step.
        prev_gating = edge_module.gate_on_change
        edge_module.gate_on_change = False
        try:
            work = deque(self.inputs)
            if rising_edge and self.clock is not None:
                work.append(self.clock)

            visited = set()
            while work:
                node = work.popleft()
                if node in visited:
                    continue
                visited.add(node)
                try:
                    new_work = node.propagate()
                except CircuitError as e:
                    # Add circuit context if the error doesn't already carry it
                    if not e.circuit_name and self.circuit_name:
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
                    raise
                if new_work:
                    for n in new_work:
                        if n not in visited:
                            work.append(n)
        finally:
            edge_module.gate_on_change = prev_gating
            self._in_step = False

    def run(self):
        """
        Settle the circuit's combinational logic synchronously and return.

        This is the entry point used by the headless test suite. The
        long-running, free-running-clock variant for the browser lives in
        run_async().
        """
        self.running = True
        # Settle combinational logic until the outputs stop changing.
        for _ in range(MAX_ITERATIONS):
            prev = {id(n): n.value for n in self.outputs}
            self.step(rising_edge=False)
            curr = {id(n): n.value for n in self.outputs}
            if prev == curr:
                break
        else:
            logger.warning("Combinational logic did not stabilize")
        # One clocked pass so sequential elements (registers) latch the value
        # of their now-settled inputs. The settle loop above only watches the
        # outputs, so an internal register whose D arrived late in a pass needs
        # this extra pass to re-read it.
        self.step(rising_edge=True)

    async def run_clock(self, clock_q):
        """
        Asynchronous function to notify a running circuit of clock edges

        :param self: Description
        :param clock_q: Queue to notify on rising or falling edge
        """
        duty_cycle = 1 / self.clock.frequency / 2
        while self.running:
            await asyncio.sleep(duty_cycle)
            await clock_q.put('unused')

    async def run_circuit(self, clock_q):
        work = [self.clock] if self.clock else []
        for i in self.inputs:
            work.append(i)
        while self.running:
            # Check for clock edges
            try:
                _ = clock_q.get_nowait()
                self.clock.toggle()
                work.append(self.clock)
            except asyncio.QueueEmpty:
                pass
            # Check for input updates from UI
            try:
                input_node = self.input_q.get_nowait()
                if input_node not in work:
                    work.append(input_node)
            except asyncio.QueueEmpty:
                pass
            if len(work) == 0:
                await asyncio.sleep(0.1)
                continue
            node = work[0]
            new_work = node.propagate()
            work.remove(node)
            if new_work:
                work += new_work

    async def run_async(self):
        """
        Long-running asynchronous simulation for the browser/Pyodide:
        free-running clock plus live input updates via update_input(), until
        stop() is called. Driven with `await circuit0.run_async()`.
        """
        self.running = True
        clock_q = asyncio.Queue()
        self.input_q = asyncio.Queue()

        if self.clock:
            await asyncio.gather(
                self.run_circuit(clock_q),
                self.run_clock(clock_q)
            )
        else:
            await self.run_circuit(clock_q)

    def update_input(self, js_id, value):
        """Update an input node's value at runtime and trigger re-propagation"""
        for node in self.all_nodes:
            if node.js_id == js_id:
                node.value = value
                if self.input_q:
                    self.input_q.put_nowait(node)
                logger.info(f"Updated input {js_id} to {value}")
                return
        logger.warning(f"Input node {js_id} not found")

    def stop(self):
        """Stop the running circuit simulation"""
        logger.info("Circuit stop() called")
        self.running = False
    
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

        # Wire up embedded circuits (CircuitNodes)
        # When connecting to a CircuitNode's input, replace its internal Input
        # with a ChildInput that reads from this edge
        from .component import CircuitNode
        if isinstance(destnode, CircuitNode):
            destnode._wire_child_input(destname, edge)

        # When connecting from a CircuitNode's output, replace its internal Output
        # with a ChildOutput that writes to this edge
        if isinstance(srcnode, CircuitNode):
            srcnode._wire_child_output(srcname, edge)

        # Keep a list of Input Nodes so we can start the simulation from there
        if srcnode.kind == Input.kind and srcnode not in self.inputs:
            self.inputs.append(srcnode)
            srcnode.circuit = self
        if destnode.kind == Output.kind and destnode not in self.outputs:
            self.outputs.append(destnode)

        for node in (srcnode, destnode):
            if node not in self.all_nodes:
                self.all_nodes.append(node)

        # Keep the Clock node for running the circuit
        if srcnode.kind == Clock.kind:
            # TODO error if multiple clocks
            self.clock = srcnode


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
