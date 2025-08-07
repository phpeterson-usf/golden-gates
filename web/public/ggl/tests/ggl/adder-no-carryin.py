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

adder = arithmetic.Adder(bits=4, label="adder")

sum = io.Output(bits=4, label="sum")
cout = io.Output(bits=1, label="carryOut")


c.connect(a, adder.input('a'))
c.connect(b, adder.input('b'))
c.connect(cin, adder.input('cin'))
c.connect(adder.output('sum'), sum)
c.connect(adder.output('cout'), cout)


c.run()
print(sum.value)
c.stop()