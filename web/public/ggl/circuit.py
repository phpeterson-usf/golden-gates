import asyncio
import logging

from .edge import Edge
from .node import Node, Connector
from .ggl_logging import new_logger, set_global_js_logging
from .io import Input, Output, Clock

logger = new_logger(__name__, logging.DEBUG)

class Circuit:
    """
    Circuits are a collection of Nodes which may be run()
    to produce a value in Output Nodes
    """

    def __init__(self, label='', js_logging=None, name=None):
        self.label = label
        self.name = name
        # These are Nodes, NOT in/outpoints, pending a design for subcircuits
        self.inputs = []
        self.outputs = []
        self.all_nodes = set()
        self.clock: Clock = None

        # Set up logging for this circuit and all its components
        if js_logging is not None:
            set_global_js_logging(js_logging)

    def step(self, rising_edge=False):
        """
        Perform one propagation step in the circuit which handles both clocked and combinational propagation.
        """
   
    async def run_clock(self, clock_q):
        """
        Asynchronous function to notify a running circuit of clock edges
        
        :param self: Description
        :param clock_q: Queue to notify on rising or falling edge
        """
        duty_cycle = 1 / self.clock.frequency / 2
        # TODO: poll a JS variable for stop
        while True:
            await asyncio.sleep(duty_cycle)
            await clock_q.put('unused')

    async def run_circuit(self, clock_q):
        work = [self.clock]
        for i in self.inputs:
            work.append(i)
        while True:
            try:
                _ = clock_q.get_nowait()
                self.clock.toggle()
                work.append(self.clock)
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

    async def run(self):
        clock_q = asyncio.Queue()
        await asyncio.gather(
            self.run_circuit(clock_q),
            self.run_clock(clock_q)
        )
    
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
        if srcnode.kind == Input.kind and srcnode not in self.inputs:
            self.inputs.append(srcnode)
            srcnode.circuit = self
        if destnode.kind == Output.kind and destnode not in self.outputs:
            self.outputs.append(destnode)

        self.all_nodes.update([srcnode, destnode])

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
