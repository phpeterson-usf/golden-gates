import sys
sys.path.append('../')

from ggl import io, circuit, plexers

circuit0 = circuit.Circuit()
mux0 = plexers.Multiplexer(selector_bits=2, bits=8, label='mux0')

sel = io.Input(bits=2, label='SEL')
sel.value = 0b01
circuit0.connect(sel, mux0.input("sel"))

a = io.Input(bits=8, label='A')
a.value = 0xAA
circuit0.connect(a, mux0.input("0"))

b = io.Input(bits=8, label='B')
b.value = 0xBB
circuit0.connect(b, mux0.input("1"))

c = io.Input(bits=8, label='C')
c.value = 0xCC
circuit0.connect(c, mux0.input("2"))

d = io.Input(bits=8, label='D')
d.value = 0xDD
circuit0.connect(d, mux0.input("3"))

r = io.Output(bits=8, label='R')
circuit0.connect(mux0, r)

circuit0.run()
print(hex(r.value)) # expect 0xBB
circuit0.stop()