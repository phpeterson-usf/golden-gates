import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic

c = circuit.Circuit()
g = arithmetic.SignExtend(label='r',in_bits=8,out_bits=16)

a = io.Input(bits=8, label='a')
a.value = 0b10011011                # 155
c.connect(a, g.input('in'))

r = io.Output(bits=16, label='r')
c.connect(g, r)

c.run()                             # output should be 65435
print(r.value)