import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import wires

circuit0 = circuit.Circuit()

a = io.Input(bits=4, label="a")
a.value = 0b1011                                                    # input val 3

tunnel = wires.Tunnel(label="tunnel", bits=4)

r = io.Output(bits=4, label="R")
s = io.Output(bits=4, label="S")

circuit0.connect(a, tunnel)
circuit0.connect(tunnel, r)
circuit0.connect(tunnel, s)

circuit0.run()


print(r.value)
print(s.value)