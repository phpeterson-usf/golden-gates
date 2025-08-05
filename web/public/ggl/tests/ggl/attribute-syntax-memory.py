import sys
sys.path.append('../')
from ggl import circuit, io, memory

# Test attribute-style syntax with memory components
circuit0 = circuit.Circuit()

# Create register
reg = memory.Register(bits=8)
clk = io.Input(bits=1)
data_in = io.Input(bits=8)
enable = io.Input(bits=1)
data_out = io.Output(bits=8)

# NEW attribute syntax for memory ports
circuit0.connect(data_in, reg.D)      # instead of reg.input("D")
circuit0.connect(clk, reg.CLK)        # instead of reg.input("CLK")  
circuit0.connect(enable, reg.en)      # instead of reg.input("en")
circuit0.connect(reg.Q, data_out)     # instead of reg.output("Q")

# Test
data_in.value = 0xAB
enable.value = 1
clk.value = 1
circuit0.run()

print(hex(data_out.value))