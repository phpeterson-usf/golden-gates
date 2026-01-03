import copy
import logging

from .ggl_logging import new_logger
from .errors import CircuitError

logger = new_logger(__name__, logging.DEBUG)


class BitWidthMismatch(Exception):
    """Carry these details internally to GGL exception handler"""

    def __init__(self, expected, actual):
        self.expected = expected
        self.actual = actual


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

    def read_value(self, name, bits):
        # Read the value from the edge connected to the named inpoint
        edge = self.points[name]
        # edge.bits is None means unvisited, so don't raise for that
        if edge.bits is not None and bits != edge.bits:
            raise BitWidthMismatch(bits, edge.bits)
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

    def write_value(self, name, value, bits):
        # Write the given value to all edges connected to the named outpoint
        # Add all nodes connectes to those edges to the simulator work list
        new_work = []
        for edge in self.points[name]:
            new_work += edge.propagate(value=value, bits=bits)
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

    def safe_read_input(self, iname, bits=1):
        """If iname is not connected raise an exception through to the UI"""
        try:
            return self.inputs.read_value(iname, bits)
        except AttributeError as ae:
            raise CircuitError(
                component_id=self.js_id,
                component_type=self.kind,
                component_label=self.label,
                error_code="inputNotConnected",
                port_name=iname
            ) from ae
        except BitWidthMismatch as bwm:
            raise CircuitError(
                component_id=self.js_id,
                component_type=self.kind,
                component_label=self.label,
                error_code="bitWidthMismatch",
                expectedBits=bwm.expected,
                actualBits=bwm.actual,
                port_name=iname
            ) from bwm

    def append_output_edge(self, name, edge):
        self.outputs.append_edge(name, edge)

    def input(self, name):
        """Returns a Connector for the named input"""
        return Connector(self, name)

    def output(self, name):
        """Returns a Connector for the named output"""
        return Connector(self, name)

    def __getattribute__(self, name):
        """
        Enable attribute-style access to inputs and outputs.
        Examples: mux.sel instead of mux.input("sel"), adder.sum instead of adder.output("sum")

        Port names take priority over class attributes.
        """
        # Check if this is a port name first (prioritize ports over attributes)
        try:
            # This wonky syntax is required to prevent infinite recursion on
            # self.inputs calling self.__getattribute__()
            inputs = object.__getattribute__(self, 'inputs')
            outputs = object.__getattribute__(self, 'outputs')

            if name in inputs.get_names():
                return Connector(self, name)
            elif name in outputs.get_names():
                return Connector(self, name)
        except AttributeError:
            # During construction, inputs/outputs might not exist yet
            pass

        # Not a port name, use normal attribute access
        return object.__getattribute__(self, name)

    def propagate(self, output_name='0', value=0, bits=0):
        """
        The base Node propagate() method fans out the given value to the
        given output_name, assuming all necessary transformations (e.g.
        invert, truncation) have been done by propagate() in derived classes
        """
        assert (output_name in self.outputs.points)
        logger.debug(
            f"{self.kind} '{self.label}' output '{output_name}' propagates {hex(value)}")
        return self.outputs.write_value(output_name, value, bits)

    def clone(self, instance_id):
        """
        Create a deep copy of this node with a new instance ID.
        Uses deepcopy to preserve all state, then updates label and clears connections.
        """

        # Create a deep copy to preserve all configuration and state
        # Preserve js_id so Exceptions can reference the original UI component
        node = copy.deepcopy(self)

        # Update the label with instance_id suffix
        if hasattr(node, 'label') and node.label:
            node.label = f"{node.label}_{instance_id}"

        # Reinitialize connections - preserve structure but clear edge references
        for oname in node.outputs.points:
            node.outputs.points[oname] = []
        for input_name in node.inputs.points:
            node.inputs.points[input_name] = None

        return node


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

    def mask(self, bits=None):
        """
        Builds the bit mask for the number of data bits for this gate
        Use provided bits if specified, otherwise default to self.bits
        """
        if bits is None:
            bits = self.bits
        return (1 << bits) - 1

    def propagate(self, output_name='0', value=0, bits=None):
        if bits is None:
            bits = self.bits
        value &= self.mask(bits)
        return super().propagate(output_name=output_name, value=value, bits=bits)

    def safe_read_input(self, iname, bits=None):
        """
        Override safe_read_input() for nodes where multi-bit inputs are expected
        The base class raises an exception if the input Edge.bits doesn't match
        """
        if bits is None:
            bits = self.bits
        return super().safe_read_input(iname, bits=bits)
