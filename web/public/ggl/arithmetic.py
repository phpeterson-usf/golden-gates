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
        
        carryIn = values[2] if len(values) > 2 else 0

        result = self.operator(a, b, carryIn)

        new_work = []
        edges = self.outputs.points.get('0', [])
        for edge in edges:
            edge.propagate(result)
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
        total = v1 + v2 + (1 if carryIn else 0)
        sum = total & ((1 << self.bits) - 1)                                        # sum: lower bits
        carryOut = (total >> self.bits) & 1                                         # carryOut: the bit just above the highest bit
        return sum, carryOut

    def propagate(self):
        values = [e.value if e is not None else 0 for e in self.inputs.get_edges()]

        a, b = values[0], values[1]
        carryIn = values[2] if len(values) > 2 else 0

        sum = self.operator(a, b, carryIn)[0]
        carryOut = self.operator(a, b, carryIn)[1]

        new_work = []

        for edge in self.outputs.points.get('0', []):                               # propagate sum on output port 0 (first ouput port)
            edge.propagate(sum)
            new_work += edge.get_dest_nodes()

        for edge in self.outputs.points.get('1', []):                               # propagate carryOut on output port 1 (second output port)
            edge.propagate(carryOut)
            new_work += edge.get_dest_nodes()

        return new_work

class Subtract(Arithmetic):
    """Subtract performs a - b (- carry if present)"""
    kind = 'Subtract'

    def __init__(self, num_inputs=3, num_outputs=2, label='', bits=1):
        super().__init__(
            kind=Subtract.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def operator(self, v1, v2, carryIn=0):
        result = v1 - v2 - (1 if carryIn else 0)
        difference = result & ((1 << self.bits) - 1)                                # difference: lower bits
        carryOut = (result >> self.bits) & 1                                        # carryOut: the bit just above the highest bit
        return difference, carryOut

    def propagate(self):
        values = [e.value if e is not None else 0 for e in self.inputs.get_edges()]

        a, b = values[0], values[1]
        carryIn = values[2] if len(values) > 2 else 0

        difference = self.operator(a, b, carryIn)[0]
        carryOut = self.operator(a, b, carryIn)[1]

        new_work = []

        for edge in self.outputs.points.get('0', []):                               # propagate difference on output port 0 (first ouput port)
            edge.propagate(difference)
            new_work += edge.get_dest_nodes()

        for edge in self.outputs.points.get('1', []):                               # propagate carryOut on output port 1 (second output port)
            edge.propagate(carryOut)
            new_work += edge.get_dest_nodes()

        return new_work

class Multiply(Arithmetic):
    """Multiple performs a * b"""
    kind = 'Multiply'

    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1):
        super().__init__(
            kind=Multiply.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def operator(self, v1, v2, carryIn=0):
        return v1 * v2

class Division(Arithmetic):
    """Division performs a / b"""
    kind = 'Division'

    def __init__(self, num_inputs=2, num_outputs=2, label='', bits=1):
        super().__init__(
            kind=Division.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def operator(self, v1, v2):
        return v1 / v2 , v1 % v2
    
    def propagate(self):
        values = [e.value if e is not None else 0 for e in self.inputs.get_edges()]

        a, b = values[0], values[1]

        quotient = self.operator(a, b)[0]
        remainder = self.operator(a, b)[1]

        new_work = []

        for edge in self.outputs.points.get('0', []):                               # propagate quotient on output port 0 (first ouput port)
            edge.propagate(quotient)
            new_work += edge.get_dest_nodes()

        for edge in self.outputs.points.get('1', []):                               # propagate remainder on output port 1 (second output port)
            edge.propagate(remainder)
            new_work += edge.get_dest_nodes()

        return new_work

class Comparator(Arithmetic):
    """Compares values a and b"""
    kind = 'Comparator'

    def __init__(self, num_inputs=2, num_outputs=3, label='', bits=1):
        super().__init__(
            kind=Comparator.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def operator(self, v1, v2):
        complist = [0,0,0]
        if v1 > v2:
            complist[0] = 1
        elif v1 == v2:
            complist[1] = 1
        elif v1 < v2:
            complist[2] = 1
        
        return complist
    
    def propagate(self):
        values = [e.value if e is not None else 0 for e in self.inputs.get_edges()]

        a, b = values[0], values[1]

        greaterThan = self.operator(a, b)[0]
        equal = self.operator(a, b)[1]
        lessThan = self.operator(a,b)[2]

        new_work = []

        for edge in self.outputs.points.get('0', []):                               # propagate a > b on output port 0 (first ouput port)
            edge.propagate(greaterThan)
            new_work += edge.get_dest_nodes()

        for edge in self.outputs.points.get('1', []):                               # propagate a=b on output port 1 (second output port)
            edge.propagate(equal)
            new_work += edge.get_dest_nodes()
        
        for edge in self.outputs.points.get('2', []):                               # propagate a < b on output port 2 (third output port)
            edge.propagate(lessThan)
            new_work += edge.get_dest_nodes()

        return new_work

class BarrelShifter(Arithmetic):
    """Shift a 'b' amount of times to either the right or left"""
    kind = 'BarrelShifter'

    def __init__(self, num_inputs=2, num_outputs=1, label='', bits=1, direction='left', mode='logical'):
        self.direction = direction
        self.mode = mode
        super().__init__(
            kind=BarrelShifter.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def operator(self, v1, v2, carryIn=0):
        if self.direction == 'right':
            if self.mode == 'arithmetic':
                sign_bit = (v1 >> (self.bits - 1)) & 1
                shifted = v1 >> v2
                if sign_bit:
                    mask = ((1 << v2) - 1) << (self.bits - v2)
                    shifted |= mask
                return shifted & ((1 << self.bits) - 1)
            else:
                return (v1 >> v2) & ((1 << self.bits) - 1)
        else:
            return (v1 << v2) & ((1 << self.bits) - 1)


class Negation(Arithmetic):
    """Performs negation of input"""
    kind = 'Negation'

    def __init__(self, num_inputs=1, num_outputs=1, label='', bits=1):
        super().__init__(
            kind=Negation.kind,
            num_inputs=num_inputs,
            num_outputs=num_outputs,
            label=label,
            bits=bits)

    def operator(self, v1):
        return (-v1) & ((1 << self.bits) - 1)                                       # same as not in logic gate
    
    def propagate(self):
        edge = self.inputs.get_edges()[0]
        value = edge.value if edge is not None else 0
        result = self.operator(value)

        new_work = []
        edges = self.outputs.points.get('0', [])
        for edge in edges:
            edge.propagate(result)
            new_work += edge.get_dest_nodes()
        return new_work
    
    """class SignExtend(Arithmetic):

    class BitCounter(Arithmetic):"""