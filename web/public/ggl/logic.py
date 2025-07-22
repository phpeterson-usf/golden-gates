from .node import BitsNode
from .ggl_logging import get_logger

logger = get_logger('logic')

class Gate(BitsNode):
    """
    Gate is a logic gate, like AND, OR, XOR, etc
    """
    def __init__(self, kind, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)
        self.label = label
        self.inverted_inputs = inverted_inputs or []
    
    def clone(self, instance_id):
        """Clone a Gate with proper parameters"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return self.__class__(
            num_inputs=len(self.inputs.points),
            num_outputs=len(self.outputs.points),
            label=new_label,
            bits=self.bits,
            inverted_inputs=self.inverted_inputs.copy() if self.inverted_inputs else None
        )

    def logic(self, v1, v2):
        logger.error(f'Gate logic() must be implemented for {self.kind}')

    def get_inverted_edge_values(self):
        """
        get_inverted_edge_values() loops over the edges by index, comparing
        the index with the inverted inputs, and inverting if necessary
        """
        values = []
        edges = self.inputs.get_edges()
        for i in range(len(edges)):
            v = edges[i].value
            if i in self.inverted_inputs:
                v = ~v
            values.append(v)
        return values

    def mask(self):
        """Builds the bit mask for the number of data bits for this gate"""
        return (1 << self.bits) - 1

    def propagate(self, value=0):
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

        # Invert if needed, and truncate the output to self.bits wide
        rv = self.invert(rv) & self.mask()
        logger.info(f'{self.kind} propagates: {rv}')
        return super().propagate(rv)
    
    def invert(self, rv):
        # No inversion in the base class
        return rv

class And(Gate):
    """And Gates perform bitwise AND"""
    kind = 'And'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=And.kind,
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
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Or.kind,
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
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Nor.kind,
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
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Xor.kind,
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
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Xnor.kind,
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
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Nand.kind,
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
    def __init__(self, num_inputs=1, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(
            kind=Not.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits,
            inverted_inputs=inverted_inputs)

    def invert(self, rv):
        return ~rv
    