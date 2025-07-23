import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic

c = circuit.Circuit()

a = io.Input(bits=4, label="a")
b = io.Input(bits=4, label="b")

a.value = 0b1010
b.value = 1

# Create barrel shifter (left shift, logical mode)
sll = arithmetic.BarrelShifter(bits=4, direction='left', mode='logical', label='leftshift')

out = io.Output(bits=4, label="out")


c.connect(a, sll.input('a'))  # value to shift
c.connect(b, sll.input('b'))  # amount to shift
c.connect(sll.output('result'), out)


c.run()
print(bin(out.value))

srl = arithmetic.BarrelShifter(bits=4, direction='right', mode='logical', label='rightshiftlogical')
outSRL = io.Output(bits=4, label="out_right")


c.connect(a, srl.input('a'))
c.connect(b, srl.input('b'))
c.connect(srl.output('result'), outSRL)

c.run()
print(bin(outSRL.value))

sra = arithmetic.BarrelShifter(bits=4, direction='right', mode='arithmetic', label='rightshiftarithmetic')
outSRA = io.Output(bits=4, label="out_right")


c.connect(a, sra.input('a'))
c.connect(b, sra.input('b'))
c.connect(sra.output('result'), outSRA)

c.run()
print(bin(outSRA.value))