import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

c = circuit.Circuit()

a = io.Input(bits=1, label="a")
a.value = 0b1

n = logic.Not(bits=1, label="n")
c.connect(a, n.input("0"))

out = io.Output(bits=1, label="out")
c.connect(n, out)

c.step()
print("Step 1 Output:", out.value)

a.value = 0b0
c.step()
print("Step 2 Output:", out.value)