from .node import BitsNode
from .ggl_logging import get_logger

logger = get_logger('logic')

class Gate(BitsNode):
    """
    Gate is a logic gate, like AND, OR, XOR, etc
    """
    def __init__(self, kind, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(kind, num_inputs, num_outputs, label, bits)
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

    def propagate(self, value=0):
        """
        Gate.propagate() loops over the Edges which are connected to
        the inpoints of this gate, getting the value. It calls
        the logic() method which is implemented for Gate subclasses
        """
        rv = 0
        # Get a list of edges from the inpoints for this Gate
        # TODO: error handle for not gate since it only has one input
        edges = self.inputs.get_edges()
        # Get the first value, then loop from the second...end
        
        rv = edges[0].value
        for e in edges[1:]:
            # Perform the Gate-specific logic (AND, OR, ...)
            rv = self.logic(rv, e.value)
        rv = self.invert(rv)
        logger.info(f'{self.kind} propagates: {rv}')
        return super().propagate(rv)
    
    def invert(self, rv):            
        return rv

class And(Gate):
    """And Gates perform bitwise AND"""
    kind = 'And'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(And.kind, num_inputs, num_outputs, label, bits, inverted_inputs)

    def logic(self, v1, v2):
        return v1 & v2


class Or(Gate):
    """Or Gates perform bitwise OR"""
    kind = 'Or'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(Or.kind, num_inputs, num_outputs, label, bits, inverted_inputs)

    def logic(self, v1, v2):
        return v1 | v2
    
class Nor(Gate):
    """Nor Gates perform bitwise NOR"""
    kind = 'Nor'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(Nor.kind, num_inputs, num_outputs, label, bits, inverted_inputs)

    def logic(self, v1, v2):
        return v1 | v2

    def invert(self, rv):
        return ~rv & ((1 << self.bits) - 1)
    

class Xor(Gate):
    """Xor Gates perform bitwise XOR"""
    kind = 'Xor'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(Xor.kind, num_inputs, num_outputs, label, bits, inverted_inputs)

    def logic(self, v1, v2):
        return v1 ^ v2

class Xnor(Gate):
    """Xnor Gates perform bitwise XNOR"""
    kind = 'Xnor'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(Xnor.kind, num_inputs, num_outputs, label, bits, inverted_inputs)

    def logic(self, v1, v2):
        return v1 ^ v2

    def invert(self, rv):
        return ~rv & ((1 << self.bits) - 1)

class Nand(Gate):
    """Nand Gates perform bitwise NAND"""
    kind = 'Nand'
    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(Nand.kind, num_inputs, num_outputs, label, bits, inverted_inputs)

    def logic(self, v1, v2):
        return v1 & v2

    def invert(self, rv):
        return ~rv & ((1 << self.bits) - 1)
    
class Not(Gate):
    """Not Gates perform bitwise NOT"""
    kind = 'Not'
    def __init__(self, num_inputs=1, num_outputs=1, label='', bits=1, inverted_inputs=None):
        super().__init__(Not.kind, num_inputs, num_outputs, label, bits, inverted_inputs)

    def logic(self, v1):
        return ~v1 & ((1 << self.bits) - 1)

    def propagate(self, value=0):
        edges = self.inputs.get_edges()
        rv = self.logic(edges[0].value)
        logger.info(f'{self.kind} propagates: {rv}')
        return super(Gate, self).propagate(rv)
    