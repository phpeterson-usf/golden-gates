import sys
sys.path.append('../')

from ggl import circuit, component, io, logic, memory, plexers, wires

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(bits=4, label="A")
input0.value = 1
input1 = io.Input(bits=1, label="B")
input1.value = 1

# These are the RISC-V machine code instruction words for quadratic_s
rom0 = memory.ROM(address_bits=4, data_bits=32, data=[44368563, 45253299, 46465843, 6456627, 13960499, 32871, 3221229683, 0, 0, 0, 0, 0, 0, 0, 0, 0], label="ROM")
output0 = io.Output(bits=32, label="D", js_id="output_1_1753314621216")

circuit0.connect(input0, rom0.input("A"))    # input0 -> rom0.in[0]
circuit0.connect(input1, rom0.input("sel"))    # input1 -> rom0.in[1]
circuit0.connect(rom0.output("D"), output0)    # rom0 -> output0
circuit0.run()

print(hex(output0.value))  # expected: 0x2b282b3
circuit0.stop()