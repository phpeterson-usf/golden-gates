import sys
sys.path.append('../')
from ggl import arithmetic, circuit, component, io, logic, memory, plexers, wires

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=7, js_id="input_1_1753735919910")
input0.value = 0
input1 = io.Input(label="B", bits=7, js_id="input_2_1753735922360")
input1.value = 0
splitter0 = wires.Splitter(bits=7, splits=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6)], js_id="splitter_1_1753735938746")
splitter1 = wires.Splitter(bits=7, splits=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6)], js_id="splitter_2_1753735979171")
xnor0 = logic.Xnor(js_id="xnor-gate_1_1753736047017")
xnor1 = logic.Xnor(js_id="xnor-gate_2_1753736075638")
xnor2 = logic.Xnor(js_id="xnor-gate_3_1753736077566")
xnor3 = logic.Xnor(js_id="xnor-gate_4_1753736079328")
xnor4 = logic.Xnor(js_id="xnor-gate_5_1753736081444")
xnor5 = logic.Xnor(js_id="xnor-gate_6_1753736082257")
xnor6 = logic.Xnor(js_id="xnor-gate_7_1753736083301")
and0 = logic.And(num_inputs=7, js_id="and-gate_1_1753736389709")
output0 = io.Output(label="EQ", bits=1, js_id="output_1_1753736485867")

circuit0.connect(splitter1.output("0"), xnor0.input("0"))    # splitter1 -> xnor0.in[0]
circuit0.connect(splitter1.output("1"), xnor1.input("0"))    # splitter1.out[1] -> xnor1.in[0]
circuit0.connect(splitter1.output("2"), xnor2.input("0"))    # splitter1.out[2] -> xnor2.in[0]
circuit0.connect(splitter1.output("3"), xnor3.input("0"))    # splitter1.out[3] -> xnor3.in[0]
circuit0.connect(splitter1.output("4"), xnor4.input("0"))    # splitter1.out[4] -> xnor4.in[0]
circuit0.connect(splitter1.output("5"), xnor5.input("0"))    # splitter1.out[5] -> xnor5.in[0]
circuit0.connect(splitter1.output("6"), xnor6.input("0"))    # splitter1.out[6] -> xnor6.in[0]
circuit0.connect(input1, splitter1)    # input1 -> splitter1
circuit0.connect(input0, splitter0)    # input0 -> splitter0
circuit0.connect(splitter0.output("0"), xnor0.input("1"))    # splitter0 -> xnor0.in[1]
circuit0.connect(splitter0.output("1"), xnor1.input("1"))    # splitter0.out[1] -> xnor1.in[1]
circuit0.connect(splitter0.output("2"), xnor2.input("1"))    # splitter0.out[2] -> xnor2.in[1]
circuit0.connect(splitter0.output("3"), xnor3.input("1"))    # splitter0.out[3] -> xnor3.in[1]
circuit0.connect(splitter0.output("4"), xnor4.input("1"))    # splitter0.out[4] -> xnor4.in[1]
circuit0.connect(splitter0.output("5"), xnor5.input("1"))    # splitter0.out[5] -> xnor5.in[1]
circuit0.connect(splitter0.output("6"), xnor6.input("1"))    # splitter0.out[6] -> xnor6.in[1]
circuit0.connect(xnor0, and0.input("0"))    # xnor0 -> and0.in[0]
circuit0.connect(xnor1, and0.input("1"))    # xnor1 -> and0.in[1]
circuit0.connect(xnor2, and0.input("2"))    # xnor2 -> and0.in[2]
circuit0.connect(xnor3, and0.input("3"))    # xnor3 -> and0.in[3]
circuit0.connect(xnor4, and0.input("4"))    # xnor4 -> and0.in[4]
circuit0.connect(xnor5, and0.input("5"))    # xnor5 -> and0.in[5]
circuit0.connect(xnor6, and0.input("6"))    # xnor6 -> and0.in[6]
circuit0.connect(and0, output0)    # and0 -> output0

# Export as a reusable component
biteq7 = circuit.Component(circuit0)

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=5, js_id="input_1_1753735919910")
input0.value = 0
input1 = io.Input(label="B", bits=5, js_id="input_2_1753735922360")
input1.value = 0
splitter0 = wires.Splitter(bits=5, splits=[(0,0), (1,1), (2,2), (3,3), (4,4)], js_id="splitter_1_1753735938746")
splitter1 = wires.Splitter(bits=5, splits=[(0,0), (1,1), (2,2), (3,3), (4,4)], js_id="splitter_2_1753735979171")
xnor0 = logic.Xnor(js_id="xnor-gate_1_1753736047017")
xnor1 = logic.Xnor(js_id="xnor-gate_2_1753736075638")
xnor2 = logic.Xnor(js_id="xnor-gate_3_1753736077566")
xnor3 = logic.Xnor(js_id="xnor-gate_4_1753736079328")
xnor4 = logic.Xnor(js_id="xnor-gate_5_1753736081444")
and0 = logic.And(num_inputs=5, js_id="and-gate_1_1753736389709")
output0 = io.Output(label="EQ", bits=1, js_id="output_1_1753736485867")

