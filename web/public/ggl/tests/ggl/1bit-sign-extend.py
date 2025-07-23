import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic

c = circuit.Circuit()
g = arithmetic.SignExtend(bits=1, label='r',input_width=1,output_width=8)

a = io.Input(bits=1, label='a')
a.value = 0b1                       # input 1bit 1
c.connect(a, g.input("0"))

r = io.Output(bits=16, label='r')
c.connect(g, r)

c.run()                             # should return 0b11111111 = 255
print(r.value)