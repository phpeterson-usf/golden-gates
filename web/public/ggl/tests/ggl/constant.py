import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

c = circuit.Circuit()

output0 = io.Output(bits=32, label="R")
constant0 = io.Constant(bits=32, label="unimp")
constant0.value = 0xc0001073

c.connect(constant0, output0)    # and0 -> output0
c.run()
print(hex(output0.value))