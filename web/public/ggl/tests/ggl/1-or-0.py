# Seems gross but works
import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

c = circuit.Circuit()
g = logic.Or(bits=1, label='r')

a = io.Input(bits=1, label='a')
a.value = 0b1
c.connect(a, g.input("0"))

b = io.Input(bits=1, label='b')
b.value = 0b0
c.connect(b, g.input("1"))

r = io.Output(bits=1, label='r')
c.connect(g, r)

c.run()
print(r.value)