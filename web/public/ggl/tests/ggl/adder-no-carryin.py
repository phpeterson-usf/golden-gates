import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic


c = circuit.Circuit()

a = io.Input(bits=4, label="a")
b = io.Input(bits=4, label="b")
a.value = 9     # 0b1001
b.value = 6     # 0b0110

adder = arithmetic.Adder(bits=4, label="adder")

sum = io.Output(bits=4, label="sum")
cout = io.Output(bits=1, label="carry_out")


c.connect(a, adder.input("0"))
c.connect(b, adder.input("1"))
c.connect(adder.output("0"), sum)


c.run()
print(sum.value)