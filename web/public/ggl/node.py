from .ggl_logging import new_logger
from .errors import CircuitComponentError, ERROR_INPUT_NOT_CONNECTED

logger = new_logger(__name__)


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
        return [edge for _, edge in self.points.items()]

    def set_edge(self, name, edge):
        """
        TODO
        if self.points[name] is not None:
            raise SimulatorError("Another Edge is already connected to this inpoint")
        """
        self.points[name] = edge

    def get_names(self):
        return self.points.keys()

    def read_value(self, name):
        # Read the value from the edge connected to the named inpoint
        edge = self.points[name]
        return edge.value

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

    def get_names(self):
        return self.points.keys()

    def write_value(self, name, value):
        # Write the given value to all edges connected to the named outpoint
        # Add all nodes connectes to those edges to the simulator work list
        new_work = []
        for edge in self.points[name]:
            new_work += edge.propagate(value)
        return new_work

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

    def __init__(self, kind, js_id='', innames=[], outnames=[], label=''):
        self.kind = kind    # Hard-coded, e.g. 'And Gate'
        self.js_id = js_id  # Optionally provided be the frontend
        self.label = label  # User-provided, e.g. 'is b-type'
        self.inputs = NodeInputs(innames, self)
        self.outputs = NodeOutputs(outnames, self)

    def __str__(self):
        return f'{self.kind} {self.label}'

    def get_input_edge(self, name):
        return self.inputs.get_edge(name)

    def set_input_edge(self, name, edge):
        self.inputs.set_edge(name, edge)

    def safe_read_input(self, iname):
        """If iname is not connected raise an exception through to the UI"""
        try:
            return self.inputs.read_value(iname)
        except Exception as e:
            raise CircuitComponentError(
                component_id=self.js_id,
                component_type=self.kind,
                error_code="inputNotConnected",
                port_name=iname
            ) from e

    def append_output_edge(self, name, edge):
        self.outputs.append_edge(name, edge)

    def input(self, name):
        """Returns a Connector for the named input"""
        return Connector(self, name)

    def output(self, name):
        """Returns a Connector for the named output"""
        return Connector(self, name)

    def propagate(self, output_name='0', value=0):
        """
        The base Node propagate() method fans out the given value to the
        given output_name, assuming all necessary transformations (e.g.
        invert, truncation) have been done by propagate() in derived classes
        """
        assert (output_name in self.outputs.points)
        logger.info(
            f"{self.kind} '{self.label}' output '{output_name}' propagates {hex(value)}")
        return self.outputs.write_value(output_name, value)

    def clone(self, instance_id):
        """
        Create a copy of this node with a new instance ID.
        Subclasses should override this to handle their specific parameters.

        Args:
            instance_id: Unique identifier to append to labels

        Returns:
            Node: A new instance with the same configuration
        """
        raise NotImplementedError(
            f"clone() must be implemented by {self.__class__.__name__}")


class BitsNode(Node):
    """
    BitsNode is a Node which has a bit width, e.g. Gates, plexers, registers
    """

    def __init__(self, kind, js_id='', num_inputs=0, num_outputs=0, label='', bits=1, named_inputs=[], named_outputs=[]):
        # Inputs can be numbered (num_inputs) or named (named_inputs, e.g. 'D', 'en')
        innames = [str(i) for i in range(num_inputs)]
        innames += named_inputs

        # Outputs can be numbered (num_outputs) or named (named_outputs, e.g. 'Q', 'R')
        outnames = [str(o) for o in range(num_outputs)]
        outnames += named_outputs

        super().__init__(kind, js_id=js_id, innames=innames, outnames=outnames, label=label)
        self.bits = bits

    def clone(self, instance_id):
        """Clone a BitsNode - subclasses may override for more specific behavior"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        
        # Simply preserve the exact port names that already exist
        # Pass them as named ports (with num_inputs/outputs=0) to avoid any numbering
        input_names = list(self.inputs.points.keys())
        output_names = list(self.outputs.points.keys())
        
        return self.__class__(
            kind=self.kind,
            js_id=self.js_id,
            num_inputs=0,
            num_outputs=0,
            named_inputs=input_names,
            named_outputs=output_names,
            label=new_label,
            bits=self.bits
        )

    def mask(self):
        # Builds the bit mask for the number of data bits for this gate
        return (1 << self.bits) - 1

    def propagate(self, output_name='0', value=0):
        # Truncate the output to self.bits wide
        value &= self.mask()
        return super().propagate(output_name=output_name, value=value)
