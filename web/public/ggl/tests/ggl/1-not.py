import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

c = circuit.Circuit()
g = logic.Not(bits=1, label='r')

a = io.Input(bits=1, label='a')
a.value = 0b1
c.connect(a, g.input("0"))

r = io.Output(bits=1, label='r')
c.connect(g, r)

c.run()
c.stop()
print(r.value)