circuit0.connect(splitter1.output("0"), xnor0.input("0"))    # splitter1 -> xnor0.in[0]
circuit0.connect(splitter1.output("1"), xnor1.input("0"))    # splitter1.out[1] -> xnor1.in[0]
circuit0.connect(splitter1.output("2"), xnor2.input("0"))    # splitter1.out[2] -> xnor2.in[0]
circuit0.connect(splitter1.output("3"), xnor3.input("0"))    # splitter1.out[3] -> xnor3.in[0]
circuit0.connect(splitter1.output("4"), xnor4.input("0"))    # splitter1.out[4] -> xnor4.in[0]
circuit0.connect(input1, splitter1)    # input1 -> splitter1
circuit0.connect(input0, splitter0)    # input0 -> splitter0
circuit0.connect(splitter0.output("0"), xnor0.input("1"))    # splitter0 -> xnor0.in[1]
circuit0.connect(splitter0.output("1"), xnor1.input("1"))    # splitter0.out[1] -> xnor1.in[1]
circuit0.connect(splitter0.output("2"), xnor2.input("1"))    # splitter0.out[2] -> xnor2.in[1]
circuit0.connect(splitter0.output("3"), xnor3.input("1"))    # splitter0.out[3] -> xnor3.in[1]
circuit0.connect(splitter0.output("4"), xnor4.input("1"))    # splitter0.out[4] -> xnor4.in[1]
circuit0.connect(xnor0, and0.input("0"))    # xnor0 -> and0.in[0]
circuit0.connect(xnor1, and0.input("1"))    # xnor1 -> and0.in[1]
circuit0.connect(xnor2, and0.input("2"))    # xnor2 -> and0.in[2]
circuit0.connect(xnor3, and0.input("3"))    # xnor3 -> and0.in[3]
circuit0.connect(xnor4, and0.input("4"))    # xnor4 -> and0.in[4]
circuit0.connect(and0, output0)    # and0 -> output0

# Export as a reusable component
biteq5 = circuit.Component(circuit0)

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="iw", bits=32, js_id="input_1_1753739190087")
input0.value = 0x00008067
splitter0 = wires.Splitter(bits=32, splits=[(0,6), (7,11)], js_id="splitter_1_1753739217666")
biteq7_1 = biteq7()
biteq7_2 = biteq7()
biteq7_3 = biteq7()
biteq7_4 = biteq7()
biteq7_5 = biteq7()
biteq7_6 = biteq7()
biteq7_7 = biteq7()
biteq5_1 = biteq5()
priorityEncoder0 = plexers.PriorityEncoder(label="PE", selector_bits=3, js_id="priorityEncoder_1_1753739749670")
and0 = logic.And(js_id="and-gate_1_1753739722442")
output0 = io.Output(label="inum", bits=3, js_id="output_1_1753739923829")
output1 = io.Output(label="any", bits=1)
constant0 = io.Constant(label="itype", bits=7, js_id="constant_1_1753739371691")
constant0.value = 0b0010011
constant1 = io.Constant(label="rtype", bits=7, js_id="constant_2_1753739410038")
constant1.value = 0b0110011
constant2 = io.Constant(label="load", bits=7, js_id="constant_3_1753739447975")
constant2.value = 0b0000011
constant3 = io.Constant(label="stype", bits=7, js_id="constant_4_1753739469739")
constant3.value = 0b0100011
constant4 = io.Constant(label="btype", bits=7, js_id="constant_5_1753739483065")
constant4.value = 0b1100011
constant5 = io.Constant(label="jalr", bits=7, js_id="constant_6_1753739527362")
constant5.value = 0b1100111
constant6 = io.Constant(label="jtype", bits=7, js_id="constant_7_1753739547311")
constant6.value = 0b1101111
constant7 = io.Constant(bits=5, js_id="constant_8_1753739571699")
constant7.value = 0b00000
itype = io.Output(label="", bits=1)
rtype = io.Output(label="", bits=1)
load = io.Output(label="", bits=1)
stype = io.Output(label="", bits=1)
btype = io.Output(label="", bits=1)
jalr = io.Output(label="", bits=1)
jtype = io.Output(label="", bits=1)


