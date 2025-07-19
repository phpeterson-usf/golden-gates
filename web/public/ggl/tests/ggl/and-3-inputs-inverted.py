import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit()

a = io.Input(bits=1, label="A")
a.value = 0b0

b = io.Input(bits=1, label="B")
b.value = 0b1

c = io.Input(bits=1, label="C")
c.value = 0b0

and1 = logic.And(num_inputs=3, bits=1, inverted_inputs=[0,2])
circuit0.connect(a, and1.input("0"))    # a -> and1.in[0]
circuit0.connect(b, and1.input("1"))    # b -> and1.in[1]
circuit0.connect(c, and1.input("2"))    # c -> and1.in[2]

r = io.Output(bits=1, label="R")
circuit0.connect(and1, r)    # and1 -> r

circuit0.run()
print(r.value)  # expected: 1