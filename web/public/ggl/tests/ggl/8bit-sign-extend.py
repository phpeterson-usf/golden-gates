import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import arithmetic

c = circuit.Circuit()
g = arithmetic.SignExtend(bits=8, label='r',input_width=8,output_width=16)

a = io.Input(bits=8, label='a')
a.value = 0b10011011                # 155
c.connect(a, g.input("0"))

r = io.Output(bits=16, label='r')
c.connect(g, r)

c.run()                             # output should be 65435
print(r.value)