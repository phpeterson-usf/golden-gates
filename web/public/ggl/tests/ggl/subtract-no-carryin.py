import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic


c = circuit.Circuit()

a = io.Input(bits=4, label="a")
b = io.Input(bits=4, label="b")
cin = io.Input(bits=1, label="cin")
a.value = 9     # 0b1001
b.value = 6     # 0b0110
cin.value = 0

sub = arithmetic.Subtract(bits=4, label="subtract")

difference = io.Output(bits=4, label="difference")

c.connect(a, sub.input('a'))
c.connect(b, sub.input('b'))
c.connect(cin, sub.input('cin'))
c.connect(sub.output('s'), difference)

c.run()
print(difference.value)
c.stop()