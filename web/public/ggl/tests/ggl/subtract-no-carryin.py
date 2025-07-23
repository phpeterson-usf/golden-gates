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

sub = arithmetic.Subtract(bits=4, label="subtract")

difference = io.Output(bits=4, label="difference")
cout = io.Output(bits=1, label="carryOut")


c.connect(a, sub.input('a'))
c.connect(b, sub.input('b'))
c.connect(sub.output('difference'), difference)


c.run()
print(difference.value)