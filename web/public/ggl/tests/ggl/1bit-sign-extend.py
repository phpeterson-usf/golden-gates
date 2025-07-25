import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic

c = circuit.Circuit()
ext = arithmetic.SignExtend(label='r',in_bits=1, out_bits=8)

a = io.Input(bits=1, label='a')
a.value = 0b1                    # input 1bit 1
c.connect(a, ext.input('in'))

r = io.Output(bits=8, label='r')
c.connect(ext, r)

c.run()                             # should return 0b11111111 = 255
print(r.value)