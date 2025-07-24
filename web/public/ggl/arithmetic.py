from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger('operator')

class Arithmetic(BitsNode):
    def __init__(self, kind, label='', bits=1, named_inputs=None, named_outputs=None):
        super().__init__(
            kind=kind,
            label=label,
            bits=bits,
            named_inputs=named_inputs or [],
            named_outputs=named_outputs or []
            )
        self.label = label
    
    def clone(self, instance_id):
        """Clone an Arithmetic Component with proper parameters"""
        new_label = f"{self.label}_{instance_id}" if self.label else ""
        return self.__class__(
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
    a = 'a'
    b = 'b'
    carryIn = 'cin'
    sum = 'sum'
    carryOut = 'cout'

    def __init__(self, label='', bits=1):
        super().__init__(
            kind=Adder.kind,
            label=label,
            bits=bits,
            named_inputs=[Adder.a, Adder.b, Adder.carryIn],
            named_outputs=[Adder.sum, Adder.carryOut]
            )

    def operator(self, v1, v2, carryIn=0):
        total = v1 + v2 + (1 if carryIn else 0)
        sum = total & ((1 << self.bits) - 1)                                        # sum: lower bits
        carryOut = (total >> self.bits) & 1                                         # carryOut: the bit just above the highest bit
        return sum, carryOut

    def propagate(self):
        a = self.get_input_edge(Adder.a).value
        b = self.get_input_edge(Adder.b).value
        carryIn = self.get_input_edge(Adder.carryIn).value if self.get_input_edge(Adder.carryIn) else 0

        sum, carryOut = self.operator(a, b, carryIn)
        new_work = []

        for edge in self.outputs.points.get(Adder.sum, []):                             # propagate sum on output port 0 (first ouput port)
            edge.propagate(sum)
            new_work += edge.get_dest_nodes()

        for edge in self.outputs.points.get(Adder.carryOut, []):                        # propagate carryOut on output port 1 (second output port)
            edge.propagate(carryOut)
            new_work += edge.get_dest_nodes()

        return new_work

class Subtract(Arithmetic):
    """Subtract performs a - b (- carry if present)"""
    kind = 'Subtract'
    a = 'a'
    b = 'b'
    carryIn = 'cin'
    difference = 'diff'
    carryOut = 'cout'

    def __init__(self, label='', bits=1):
        super().__init__(
            kind=Subtract.kind,
            label=label,
            bits=bits,
            named_inputs=[Subtract.a, Subtract.b, Subtract.carryIn],
            named_outputs=[Subtract.difference, Subtract.carryOut]
            )

    def operator(self, v1, v2, carryIn=0):
        result = v1 - v2 - (1 if carryIn else 0)
        difference = result & ((1 << self.bits) - 1)                                # difference: lower bits
        carryOut = (result >> self.bits) & 1                                        # carryOut: the bit just above the highest bit
        return difference, carryOut

    def propagate(self):
        a = self.get_input_edge(Subtract.a).value
        b = self.get_input_edge(Subtract.b).value
        carryIn = self.get_input_edge(Subtract.carryIn).value if self.get_input_edge(Subtract.carryIn) else 0

        difference, carryOut = self.operator(a, b, carryIn)
        new_work = []

        for edge in self.outputs.points.get(Subtract.difference, []):                             # propagate sum on output port 0 (first ouput port)
            edge.propagate(difference)
            new_work += edge.get_dest_nodes()

        for edge in self.outputs.points.get(Subtract.carryOut, []):                        # propagate carryOut on output port 1 (second output port)
            edge.propagate(carryOut)
            new_work += edge.get_dest_nodes()

        return new_work

class Multiply(Arithmetic):
    """Multiple performs a * b"""
    kind = 'Multiply'
    a = 'a'
    b = 'b'
    product = 'mul'

    def __init__(self, label='', bits=1):
        super().__init__(
            kind=Multiply.kind,
            label=label,
            bits=bits,
            named_inputs=[Multiply.a, Multiply.b],
            named_outputs=[Multiply.product]
            )

    def operator(self, v1, v2, carryIn=0):
        return v1 * v2
    
    def propagate(self):
        a = self.get_input_edge(Multiply.a).value
        b = self.get_input_edge(Multiply.b).value

        product = self.operator(a, b)

        new_work = []
        for edge in self.outputs.points.get(Multiply.product, []):
            edge.propagate(product)
            new_work += edge.get_dest_nodes()

        return new_work

class Division(Arithmetic):
    """Division performs a / b"""
    kind = 'Division'
    a = 'a'
    b = 'b'
    quotient = 'quot'
    remainder = 'rem'

    def __init__(self, label='', bits=1):
        super().__init__(
            kind=Division.kind,
            label=label,
            bits=bits,
            named_inputs=[Division.a, Division.b],
            named_outputs=[Division.quotient, Division.remainder]
            )

    def operator(self, v1, v2):
        return v1 / v2 , v1 % v2
    
    def propagate(self):
        a = self.get_input_edge(Division.a).value
        b = self.get_input_edge(Division.b).value

        quotient, remainder = self.operator(a, b)

        new_work = []
        for edge in self.outputs.points.get(Division.quotient, []):
            edge.propagate(quotient)
            new_work += edge.get_dest_nodes()
        for edge in self.outputs.points.get(Division.remainder, []):
            edge.propagate(remainder)
            new_work += edge.get_dest_nodes()

        return new_work

class Comparator(Arithmetic):
    """Compares values a and b"""
    kind = 'Comparator'
    a = 'a'
    b = 'b'
    gt = 'gt'
    eq = 'eq'
    lt = 'lt'
    def __init__(self, label='', bits=1):
        super().__init__(
            kind=Comparator.kind,
            label=label,
            bits=bits,
            named_inputs=[Comparator.a, Comparator.b],
            named_outputs=[Comparator.gt, Comparator.eq, Comparator.lt]
            )

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
        a = self.get_input_edge(Comparator.a).value
        b = self.get_input_edge(Comparator.b).value

        gt, eq, lt = self.operator(a, b)

        new_work = []
        for edge in self.outputs.points.get(Comparator.gt, []):
            edge.propagate(gt)
            new_work += edge.get_dest_nodes()
        for edge in self.outputs.points.get(Comparator.eq, []):
            edge.propagate(eq)
            new_work += edge.get_dest_nodes()
        for edge in self.outputs.points.get(Comparator.lt, []):
            edge.propagate(lt)
            new_work += edge.get_dest_nodes()

        return new_work

class BarrelShifter(Arithmetic):
    """Shift a 'b' amount of times to either the right or left"""
    kind = 'BarrelShifter'
    a = 'a'
    b = 'shift'
    result = 'out'

    def __init__(self, label='', bits=1, direction='left', mode='logical'):
        self.direction = direction
        self.mode = mode
        super().__init__(
            kind=BarrelShifter.kind,
            label=label,
            bits=bits,
            named_inputs=[BarrelShifter.a, BarrelShifter.b],
            named_outputs=[BarrelShifter.result]
            )

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

    def propagate(self):
        a = self.get_input_edge(BarrelShifter.a).value
        b = self.get_input_edge(BarrelShifter.b).value

        result = self.operator(a, b)

        new_work = []
        for edge in self.outputs.points.get(BarrelShifter.result, []):
            edge.propagate(result)
            new_work += edge.get_dest_nodes()

        return new_work

class Negation(Arithmetic):
    """Performs negation of input"""
    kind = 'Negation'
    inport = 'in'
    outport = 'out'

    def __init__(self, label='', bits=1):
        super().__init__(
            kind=Negation.kind,
            label=label,
            bits=bits,
            named_inputs=[Negation.inport],
            named_outputs=[Negation.outport])

    def operator(self, v1):
        return (-v1) & ((1 << self.bits) - 1)                                       
    
    def propagate(self):
        v = self.get_input_edge(Negation.inport).value
        result = self.operator(v)

        new_work = []
        for edge in self.outputs.points.get(Negation.outport, []):
            edge.propagate(result)
            new_work += edge.get_dest_nodes()

        return new_work
    
class SignExtend(Arithmetic):
    """Performs sign extension of input"""
    kind = 'SignExtend'
    inport = 'in'
    outport = 'out'

    def __init__(self, label='', bits=1, input_width=1, output_width=1):
        self.input_width = input_width
        self.output_width = output_width
        super().__init__(
            kind=SignExtend.kind,
            label=label,
            bits=bits,            
            named_inputs=[SignExtend.inport],
            named_outputs=[SignExtend.outport]
            )
    
    def operator(self, v1):
        sign_bit = (v1 >> (self.input_width - 1)) & 1
        if sign_bit:
            extension = ((1 << (self.output_width - self.input_width)) - 1) << self.input_width
            extended = v1 | extension
        else:
            extended = v1 & ((1 << self.input_width) - 1)
        return extended & ((1 << self.output_width) - 1)
    
    def propagate(self):
        v = self.get_input_edge(SignExtend.inport).value
        result = self.operator(v)

        new_work = []
        for edge in self.outputs.points.get(SignExtend.outport, []):
            edge.propagate(result)
            new_work += edge.get_dest_nodes()

        return new_work
        

class BitCounter(Arithmetic):
    """Counts number of 1-bits for input"""
    kind = 'BitCounter'
    inport = 'in'
    outport = 'count'

    def __init__(self, label='', bits=1):
        super().__init__(
            kind=BitCounter.kind,
            label=label,
            bits=bits,
            named_inputs=[BitCounter.inport],
            named_outputs=[BitCounter.outport]
            )
    
    def operator(self, v1):
        return bin(v1 & ((1 << self.bits) - 1)).count('1')
    
    def propagate(self):
        v = self.get_input_edge(BitCounter.inport).value
        count = self.operator(v)

        new_work = []
        for edge in self.outputs.points.get(BitCounter.outport, []):
            edge.propagate(count)
            new_work += edge.get_dest_nodes()

        return new_work