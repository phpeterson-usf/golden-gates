import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit()

a = io.Input(bits=8, label="A")
a.value = 0b00110011                        # 51

b = io.Input(bits=8, label="B")
b.value = 0x0F                              # 0b00001111 15

c = io.Input(bits=8, label="C")
c.value = 60                                # 0b00111100

nor1 = logic.Nor(num_inputs=3)
circuit0.connect(a, nor1.input("0"))
circuit0.connect(b, nor1.input("1"))
circuit0.connect(c, nor1.input("2"))

r = io.Output(bits=4, label="R")
circuit0.connect(nor1, r)

circuit0.run()                              # output should be 63/ 0b11111111
print(r.value) 