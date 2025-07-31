import sys
sys.path.append('../')
from ggl import arithmetic, circuit, component, io, logic, memory, plexers, wires

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=8, js_id="input_1_1753735919910")
input0.value = 0
input1 = io.Input(label="B", bits=8, js_id="input_2_1753735922360")
input1.value = 0
splitter0 = wires.Splitter(bits=8, splits=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6), (7,7)], js_id="splitter_1_1753735938746")
splitter1 = wires.Splitter(bits=8, splits=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6), (7,7)], js_id="splitter_2_1753735979171")
xnor0 = logic.Xnor(js_id="xnor-gate_1_1753736047017")
xnor1 = logic.Xnor(js_id="xnor-gate_2_1753736075638")
xnor2 = logic.Xnor(js_id="xnor-gate_3_1753736077566")
xnor3 = logic.Xnor(js_id="xnor-gate_4_1753736079328")
xnor4 = logic.Xnor(js_id="xnor-gate_5_1753736081444")
xnor5 = logic.Xnor(js_id="xnor-gate_6_1753736082257")
xnor6 = logic.Xnor(js_id="xnor-gate_7_1753736083301")
xnor7 = logic.Xnor(js_id="xnor-gate_8_1753736084113")
and0 = logic.And(num_inputs=8, js_id="and-gate_1_1753736389709")
output0 = io.Output(label="EQ", bits=1, js_id="output_1_1753736485867")

circuit0.connect(splitter1.output("0"), xnor0.input("0"))    # splitter1 -> xnor0.in[0]
circuit0.connect(splitter1.output("1"), xnor1.input("0"))    # splitter1.out[1] -> xnor1.in[0]
circuit0.connect(splitter1.output("2"), xnor2.input("0"))    # splitter1.out[2] -> xnor2.in[0]
circuit0.connect(splitter1.output("3"), xnor3.input("0"))    # splitter1.out[3] -> xnor3.in[0]
circuit0.connect(splitter1.output("4"), xnor4.input("0"))    # splitter1.out[4] -> xnor4.in[0]
circuit0.connect(splitter1.output("5"), xnor5.input("0"))    # splitter1.out[5] -> xnor5.in[0]
circuit0.connect(splitter1.output("6"), xnor6.input("0"))    # splitter1.out[6] -> xnor6.in[0]
circuit0.connect(splitter1.output("7"), xnor7.input("0"))    # splitter1.out[7] -> xnor7.in[0]
circuit0.connect(input1, splitter1)    # input1 -> splitter1
circuit0.connect(input0, splitter0)    # input0 -> splitter0
circuit0.connect(splitter0.output("0"), xnor0.input("1"))    # splitter0 -> xnor0.in[1]
circuit0.connect(splitter0.output("1"), xnor1.input("1"))    # splitter0.out[1] -> xnor1.in[1]
circuit0.connect(splitter0.output("2"), xnor2.input("1"))    # splitter0.out[2] -> xnor2.in[1]
circuit0.connect(splitter0.output("3"), xnor3.input("1"))    # splitter0.out[3] -> xnor3.in[1]
circuit0.connect(splitter0.output("4"), xnor4.input("1"))    # splitter0.out[4] -> xnor4.in[1]
circuit0.connect(splitter0.output("5"), xnor5.input("1"))    # splitter0.out[5] -> xnor5.in[1]
circuit0.connect(splitter0.output("6"), xnor6.input("1"))    # splitter0.out[6] -> xnor6.in[1]
circuit0.connect(splitter0.output("7"), xnor7.input("1"))    # splitter0.out[7] -> xnor7.in[1]
circuit0.connect(xnor0, and0.input("0"))    # xnor0 -> and0.in[0]
circuit0.connect(xnor1, and0.input("1"))    # xnor1 -> and0.in[1]
circuit0.connect(xnor2, and0.input("2"))    # xnor2 -> and0.in[2]
circuit0.connect(xnor3, and0.input("3"))    # xnor3 -> and0.in[3]
circuit0.connect(xnor4, and0.input("4"))    # xnor4 -> and0.in[4]
circuit0.connect(xnor5, and0.input("5"))    # xnor5 -> and0.in[5]
circuit0.connect(xnor6, and0.input("6"))    # xnor6 -> and0.in[6]
circuit0.connect(xnor7, and0.input("7"))    # xnor7 -> and0.in[7]
circuit0.connect(and0, output0)    # and0 -> output0

# Export as a reusable component
eight_bit_eq = circuit.Component(circuit0)

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=32, js_id="input_1_1753736599077")
input0.value = 100
input1 = io.Input(label="B", bits=32, js_id="input_2_1753736608641")
input1.value = 200
splitter0 = wires.Splitter(bits=32, splits=[(0,7), (8,15), (16,23), (24,31)], js_id="splitter_1_1753736715151")
splitter1 = wires.Splitter(bits=32, splits=[(0,7), (8,15), (16,23), (24,31)], js_id="splitter_2_1753736746869")
eight_bit_eq_1 = eight_bit_eq()
eight_bit_eq_2 = eight_bit_eq()
eight_bit_eq_3 = eight_bit_eq()
eight_bit_eq_4 = eight_bit_eq()
and0 = logic.And(num_inputs=4, js_id="and-gate_1_1753736925634")
output0 = io.Output(label="EQ", bits=1, js_id="output_1_1753736958180")

circuit0.connect(splitter1.output("0"), eight_bit_eq_1.input("B"))    # splitter1 -> eight_bit_eq_1.in[1]
circuit0.connect(splitter1.output("1"), eight_bit_eq_2.input("B"))    # splitter1.out[1] -> eight_bit_eq_2.in[1]
circuit0.connect(splitter1.output("2"), eight_bit_eq_3.input("B"))    # splitter1.out[2] -> eight_bit_eq_3.in[1]
circuit0.connect(splitter1.output("3"), eight_bit_eq_4.input("B"))    # splitter1.out[3] -> eight_bit_eq_4.in[1]
circuit0.connect(splitter0.output("0"), eight_bit_eq_1.input("A"))    # splitter0 -> eight_bit_eq_1.in[0]
circuit0.connect(splitter0.output("1"), eight_bit_eq_2.input("A"))    # splitter0.out[1] -> eight_bit_eq_2.in[0]
circuit0.connect(splitter0.output("2"), eight_bit_eq_3.input("A"))    # splitter0.out[2] -> eight_bit_eq_3.in[0]
circuit0.connect(splitter0.output("3"), eight_bit_eq_4.input("A"))    # splitter0.out[3] -> eight_bit_eq_4.in[0]
circuit0.connect(input0, splitter0)    # input0 -> splitter0
circuit0.connect(input1, splitter1)    # input1 -> splitter1
circuit0.connect(eight_bit_eq_1.output("EQ"), and0.input("0"))    # eight_bit_eq_1 -> and0.in[0]
circuit0.connect(eight_bit_eq_2.output("EQ"), and0.input("1"))    # eight_bit_eq_2 -> and0.in[1]
circuit0.connect(eight_bit_eq_3.output("EQ"), and0.input("2"))    # eight_bit_eq_3 -> and0.in[2]
circuit0.connect(eight_bit_eq_4.output("EQ"), and0.input("3"))    # eight_bit_eq_4 -> and0.in[3]
circuit0.connect(and0, output0)    # and0 -> output0

circuit0.run()
print(output0.value)
input0.value = 255
input1.value = 255
circuit0.run()
print(output0.value)