import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic

c = circuit.Circuit()
g = arithmetic.Negation(bits=8, label='r')

a = io.Input(bits=8, label='a')
a.value = 0b10011011                # 155
c.connect(a, g.input('in'))

r = io.Output(bits=8, label='r')
c.connect(g, r)

c.run()                             # output should be 101
print(r.value)

c.stop()