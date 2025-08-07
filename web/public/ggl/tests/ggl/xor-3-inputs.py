import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit()

a = io.Input(bits=4, label="A")
a.value = 0xA                           # 0b1010 10

b = io.Input(bits=4, label="B")
b.value = 12                            # 0b1100

c = io.Input(bits=4, label="C")
c.value = 0b0111                        # 7

xor1 = logic.Xor(num_inputs=3, bits=4)
circuit0.connect(a, xor1.input("0"))
circuit0.connect(b, xor1.input("1"))
circuit0.connect(c, xor1.input("2"))

r = io.Output(bits=4, label="R")
circuit0.connect(xor1, r)

circuit0.run()   
circuit0.stop()                       # output should be 1 0b0001
print(r.value) 