circuit0.connect(constant0, biteq7_1.input("B"))    # constant0 -> biteq7_1.in[1]
circuit0.connect(constant1, biteq7_2.input("B"))    # constant1 -> biteq7_2.in[1]
circuit0.connect(constant2, biteq7_3.input("B"))    # constant2 -> biteq7_3.in[1]
circuit0.connect(constant3, biteq7_4.input("B"))    # constant3 -> biteq7_4.in[1]
circuit0.connect(constant4, biteq7_5.input("B"))    # constant4 -> biteq7_5.in[1]
circuit0.connect(constant5, biteq7_6.input("B"))    # constant5 -> biteq7_6.in[1]
circuit0.connect(constant6, biteq7_7.input("B"))    # constant6 -> biteq7_7.in[1]
circuit0.connect(constant7, biteq5_1.input("B"))    # constant7 -> biteq5_1.in[1]
circuit0.connect(splitter0.output("0"), biteq7_1.input("A"))    # splitter0 -> biteq7_1.in[0]
circuit0.connect(splitter0.output("0"), biteq7_2.input("A"))    # splitter0 -> biteq7_2.in[0]
circuit0.connect(splitter0.output("0"), biteq7_3.input("A"))    # splitter0 -> biteq7_3.in[0]
circuit0.connect(splitter0.output("0"), biteq7_4.input("A"))    # splitter0 -> biteq7_4.in[0]
circuit0.connect(splitter0.output("0"), biteq7_5.input("A"))    # splitter0 -> biteq7_5.in[0]
circuit0.connect(splitter0.output("0"), biteq7_6.input("A"))    # splitter0 -> biteq7_6.in[0]
circuit0.connect(splitter0.output("0"), biteq7_7.input("A"))    # splitter0 -> biteq7_7.in[0]
circuit0.connect(splitter0.output("1"), biteq5_1.input("A"))    # splitter0.out[1] -> biteq5_1.in[0]
circuit0.connect(biteq5_1.output("EQ"), and0.input("1"))    # biteq5_1 -> and0.in[1]
circuit0.connect(biteq7_1.output("EQ"), priorityEncoder0.input("0"))    # biteq7_1 -> priorityEncoder0.in[0]
circuit0.connect(biteq7_1.output("EQ"), itype) 
circuit0.connect(biteq7_2.output("EQ"), priorityEncoder0.input("1"))    # biteq7_2 -> priorityEncoder0.in[1]
circuit0.connect(biteq7_2.output("EQ"), rtype) 
circuit0.connect(biteq7_3.output("EQ"), priorityEncoder0.input("2"))    # biteq7_3 -> priorityEncoder0.in[2]
circuit0.connect(biteq7_3.output("EQ"), load) 
circuit0.connect(biteq7_4.output("EQ"), priorityEncoder0.input("3"))    # biteq7_4 -> priorityEncoder0.in[3]
circuit0.connect(biteq7_4.output("EQ"), stype) 
circuit0.connect(biteq7_5.output("EQ"), priorityEncoder0.input("4"))    # biteq7_5 -> priorityEncoder0.in[4]
circuit0.connect(biteq7_5.output("EQ"), btype) 
circuit0.connect(biteq7_6.output("EQ"), priorityEncoder0.input("5"))    # biteq7_6 -> priorityEncoder0.in[5]
circuit0.connect(biteq7_6.output("EQ"), jalr) 
circuit0.connect(biteq7_7.output("EQ"), priorityEncoder0.input("6"))    # biteq7_7 -> priorityEncoder0.in[6]
circuit0.connect(biteq7_7.output("EQ"), jtype) 
circuit0.connect(biteq7_7.output("EQ"), and0.input("0"))    # biteq7_7 -> and0.in[0]
circuit0.connect(and0, priorityEncoder0.input("7"))    # and0 -> priorityEncoder0.in[7]
circuit0.connect(priorityEncoder0.output("inum"), output0)    # priorityEncoder0 -> output0
circuit0.connect(priorityEncoder0.output("any"), output1)    # priorityEncoder0 -> output0
circuit0.connect(input0, splitter0)    # input0 -> splitter0


get_bitseq = [0x40B602B3, 0x128293, 0x4000393, 0x729863, 0x50313, 0xFFF00393, 0x140006F, 0xB55333, 0x100393, 0x5393B3, 0xFFF38393, 0x737533,0x8067,0xC0001073]
for iw in get_bitseq:
    input0.value = iw
    print(output0.value)
    circuit0.step()
