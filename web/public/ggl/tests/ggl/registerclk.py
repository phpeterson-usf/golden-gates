import sys
sys.path.append('../')

from ggl import arithmetic, circuit, component, io, logic, memory, plexers, wires

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="D", bits=1, js_id="input_1_1753664610154")
input0.value = 1
input1 = io.Input(label="en", bits=1, js_id="input_2_1753664616186")
input1.value = 1
reg0 = memory.Register(label="REG", bits=1, js_id="register_1_1753664587934")
output0 = io.Output(label="Q", bits=1, js_id="output_1_1753664624799")
clk0 = io.Clock(frequency=1, js_id="clock_1_1753664632482")

circuit0.connect(clk0, reg0.input("CLK"))    # clk0 -> reg0.in[1]
circuit0.connect(input0, reg0.input("D"))    # input0 -> reg0.in[0]
circuit0.connect(input1, reg0.input("en"))    # input1 -> reg0.in[2]
circuit0.connect(reg0.output("Q"), output0)    # reg0 -> output0
circuit0.run()

print(output0.value)