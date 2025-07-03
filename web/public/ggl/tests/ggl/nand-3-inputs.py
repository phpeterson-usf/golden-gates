import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit()

a = io.Input(bits=4, label="A")
a.value = 0b1101                # 13

b = io.Input(bits=4, label="B")
b.value = 0xF                   # 0b1111 15

c = io.Input(bits=4, label="C")
c.value = 5                     # 0b101

nand1 = logic.Nand(num_inputs=3, bits=4)
circuit0.connect(a, nand1.input("0"))
circuit0.connect(b, nand1.input("1"))
circuit0.connect(c, nand1.input("2"))

r = io.Output(bits=4, label="R")
circuit0.connect(nand1, r)

circuit0.run()
print(r.value)                  # output should be 10 or 0b1010