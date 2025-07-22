from .ggl_logging import new_logger

logger = new_logger('node')

class Connector:
    """Represents a specific input or output point on a node"""
    def __init__(self, node, name):
        self.node = node
        self.name = name

class NodeInputs:
    """
    The inputs to a Node are a dict of name-to-edge.
    This dict is one-to-one because an input must be fed by
    exactly one Edge.
    NB: This is NOT an Input Node! (those are in io.py)
    """
    def __init__(self, names, node):
        self.points = {name: None for name in names}
        self.node = node
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

    def __getitem__(self, index):
        logger.info(f'getitem index: {index}')
        """Allow array-style access like node.inputs[0]"""
        names = list(self.points.keys())
        if 0 <= index < len(names):
            return Connector(self.node, names[index])
        raise IndexError(f"Input index {index} out of range")

class NodeOutputs:
    """
    The outputs from a node are a dict of name-to-list-of-Edge.
    This dict is one-to-many because an output's value may
    feed many Edges
    NB: This is NOT an Output Node (those are in io.py)
    """
    def __init__(self, names, node):
        self.points = {name: [] for name in names}
        self.node = node

    def append_edge(self, name, obj):
        self.points[name].append(obj)

    def __getitem__(self, index):
        """Allow array-style access like node.outputs[0]"""
        names = list(self.points.keys())
        if 0 <= index < len(names):
            return Connector(self.node, names[index])
        raise IndexError(f"Output index {index} out of range")

class Node:
    """
    Nodes are elements (gates, adders, plexers, registers, subcircuits)
    in the circuit
    """
    def __init__(self, kind, innames=[], outnames=[], label=''):
        self.kind = kind    # Hard-coded, e.g. 'And Gate'
        self.label = label  # User-provided, e.g. 'is b-type'
        self.inputs = NodeInputs(innames, self)
        self.outputs = NodeOutputs(outnames, self)

    def __str__(self):
        return f'{self.kind} {self.label}'

    def get_input_edge(self, name):
        return self.inputs.get_edge(name)

    def set_input_edge(self, name, edge):
        self.inputs.set_edge(name, edge)

    def append_output_edge(self, name, edge):
        self.outputs.append_edge(name, edge)
    
    def input(self, name):
        """Returns a Connector for the named input"""
        return Connector(self, name)
    
    def output(self, name):
        """Returns a Connector for the named output"""
        return Connector(self, name)

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
            logger.info(f'{self.kind} {self.label} outpoint {name} propagates: {value}')
            logger.debug(f"{self.kind} {self.label} has {len(edges)} output edges on port {name}")
            for e in edges:
                e.propagate(value)
                dest_nodes = e.get_dest_nodes()
                logger.debug(f"Edge propagated to {len(dest_nodes)} destinations: {[n.label for n in dest_nodes]}")
                # NB: use += to join the lists rather than append() a list to a list
                new_work += dest_nodes
        logger.debug(f"{self.kind} {self.label} returning {len(new_work)} nodes to work queue")
        return new_work

    def preflight(self):
        logger.error("Node preflight() must be overridden")
    
    def clone(self, instance_id):
        """
        Create a copy of this node with a new instance ID.
        Subclasses should override this to handle their specific parameters.
        
        Args:
            instance_id: Unique identifier to append to labels
            
        Returns:
            Node: A new instance with the same configuration
        """
        raise NotImplementedError(f"clone() must be implemented by {self.__class__.__name__}")


class BitsNode(Node):
    """
    BitsNode is a Node which has a bit width, e.g. Gates, plexers, registers
    """
    def __init__(self, kind, num_inputs=0, num_outputs=0, label='', bits=1, named_inputs=[], named_outputs=[]):
        # Inputs can be numbered (num_inputs) or named (named_inputs, e.g. 'D', 'en')
        innames = [str(i) for i in range(num_inputs)]
        innames += named_inputs

        # Outputs can be numbered (num_outputs) or named (named_outputs, e.g. 'Q', 'R')
        outnames = [str(o) for o in range(num_outputs)]
        outnames += named_outputs

        super().__init__(kind=kind, innames=innames, outnames=outnames, label=label)
        self.bits = bits
    
    def clone(self, instance_id):
        """Clone a BitsNode - subclasses may override for more specific behavior"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return self.__class__(
            kind=self.kind,
            num_inputs=len(self.inputs.points),
            num_outputs=len(self.outputs.points),
            label=new_label,
            bits=self.bits
        )
