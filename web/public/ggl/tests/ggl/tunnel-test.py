import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import wires

circuit0 = circuit.Circuit()

a = io.Input(bits=4, label="a")
a.value = 0b1011                                                    # input val 3

tunnel1 = wires.Tunnel(label="tunnel", bits=4, direction='input')
tunnel2 = wires.Tunnel(label="tunnel", bits=4, direction='output')

r = io.Output(bits=4, label="R")
s = io.Output(bits=4, label="S")

circuit0.connect(a, tunnel1)
circuit0.connect(tunnel2, r)
circuit0.connect(tunnel2, s)

circuit0.run()


print(r.value)
print(s.value)