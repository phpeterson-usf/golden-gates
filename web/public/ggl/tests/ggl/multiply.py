import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic


c = circuit.Circuit()

a = io.Input(bits=7, label="a")
b = io.Input(bits=7, label="b")
a.value = 9     # 0b1001
b.value = 6     # 0b0110

multiply = arithmetic.Multiply(bits=7, label="multiply")

product = io.Output(bits=7, label="product")


c.connect(a, multiply.input('a'))
c.connect(b, multiply.input('b'))
c.connect(multiply.output('mul'), product)


c.run()
print(product.value)
c.stop()