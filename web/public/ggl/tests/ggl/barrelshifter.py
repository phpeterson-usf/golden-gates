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


c.connect(a, sll.input('in'))  # value to shift
c.connect(b, sll.input('shift'))  # amount to shift
c.connect(sll.output('out'), out)


c.run()
print(bin(out.value))

srl = arithmetic.BarrelShifter(bits=4, direction='right', mode='logical', label='rightshiftlogical')
outSRL = io.Output(bits=4, label="out_right")


c.connect(a, srl.input('in'))
c.connect(b, srl.input('shift'))
c.connect(srl.output('out'), outSRL)

c.run()
print(bin(outSRL.value))

sra = arithmetic.BarrelShifter(bits=4, direction='right', mode='arithmetic', label='rightshiftarithmetic')
outSRA = io.Output(bits=4, label="out_right")


c.connect(a, sra.input('in'))
c.connect(b, sra.input('shift'))
c.connect(sra.output('out'), outSRA)

c.run()
print(bin(outSRA.value))
c.stop()