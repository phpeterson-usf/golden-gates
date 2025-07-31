import sys
sys.path.append('../')

from ggl import circuit, io, memory

c = circuit.Circuit()

d = io.Input(bits=1, label='D')
clk = io.Clock(label='CLK')
en = io.Input(bits=1, label='EN')
r = memory.Register(bits=1)
q = io.Output(bits=1, label='Q')

# Connect the components
c.connect(d, r.input('D'))
c.connect(clk, r.input('CLK'))
c.connect(en, r.input('en'))
c.connect(r.output('Q'), q)

# Set inputs
d.value = 1
en.value = 1

# Step combinational logic first (EN/D prep)
c.step()

# Tick the clock manually (rising edge)
clk.tick()
c.step(rising_edge=True)

# Step again to stabilize any output change
c.step()

# Check output
print(q.value)