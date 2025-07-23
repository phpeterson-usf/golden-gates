from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger('operator')

class Arithmetic(BitsNode):
    def __init__(self, kind, num_inputs=3, num_outputs=2, label='', bits=1):
        super().__init__(
            kind=kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)
        self.label = label
    
    def clone(self, instance_id):
        """Clone an Arithmetic Component with proper parameters"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return self.__class__(
            num_inputs=len(self.inputs.points),
            num_outputs=len(self.outputs.points),
            label=new_label,
            bits=self.bits,
        )
    
    def operator(self, v1, v2, carryIn=0):
        logger.error(f'Arithmetic operator() must be implemented for {self.kind}')

    def propagate(self):
        values = [e.value if e is not None else 0 for e in self.inputs.get_edges()]
        if len(values) < 2:
            logger.error(f"{self.kind} requires at least two inputs: a, b")
            return []

        a, b = values[0], values[1]
        carry_in = values[2] if len(values) > 2 else 0

        result = self.operator(a, b, carry_in)
        masked = result & ((1 << self.bits) - 1)

        new_work = []
        edges = self.outputs.points.get('0', [])
        for edge in edges:
            edge.propagate(masked)
            new_work += edge.get_dest_nodes()
        return new_work
    

class Adder(Arithmetic):
    """Adder performs a + b (+ carry if present)"""
    kind = 'Adder'

    def __init__(self, num_inputs=3, num_outputs=2, label='', bits=1):
        super().__init__(
            kind=Adder.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def operator(self, v1, v2, carryIn=0):
        return v1 + v2 + (1 if carryIn else 0)

    def propagate(self):
        values = [e.value if e is not None else 0 for e in self.inputs.get_edges()]

        a, b = values[0], values[1]
        carry_in = values[2] if len(values) > 2 else 0

        total = self.operator(a, b, carry_in)
        sum = total & ((1 << self.bits) - 1)                                        # sum: lower bits
        carryOut = (total >> self.bits) & 1                                         # carryOut: the bit just above the highest bit

        new_work = []

        for edge in self.outputs.points.get('0', []):                               # propagate sum on output port 0 (first ouput port)
            edge.propagate(sum)
            new_work += edge.get_dest_nodes()

        for edge in self.outputs.points.get('1', []):                               # propagate carryOut on output port 1 (second output port)
            edge.propagate(carryOut)
            new_work += edge.get_dest_nodes()

        return new_work

    """class Subtract():

    class Multiple():

    class Division():

    class BarrelShifter():

    class Comparator():

    class Negation():

    class SignExtend():

    class BitCounter():"""