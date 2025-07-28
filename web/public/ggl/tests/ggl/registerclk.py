import sys
sys.path.append('../')

from ggl import circuit, io, memory

c = circuit.Circuit()

d = io.Input(bits=1, label='D')
clk = io.Clock(frequency=1,label='CLK')
en = io.Input(bits=1, label='EN')

r = memory.Register(bits=1)
q = io.Output(bits=1, label='Q')

c.connect(d, r.input('D'))
c.connect(clk, r.input('CLK'))
c.connect(en, r.input('en'))
c.connect(r.output('Q'), q)

d.value = 1
en.value = 1

c.run()

print(q.value)