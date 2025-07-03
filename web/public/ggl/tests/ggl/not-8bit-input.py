import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

c = circuit.Circuit()
g = logic.Not(bits=8, label='r')

a = io.Input(bits=8, label='a')
a.value = 0b10011011                # 155
c.connect(a, g.input("0"))

r = io.Output(bits=8, label='r')
c.connect(g, r)

c.run()                             # output should be 0b01100100 / 100
print(r.value)