import logging
from .edge import Edge

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

    def connect(self, srcnode, srcname, destnode, destname):
        """
        connect() links the named outpoint of 
        a source node with the named inpoint of a dest node. 
        Nodes and Edges reference each other bidirectionally
        """
        edge = Edge(srcnode, srcname, destnode, destname)
        srcnode.append_output_edge(srcname, edge)
        destnode.set_input_edge(destname, edge)
    
        # Keep a list of Input Nodes so we can start the simulation from there
        if srcnode.kind == 'Input':
            self.inputs.append(srcnode)
