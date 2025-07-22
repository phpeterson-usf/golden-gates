import sys
sys.path.append('../')
from ggl import circuit, logic, io, wires, plexers

# Build the circuit
from ggl import io, logic, circuit, wires

circuit0 = circuit.Circuit(js_logging=True)

input1 = io.Input(bits=1, label="r")
input1.value = 0

input2 = io.Input(bits=1, label="s")
input2.value = 1

nor2 = logic.Nor()
circuit0.connect(input2, nor2.input("1"))    # input2 -> nor2.in[1]

nor1 = logic.Nor()
circuit0.connect(input1, nor1.input("0"))    # input1 -> nor1.in[0]
circuit0.connect(nor2, nor1.input("1"))    # nor2 -> nor1.in[1]
circuit0.connect(nor1, nor2.input("0"))    # nor1 -> nor2.in[0]

output1 = io.Output(bits=1, label="Q", js_id="output_1")
circuit0.connect(nor1, output1)    # nor1 -> output1

output2 = io.Output(bits=1, label="notQ", js_id="output_2")
circuit0.connect(nor2, output2)    # nor2 -> output2

sr_latch = circuit.Component(circuit0)

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(bits=1, label="CLK")
input0.value = 0
input1 = io.Input(bits=1, label="D")
input1.value = 0
input2 = io.Input(bits=1, label="CLR")
input2.value = 0
or0 = logic.Or()
and0 = logic.And(inverted_inputs=[1])
sr_latch_1 = sr_latch()
and1 = logic.And(inverted_inputs=[1])
and2 = logic.And()
output0 = io.Output(bits=1, label="Q", js_id="output_1_1753221650549")
output1 = io.Output(bits=1, label="notQ", js_id="output_2_1753221652561")

circuit0.connect(and1, sr_latch_1.input("r"))    # and1 -> sr_latch_1.in[0]
circuit0.connect(and2, sr_latch_1.input("s"))    # and2 -> sr_latch_1.in[1]
circuit0.connect(input1, and0.input("0"))    # input1 -> and0.in[0]
circuit0.connect(input0, or0.input("0"))    # input0 -> or0.in[0]
circuit0.connect(input2, or0.input("1"))    # input2 -> or0.in[1]
circuit0.connect(sr_latch_1.output("Q"), output0)    # sr_latch_1 -> output0
circuit0.connect(sr_latch_1.output("notQ"), output1)    # sr_latch_1.out[1] -> output1
circuit0.connect(input2, and0.input("1"))    # input2 -> and0.in[1]

# Export as a reusable component
#d_latch_clr = circuit.Component(circuit0)
circuit0.run()
print("Q: ", output0.value)
print("~Q: ", output1.value)