import logging

logger = logging.getLogger('node')

class NodeInputs:
    """
    The inputs to a Node are a dict of name-to-edge.
    This dict is one-to-one because an input must be fed by
    exactly one Edge.
    NB: This is NOT an Input Node! (those are in io.py)
    """
    def __init__(self, names):
        self.points = {name: None for name in names}
    def get_edge(self, name):
        return self.points.get(name)
    def get_edges(self):
        return [edge for _,edge in self.points.items()]
    def set_edge(self, name, edge):
        """
        TODO
        if self.points[name] is not None:
            raise SimulatorError("Another Edge is already connected to this inpoint")
        """
        self.points[name] = edge

class NodeOutputs:
    """
    The outputs from a node are a dict of name-to-list-of-Edge.
    This dict is one-to-many because an output's value may
    feed many Edges
    NB: This is NOT an Output Node (those are in io.py)
    """
    def __init__(self, names):
        self.points = {name: [] for name in names}
    def append_edge(self, name, obj):
        self.points[name].append(obj)

class Node:
    """
    Nodes are elements (gates, adders, plexers, registers, subcircuits)
    in the circuit
    """
    def __init__(self, kind, innames=[], outnames=[], label=''):
        self.kind = kind    # Hard-coded, e.g. 'And Gate'
        self.label = label  # User-provided, e.g. 'is b-type'
        self.inputs = NodeInputs(innames)
        self.outputs = NodeOutputs(outnames)

    def __str__(self):
        return f'{self.kind} {self.label}'

    def get_input_edge(self, name):
        return self.inputs.get_edge(name)

    def set_input_edge(self, name, edge):
        self.inputs.set_edge(name, edge)

    def append_output_edge(self, name, edge):
        self.outputs.append_edge(name, edge)

    def propagate(self, value=0):
        """
        propagates a value from a Node to all Edges
        it is connected to. Derived Node classes calculate
        the value and then call super() to do the fan-out
        returns new_work, which is a list of all the Nodes
        which now have a new value on an inpoint's Edge
        """
        new_work = []

        # TODO: I don't love direct access to the points dict here
        # should propagate go into self.outputs, passing kind and label?
        for name, edges in self.outputs.points.items():
            logger.debug(f'{self.kind} {self.label} outpoint {name} propagates: {value}')
            for e in edges:
                e.propagate(value)
                # NB: use += to join the lists rather than append() a list to a list
                new_work += e.get_dest_nodes()
        return new_work

    def preflight(self):
        logger.error("Node preflight() must be overridden")


class BitsNode(Node):
    """
    BitsNode is a Node which has a bit width, e.g. Gates, plexers, registers
    """
    def __init__(self, kind, num_inputs=2, num_outputs=1, label='', bits=1):
        innames = [str(i) for i in range(num_inputs)]
        outnames = [str(o) for o in range(num_outputs)]
        super().__init__(kind, innames, outnames, label)
        self.bits = bits
