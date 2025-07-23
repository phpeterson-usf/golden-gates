import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic

c = circuit.Circuit()
g = arithmetic.BitCounter(bits=8, label='r')

a = io.Input(bits=8, label='a')
a.value = 155                       # 0b10011011
c.connect(a, g.input("0"))

r = io.Output(bits=8, label='r')
c.connect(g, r)

c.run()                             # output should be 5
print(r.value)