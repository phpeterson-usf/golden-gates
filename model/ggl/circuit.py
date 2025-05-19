import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('circuit')

class Node:
    """
    Nodes are elements (gates, adders, plexers, registers, subcircuits)
    in the circuit
    """
    def __init__(self, kind, input_names=[], output_names=[], label=''):
        self.kind = kind    # Hard-coded, e.g. 'And Gate'
        self.label = label  # User-provided, e.g. 'is b-type'
        """
        inpoints and outpoints are dictionaries of name ("in0") to Edge
        inpoints are one-to-one because an input must be fed by
        exactly one output
        outpoints are one-to-many because an output's value may
        feed many inputs
        """
        self.inpoints = {name: None for name in input_names}
        self.outpoints = {name: [] for name in output_names}

    def __str__(self):
        return f'{self.kind} {self.label}'

    def step(self, value=0):
        """
        step() propagates a value from a Node to all Edges
        it is connected to. Derived Node classes calculate
        the value and then call super() to do the fan-out
        """
        new_work = []
        for name, edges in self.outpoints.items():
            logger.debug(f'{self.kind} {self.label} outpoint {name} propagates: {value}')
            for e in edges:
                e.value = value
                new_work.append(e.innode)
        return new_work

    def preflight(self):
        logger.error("Node preflight() must be overridden")

    def SetInputEdge(self, inname, edge):
        """
        TODO
        if self.inpoints[inname] is not None:
            raise SimulatorError("Another Edge is already connected to this inpoint")
        """
        self.inpoints[inname] = edge

    def SetOutputEdge(self, outname, edge):
        self.outpoints[outname].append(edge)


class BitsNode(Node):
    """
    BitsNode is a Node which has a bit width, e.g. Gates, plexers, registers
    """
    def __init__(self, kind, num_inputs=2, num_outputs=1, label='', bits=1):
        input_names = [str(i) for i in range(num_inputs)]
        output_names = [str(o) for o in range(num_outputs)]
        super().__init__(kind, input_names, output_names, label)
        self.bits = bits


class Edge:
    """
    Edges (wires) are connections which carry values between Nodes
    """
    def __init__(self, outnode, outname, innode, inname):
        """
        __init__() initializes an Edge with the object and endpoint name
        for the output (source) node and the input (dest) node
        """
        self.outnode = outnode
        self.outname = outname
        self.innode = innode
        self.inname = inname
        self.value = 0


class Circuit:
    """
    Circuits are a collection of Nodes which may be run()
    to produce a value in Output Nodes
    """
    def __init__(self):
        self.inputs = []  # Input nodes

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
            new_work = node.step()
            work.remove(node)
            if new_work:
                work += new_work
            # TODO: for cyclic circuits (SR-latch, D-flip-flop), well need
            # to check for stable outputs to avoid infinite loops

    def connect(self, outnode, outname, innode, inname):
        """
        connect() links the named outpoint of 
        a node with the named inpoint of a node. 
        Nodes and Edges reference each other bidirectionally
        """
        edge = Edge(outnode, outname, innode, inname)
        outnode.SetOutputEdge(outname, edge)
        innode.SetInputEdge(inname, edge)
    
        # Keep a list of Input Nodes so we can start the simulation from there
        if outnode.kind == 'Input':
            self.inputs.append(outnode)
