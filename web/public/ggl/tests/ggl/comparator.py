import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic


c = circuit.Circuit()

a = io.Input(bits=4, label="a")
b = io.Input(bits=4, label="b")
a.value = 9     
b.value = 6     

comp = arithmetic.Comparator(bits=4, label="multiply")

greater = io.Output(bits=1, label="greater")
equal = io.Output(bits=1, label="equal")
less = io.Output(bits=1, label="less")


c.connect(a, comp.input('a'))
c.connect(b, comp.input('b'))
c.connect(comp.output('gt'),greater)
c.connect(comp.output('eq'),equal)
c.connect(comp.output('lt'),less)


c.run()
print(greater.value)
print(equal.value)
print(less.value)

a.value = 6
b.value = 9

c.run()
print(greater.value)
print(equal.value)
print(less.value)

a.value = 6
b.value = 6

c.run()
print(greater.value)
print(equal.value)
print(less.value)