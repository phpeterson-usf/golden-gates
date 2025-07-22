import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

c = circuit.Circuit()

clk = io.Clock(frequency=1, label="clk")
c.all_nodes.add(clk)

d = io.Input(bits=1, label="d")
d.value = 0b1

and_gate = logic.And(bits=1, label="and")
c.connect(clk, and_gate.input("0"))
c.connect(d, and_gate.input("1"))

out = io.Output(bits=1, label="out")
c.connect(and_gate, out)

c.run()

print("Clocked Output:", out.value)