import logging
from .edge import Edge
from .node import Node, Connector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('circuit')

class Circuit:
    """
    Circuits are a collection of Nodes which may be run()
    to produce a value in Output Nodes
    """
    def __init__(self, label=''):
        self.label = label
        # These are Nodes, NOT in/outpoints, pending a design for subcircuits
        self.inputs = []
        self.outputs = []

    def preflight(self):
        """
        TODO: 
        - don't allow mismatched bit widths. Can that be done here?
        - don't allow more than one output to the same input
        """
        return True

    def run(self):
        """
        run() initiates a simulation starting with Input Nodes
        Each Node in the work queue does its function, and returns
        a list of any Nodes which must be re-evaluated
        """
        work = []
        for i in self.inputs:
            work.append(i)
        while len(work) > 0:
            node = work[0]
            new_work = node.propagate()
            work.remove(node)
            if new_work:
                work += new_work
            # TODO: for cyclic circuits (SR-latch, D-flip-flop), well need
            # to check for stable outputs to avoid infinite loops

    def connect(self, src, dest):
        """
        Connect nodes using connectors or nodes directly.
        - For nodes with single outputs/inputs, can pass the node directly
        - For multiple outputs/inputs, must use node.output("name") or node.input("name")
        """
        # Determine source
        if isinstance(src, Connector):
            srcnode, srcname = src.node, src.name
        elif isinstance(src, Node):
            # Direct node - must have single output
            output_names = list(src.outputs.points.keys())
            if len(output_names) != 1:
                raise ValueError(f"Node {src} has {len(output_names)} outputs, must use .output('name')")
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
                raise ValueError(f"Node {dest} has {len(input_names)} inputs, must use .input('name')")
            destnode, destname = dest, input_names[0]
        else:
            raise TypeError("Destination must be a Node or Connector")
        
        # Create the edge
        edge = Edge(srcnode, srcname, destnode, destname)
        srcnode.append_output_edge(srcname, edge)
        destnode.set_input_edge(destname, edge)
        
        # Keep a list of Input Nodes so we can start the simulation from there
        if srcnode.kind == 'Input':
            self.inputs.append(srcnode)
