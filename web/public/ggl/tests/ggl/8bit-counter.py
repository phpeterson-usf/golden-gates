import sys
sys.path.append('../')
from ggl import arithmetic, circuit, io, memory

# Build the circuit
circuit0 = circuit.Circuit()
clk = io.Clock(label="CLK", mode="manual")
reg = memory.Register(label="REG", bits=8)
adder = arithmetic.Adder(label="+", bits=8)
out = io.Output(label="count", bits=8)
const_en = io.Constant(bits=1); const_en.value = 1
const_inc = io.Constant(bits=8); const_inc.value = 1
const_cin = io.Constant(bits=1); const_cin.value = 0

# Connect components
circuit0.connect(clk, reg.input("CLK"))
circuit0.connect(const_en, reg.input("en"))
circuit0.connect(const_inc, adder.input("b"))
circuit0.connect(const_cin, adder.input("cin"))
circuit0.connect(adder.output("sum"), reg.input("D"))
circuit0.connect(reg.output("Q"), out)
circuit0.connect(reg.output("Q"), adder.input("a"))

# Simulate 12 clock cycles
values = []
for _ in range(12):
    clk.tick()
    circuit0.step()
    print(out.value)
