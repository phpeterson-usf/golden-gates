from .node import BitsNode
from .ggl_logging import new_logger

logger = new_logger(__name__)


class Arithmetic(BitsNode):
    def __init__(self, kind, label='', bits=1, named_inputs=[], named_outputs=[]):
        super().__init__(
            kind=kind,
            label=label,
            bits=bits,
            named_inputs=named_inputs,
            named_outputs=named_outputs
        )

    def operator(self, v1, v2, carryIn=0):
        logger.error(
            f'Arithmetic operator() must be implemented for {self.kind}')


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
        # sum: lower bits
        sum = total & ((1 << self.bits) - 1)
        # carryOut: the bit just above the highest bit
        carryOut = (total >> self.bits) & 1
        return sum, carryOut

    def propagate(self, output_name='0', value=0):
        a = self.inputs.read_value(Adder.a)
        b = self.inputs.read_value(Adder.b)
        carryIn = self.inputs.read_value(Adder.carryIn)

        sum, carryOut = self.operator(a, b, carryIn)

        new_work = super().propagate(output_name=Adder.sum, value=sum)
        new_work += super().propagate(output_name=Adder.carryOut, value=carryOut)
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
        # difference: lower bits
        difference = result & ((1 << self.bits) - 1)
        # carryOut: the bit just above the highest bit
        carryOut = (result >> self.bits) & 1
        return difference, carryOut

    def propagate(self, output_name='0', value=0):
        a = self.inputs.read_value(Subtract.a)
        b = self.inputs.read_value(Subtract.b)
        carryIn = self.inputs.read_value(Subtract.carryIn)

        difference, carryOut = self.operator(a, b, carryIn)
        new_work = super().propagate(output_name=Subtract.difference, value=difference)
        new_work += super().propagate(output_name=Subtract.carryOut, value=carryOut)
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

    def propagate(self, output_name='0', value=0):
        a = self.inputs.read_value(Multiply.a)
        b = self.inputs.read_value(Multiply.b)
        product = self.operator(a, b)
        new_work = super().propagate(output_name=Multiply.product, value=product)
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
        return v1 // v2, v1 % v2

    def propagate(self, output_name='0', value=0):
        a = self.inputs.read_value(Division.a)
        b = self.inputs.read_value(Division.b)
        quotient, remainder = self.operator(a, b)
        new_work = super().propagate(output_name=Division.quotient, value=quotient)
        new_work += super().propagate(output_name=Division.remainder, value=remainder)
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
        complist = [0, 0, 0]
        if v1 > v2:
            complist[0] = 1
        elif v1 == v2:
            complist[1] = 1
        elif v1 < v2:
            complist[2] = 1
        return complist

    def propagate(self, output_name='0', value=0):
        a = self.inputs.read_value(Comparator.a)
        b = self.inputs.read_value(Comparator.b)
        gt, eq, lt = self.operator(a, b)
        new_work = super().propagate(output_name=Comparator.gt, value=gt)
        new_work += super().propagate(output_name=Comparator.eq, value=eq)
        new_work += super().propagate(output_name=Comparator.lt, value=lt)
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

    def propagate(self, output_name='0', value=0):
        a = self.inputs.read_value(BarrelShifter.a)
        b = self.inputs.read_value(BarrelShifter.b)
        v = self.operator(a, b)
        new_work = super().propagate(output_name=BarrelShifter.result, value=v)
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

    def propagate(self, output_name='0', value=0):
        v = self.inputs.read_value(Negation.inport)
        v = self.operator(v)
        new_work = super().propagate(output_name=Negation.outport, value=v)
        return new_work


class SignExtend(Arithmetic):
    """Performs sign extension of input"""
    kind = 'SignExtend'
    inport = 'in'
    outport = 'out'

    def __init__(self, label='', bits=1, in_bits=1, out_bits=1):
        self.input_width = in_bits
        self.output_width = out_bits
        super().__init__(
            kind=SignExtend.kind,
            label=label,
            bits=out_bits,
            named_inputs=[SignExtend.inport],
            named_outputs=[SignExtend.outport]
        )

    def operator(self, v1):
        sign_bit = (v1 >> (self.in_bits - 1)) & 1
        if sign_bit:
            extension = (
                (1 << (self.out_bits - self.in_bits)) - 1) << self.in_bits
            extended = v1 | extension
        else:
            extended = v1 & ((1 << self.in_bits) - 1)
        return extended & ((1 << self.out_bits) - 1)

    def propagate(self, output_name='0', value=0):
        v = self.inputs.read_value(SignExtend.inport)
        v = self.operator(v)
        new_work = super().propagate(output_name=SignExtend.outport, value=v)
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

    def propagate(self, output_name='0', value=0):
        v = self.inputs.read_value(BitCounter.inport)
        count = self.operator(v)
        new_work = self.outputs.write_value(BitCounter.outport, value=count)
        return new_work
