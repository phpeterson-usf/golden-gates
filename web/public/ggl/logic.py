from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger('logic')

class Gate(BitsNode):
    """
    Gate is a logic gate, like AND, OR, XOR, etc
    """
    def __init__(self, kind, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None, invert_output=False):
        super().__init__(
            kind=kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)
        self.label = label
        self.inverted_inputs = inverted_inputs or []
        self.invert_output = invert_output

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

        if self.invert_output:
            # Invert can't be done in a propagate() overload, so
            # apply inversion for Nand, Nor, Xnor here
            rv = ~rv
        return super().propagate(rv)
    

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
            inverted_inputs=inverted_inputs,
            invert_output=True)

    def logic(self, v1, v2):
        return v1 | v2
    

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
            inverted_inputs=inverted_inputs,
            invert_output=True)

    def logic(self, v1, v2):
        return v1 ^ v2


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
            inverted_inputs=inverted_inputs,
            invert_output=True)

    def logic(self, v1, v2):
        return v1 & v2

    
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
            inverted_inputs=inverted_inputs,
            invert_output=True)
    