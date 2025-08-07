import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit()

a = io.Input(bits=8, label="A")
a.value = 0b1111

b = io.Input(bits=8, label="B")
b.value = 0xf0

c = io.Input(bits=8, label="C")
c.value = 0

or1 = logic.Or(bits=8, num_inputs=3)
circuit0.connect(c, or1.input("2"))    # c -> or1.in[2]
circuit0.connect(a, or1.input("0"))    # a -> or1.in[0]
circuit0.connect(b, or1.input("1"))    # b -> or1.in[1]

r = io.Output(bits=8, label="R")
circuit0.connect(or1, r)    # or1 -> r

circuit0.run()
print(r.value)  # expected: 255
circuit0.stop()