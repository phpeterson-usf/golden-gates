import sys
sys.path.append('../')
from ggl import circuit, io, plexers

# Test attribute-style syntax with plexer components  
circuit0 = circuit.Circuit()

# Create 4-to-1 multiplexer
inputs = [io.Input(bits=8) for i in range(4)]
selector = io.Input(bits=2)
mux = plexers.Multiplexer(selector_bits=2, bits=8)
output = io.Output(bits=8)

# Connect inputs (numbered ports still use old syntax)
circuit0.connect(inputs[0], mux.input("0"))
circuit0.connect(inputs[1], mux.input("1"))
circuit0.connect(inputs[2], mux.input("2"))
circuit0.connect(inputs[3], mux.input("3"))

# NEW attribute syntax for named ports
circuit0.connect(selector, mux.sel)        # instead of mux.input("sel")
circuit0.connect(mux.output("0"), output)

# Set input values
for i, inp in enumerate(inputs):
    inp.value = (i + 1) * 10  # 10, 20, 30, 40

# Test selector values
for sel_val in [0, 2]:
    selector.value = sel_val
    circuit0.run()
    print(output.value)