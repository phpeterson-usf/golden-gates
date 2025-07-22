import sys
sys.path.append('../')

from ggl import circuit, io, memory

cir0 = circuit.Circuit()
reg0 = memory.Register(bits=8)

din = io.Input(label='D', bits=8)
din.value = 0xAB
cir0.connect(din, reg0.input('D'))

en = io.Input(label='en', bits=1)
en.value = 1
cir0.connect(en, reg0.input('en'))

clk = io.Input(label='CLK', bits=1)
clk.value = 1
cir0.connect(clk, reg0.input('CLK'))

q = io.Output(label='Q')
cir0.connect(reg0.output('Q'), q)

cir0.run()
print(hex(q.value))  # expect 0xAB
