import sys
sys.path.append('../')

from ggl import circuit, io, memory

c = circuit.Circuit()
ram = memory.RAM(label='RAM', address_bits=2, data_bits=2)

a = io.Input(bits=2)
a.value = 0b00
c.connect(a, ram.A)

din = io.Input(bits=2)
din.value = 0b11
c.connect(din, ram.Din)

st = io.Input()
st.value = 1
c.connect(st, ram.st)

ld = io.Input()
ld.value = 1
c.connect(ld, ram.ld)

clk = io.Input()
clk.value = 1
c.connect(clk, ram.CLK)

d = io.Output(bits=2)
c.connect(ram.D, d)
c.run()

print(bin(d.value))  # expect 0b11

c.stop()