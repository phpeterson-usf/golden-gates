import sys
sys.path.append('../')

from ggl import circuit, io, memory, wires

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="en", bits=1, js_id="input_1_1753942793773")
input0.value = 1  # en = 1
input1 = io.Clock(label="CLK", frequency=1, mode="auto",js_id="input_2_1753942797910")
input3 = io.Input(label="D", bits=8, js_id="input_4_1753942799097")
input3.value = 1  # D = 1
d_flip_flop_1 = memory.Register(bits=1)
d_flip_flop_2 = memory.Register(bits=1)
d_flip_flop_3 = memory.Register(bits=1)
d_flip_flop_4 = memory.Register(bits=1)
d_flip_flop_5 = memory.Register(bits=1)
d_flip_flop_6 = memory.Register(bits=1)
d_flip_flop_7 = memory.Register(bits=1)
d_flip_flop_8 = memory.Register(bits=1)
splitter0 = wires.Splitter(bits=8, splits=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6), (7,7)], js_id="splitter_1_1753942944504")
merger0 = wires.Merger(bits=8, merge_inputs=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6), (7,7)], js_id="merger_1_1753943555286")
output0 = io.Output(label="Q", bits=8, js_id="output_1_1753943670102")

circuit0.connect(input1, d_flip_flop_1.input("CLK"))    # input1 -> d_flip_flop_1.in[3]
circuit0.connect(input0, d_flip_flop_1.input("en"))    # input0 -> d_flip_flop_1.in[1]
circuit0.connect(input1, d_flip_flop_2.input("CLK"))    # input1 -> d_flip_flop_2.in[3]
circuit0.connect(input0, d_flip_flop_2.input("en"))    # input0 -> d_flip_flop_2.in[1]
circuit0.connect(input1, d_flip_flop_3.input("CLK"))    # input1 -> d_flip_flop_3.in[3]
circuit0.connect(input0, d_flip_flop_3.input("en"))    # input0 -> d_flip_flop_3.in[1]
circuit0.connect(input1, d_flip_flop_4.input("CLK"))    # input1 -> d_flip_flop_4.in[3]
circuit0.connect(input0, d_flip_flop_4.input("en"))    # input0 -> d_flip_flop_4.in[1]
circuit0.connect(input1, d_flip_flop_5.input("CLK"))    # input1 -> d_flip_flop_5.in[3]
circuit0.connect(input0, d_flip_flop_5.input("en"))    # input0 -> d_flip_flop_5.in[1]
circuit0.connect(input1, d_flip_flop_6.input("CLK"))    # input1 -> d_flip_flop_6.in[3]
circuit0.connect(input0, d_flip_flop_6.input("en"))    # input0 -> d_flip_flop_6.in[1]
circuit0.connect(input1, d_flip_flop_7.input("CLK"))    # input1 -> d_flip_flop_7.in[3]
circuit0.connect(input0, d_flip_flop_7.input("en"))    # input0 -> d_flip_flop_7.in[1]
circuit0.connect(input1, d_flip_flop_8.input("CLK"))    # input1 -> d_flip_flop_8.in[3]
circuit0.connect(input0, d_flip_flop_8.input("en"))    # input0 -> d_flip_flop_8.in[1]
circuit0.connect(splitter0.output("0"), d_flip_flop_2.input("D"))    # splitter0 -> d_flip_flop_2.in[0]
circuit0.connect(splitter0.output("1"), d_flip_flop_3.input("D"))    # splitter0.out[1] -> d_flip_flop_3.in[0]
circuit0.connect(splitter0.output("2"), d_flip_flop_4.input("D"))    # splitter0.out[2] -> d_flip_flop_4.in[0]
circuit0.connect(splitter0.output("3"), d_flip_flop_5.input("D"))    # splitter0.out[3] -> d_flip_flop_5.in[0]
circuit0.connect(splitter0.output("4"), d_flip_flop_6.input("D"))    # splitter0.out[4] -> d_flip_flop_6.in[0]
circuit0.connect(splitter0.output("5"), d_flip_flop_7.input("D"))    # splitter0.out[5] -> d_flip_flop_7.in[0]
circuit0.connect(splitter0.output("6"), d_flip_flop_8.input("D"))    # splitter0.out[6] -> d_flip_flop_8.in[0]
circuit0.connect(splitter0.output("7"), d_flip_flop_1.input("D"))    # splitter0.out[7] -> d_flip_flop_1.in[0]
circuit0.connect(input3, splitter0)    # input3 -> splitter0
circuit0.connect(d_flip_flop_2.output("Q"), merger0.input("0"))    # d_flip_flop_2 -> merger0.in[0]
circuit0.connect(d_flip_flop_3.output("Q"), merger0.input("1"))    # d_flip_flop_3 -> merger0.in[1]
circuit0.connect(d_flip_flop_4.output("Q"), merger0.input("2"))    # d_flip_flop_4 -> merger0.in[2]
circuit0.connect(d_flip_flop_5.output("Q"), merger0.input("3"))    # d_flip_flop_5 -> merger0.in[3]
circuit0.connect(d_flip_flop_6.output("Q"), merger0.input("4"))    # d_flip_flop_6 -> merger0.in[4]
circuit0.connect(d_flip_flop_7.output("Q"), merger0.input("5"))    # d_flip_flop_7 -> merger0.in[5]
circuit0.connect(d_flip_flop_8.output("Q"), merger0.input("6"))    # d_flip_flop_8 -> merger0.in[6]
circuit0.connect(d_flip_flop_1.output("Q"), merger0.input("7"))    # d_flip_flop_1 -> merger0.in[7]
circuit0.connect(merger0, output0)    # merger0 -> output0

circuit0.run()

print(output0.value)  # expected: 1