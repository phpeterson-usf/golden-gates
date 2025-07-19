import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit()

a = io.Input(bits=4, label="A")
a.value = 0b1110  # inverted: 0b0001

b = io.Input(bits=4, label="B")
b.value = 0b1101  # inverted: 0b00010

c = io.Input(bits=4, label="C")
c.value = 0b1011  # inverted: 0b0100

or1 = logic.Or(bits=4, num_inputs=3, inverted_inputs=[0,1,2])
circuit0.connect(a, or1.input("0"))    # a -> or1.in[0]
circuit0.connect(b, or1.input("1"))    # b -> or1.in[1]
circuit0.connect(c, or1.input("2"))    # c -> or1.in[2]

r = io.Output(bits=4, label="R")
circuit0.connect(or1, r)    # or1 -> r

circuit0.run()
print(r.value)  # expected: 7