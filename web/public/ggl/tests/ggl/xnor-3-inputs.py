import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit()

a = io.Input(bits=4, label="A")
a.value = 0x3                           # 3 0b11

b = io.Input(bits=4, label="B")
b.value = 5                             # 0b101

c = io.Input(bits=4, label="C")
c.value = 0b1010                        # 10

xnor1 = logic.Xnor(num_inputs=3, bits=4)
circuit0.connect(a, xnor1.input("0"))
circuit0.connect(b, xnor1.input("1"))
circuit0.connect(c, xnor1.input("2"))

r = io.Output(bits=4, label="R")
circuit0.connect(xnor1, r)

circuit0.run()                          # output should be 3 / 0b11
circuit0.stop()
print(r.value) 