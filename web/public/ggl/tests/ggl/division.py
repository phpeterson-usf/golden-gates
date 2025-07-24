import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic


c = circuit.Circuit()

a = io.Input(bits=4, label="a")
b = io.Input(bits=4, label="b")
a.value = 12  
b.value = 8    

div = arithmetic.Division(bits=4, label="div")

quotient = io.Output(bits=4, label="quotient")
remainder = io.Output(bits=4, label="remainder")


c.connect(a, div.input('a'))
c.connect(b, div.input('b'))
c.connect(div.output('quot'), quotient)
c.connect(div.output('rem'), remainder)


c.run()
print(quotient.value)
print(remainder.value)