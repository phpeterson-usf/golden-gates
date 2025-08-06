from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger(__name__)


class Gate(BitsNode):
    """
    Gate is a logic gate, like AND, OR, XOR, etc
    """

    def __init__(self, kind, js_id='', num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)
        self.inverted_inputs = inverted_inputs or []

    def logic(self, v1, v2):
        logger.error(f'Gate logic() must be implemented for {self.kind}')

    def get_inverted_edge_values(self):
        """
        get_inverted_edge_values() loops over the edges by index, comparing
        the index with the inverted inputs, and inverting if necessary
        """
        values = []
        input_names = self.inputs.points.keys()
        for iname in input_names:
            v = self.safe_read_input(iname)
            inum = int(iname)
            if inum in self.inverted_inputs:
                v = ~v
            values.append(v)
        return values

    def propagate(self, output_name='0', value=0):
        """
        Gate.propagate() loops over the Edges which are connected to
        the inpoints of this gate, getting the value. It calls
        the logic() method which is implemented for Gate subclasses
        """
        rv = 0
        values = self.get_inverted_edge_values()

        # Get the first value, then loop from the second...end
        rv = values[0]
        for v in values[1:]:
            # Perform the Gate-specific logic (AND, OR, ...)
            rv = self.logic(rv, v)

        # Invert if needed
        rv = self.invert(rv)
        return super().propagate(value=rv)

    def invert(self, rv):
        # No inversion in the base class
        return rv


class And(Gate):
    """And Gates perform bitwise AND"""
    kind = 'And'

    def __init__(self, js_id='', num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=And.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def logic(self, v1, v2):
        return v1 & v2


class Or(Gate):
    """Or Gates perform bitwise OR"""
    kind = 'Or'

    def __init__(self, js_id='', num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Or.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def logic(self, v1, v2):
        return v1 | v2


class Nor(Gate):
    """Nor Gates perform bitwise NOR"""
    kind = 'Nor'

    def __init__(self, js_id='', num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Nor.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def logic(self, v1, v2):
        return v1 | v2

    def invert(self, rv):
        return ~rv


class Xor(Gate):
    """Xor Gates perform bitwise XOR"""
    kind = 'Xor'

    def __init__(self, js_id='', num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Xor.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def logic(self, v1, v2):
        return v1 ^ v2


class Xnor(Gate):
    """Xnor Gates perform bitwise XNOR"""
    kind = 'Xnor'

    def __init__(self, js_id='', num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Xnor.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def logic(self, v1, v2):
        return v1 ^ v2

    def invert(self, rv):
        return ~rv


class Nand(Gate):
    """Nand Gates perform bitwise NAND"""
    kind = 'Nand'

    def __init__(self, js_id='', num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Nand.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def logic(self, v1, v2):
        return v1 & v2

    def invert(self, rv):
        return ~rv


class Not(Gate):
    """Not Gates perform bitwise NOT"""
    kind = 'Not'

    def __init__(self, js_id='', num_inputs=1, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Not.kind,
            js_id=js_id,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def invert(self, rv):
        return ~rv
