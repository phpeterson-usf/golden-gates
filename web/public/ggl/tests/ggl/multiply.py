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

multiply = arithmetic.Multiply(bits=4, label="multiply")

product = io.Output(bits=4, label="product")


c.connect(a, multiply.input("0"))
c.connect(b, multiply.input("1"))
c.connect(multiply.output("0"), product)


c.run()
print(product.value)