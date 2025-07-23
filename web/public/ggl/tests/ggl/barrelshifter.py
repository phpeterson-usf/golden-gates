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


c.connect(a, sll.input("0"))  # value to shift
c.connect(b, sll.input("1"))  # amount to shift
c.connect(sll.output("0"), out)


c.run()
print(bin(out.value))

srl = arithmetic.BarrelShifter(bits=4, direction='right', mode='logical', label='rightshiftlogical')
outSRL = io.Output(bits=4, label="out_right")


c.connect(a, srl.input("0"))
c.connect(b, srl.input("1"))
c.connect(srl.output("0"), outSRL)

c.run()
print(bin(outSRL.value))

sra = arithmetic.BarrelShifter(bits=4, direction='right', mode='arithmetic', label='rightshiftarithmetic')
outSRA = io.Output(bits=4, label="out_right")


c.connect(a, sra.input("0"))
c.connect(b, sra.input("1"))
c.connect(sra.output("0"), outSRA)

c.run()
print(bin(outSRA.value))