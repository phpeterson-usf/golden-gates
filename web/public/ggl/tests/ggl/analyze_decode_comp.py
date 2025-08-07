import sys
sys.path.append('../')
from ggl import arithmetic, circuit, component, io, logic, memory, plexers, wires


circuit0 = circuit.Circuit()
input0 = io.Input(label="iw", bits=32, js_id="input_1_1754161168829")
splitter0 = wires.Splitter(bits=32, splits=[(0,6), (7,11)], js_id="splitter_1_1754161490198")
comp0 = arithmetic.Comparator(label="=", bits=7, js_id="compare_1_1754161071079")
comp1 = arithmetic.Comparator(label="=", bits=7, js_id="compare_2_1754161091914")
comp2 = arithmetic.Comparator(label="=", bits=7, js_id="compare_3_1754161093116")
comp3 = arithmetic.Comparator(label="=", bits=7, js_id="compare_4_1754161093679")
comp4 = arithmetic.Comparator(label="=", bits=7, js_id="compare_5_1754161094116")
comp5 = arithmetic.Comparator(label="=", bits=7, js_id="compare_6_1754161094510")
comp6 = arithmetic.Comparator(label="=", bits=7, js_id="compare_7_1754161094943")
comp7 = arithmetic.Comparator(label="=", bits=5, js_id="compare_9_1754161095898")
priorityEncoder0 = plexers.PriorityEncoder(label="PE", selector_bits=3, js_id="priorityEncoder_1_1754161650546")
and0 = logic.And(js_id="and-gate_1_1754161704314")
output0 = io.Output(label="inum", bits=1, js_id="output_1_1754161794853")
constant0 = io.Constant(label="itype", bits=7, js_id="constant_1_1754161224491")
constant0.value = 0b0010011
constant1 = io.Constant(label="rtype", bits=7, js_id="constant_2_1754161254632")
constant1.value = 0b0110011
constant2 = io.Constant(label="load", bits=7, js_id="constant_3_1754161264187")
constant2.value = 0b0000011
constant3 = io.Constant(label="stype", bits=7, js_id="constant_4_1754161265438")
constant3.value = 0b0100011
constant4 = io.Constant(label="btype", bits=7, js_id="constant_5_1754161265957")
constant4.value = 0b1100011
constant5 = io.Constant(label="jalr", bits=7, js_id="constant_6_1754161266431")
constant5.value = 0b1100111
constant6 = io.Constant(label="jtype", bits=7, js_id="constant_7_1754161267013")
constant6.value = 0b1101111
constant7 = io.Constant(bits=5, js_id="constant_8_1754161267562")
constant7.value = 0b00000

circuit0.connect(splitter0.output("0"), comp1.input("a"), js_id="wire_1754161575063")    # splitter0 -> comp1.in[0]
circuit0.connect(splitter0.output("0"), comp2.input("a"), js_id="wire_1754161581896")    # splitter0 -> comp2.in[0]
circuit0.connect(splitter0.output("0"), comp3.input("a"), js_id="wire_1754161589005")    # splitter0 -> comp3.in[0]
circuit0.connect(splitter0.output("0"), comp4.input("a"), js_id="wire_1754161597580")    # splitter0 -> comp4.in[0]
circuit0.connect(splitter0.output("0"), comp5.input("a"), js_id="wire_1754161606038")    # splitter0 -> comp5.in[0]
circuit0.connect(splitter0.output("0"), comp6.input("a"), js_id="wire_1754161621836")    # splitter0 -> comp6.in[0]
circuit0.connect(splitter0.output("1"), comp7.input("a"), js_id="wire_1754161634659")    # splitter0.out[1] -> comp7.in[0]
circuit0.connect(constant0, comp0.input("b"), js_id="wire_1754161680431")    # constant0 -> comp0.in[1]
circuit0.connect(constant1, comp1.input("b"), js_id="wire_1754161682819")    # constant1 -> comp1.in[1]
circuit0.connect(constant2, comp2.input("b"), js_id="wire_1754161685256")    # constant2 -> comp2.in[1]
circuit0.connect(constant3, comp3.input("b"), js_id="wire_1754161687530")    # constant3 -> comp3.in[1]
circuit0.connect(constant4, comp4.input("b"), js_id="wire_1754161689481")    # constant4 -> comp4.in[1]
circuit0.connect(constant5, comp5.input("b"), js_id="wire_1754161691959")    # constant5 -> comp5.in[1]
circuit0.connect(constant6, comp6.input("b"), js_id="wire_1754161694249")    # constant6 -> comp6.in[1]
circuit0.connect(constant7, comp7.input("b"), js_id="wire_1754161696864")    # constant7 -> comp7.in[1]
circuit0.connect(comp7.output("eq"), and0.input("1"), js_id="wire_1754161716644")    # comp7.out[1] -> and0.in[1]
circuit0.connect(comp0.output("eq"), priorityEncoder0.input("0"), js_id="wire_1754161727668")    # comp0.out[1] -> priorityEncoder0.in[0]
circuit0.connect(comp1.output("eq"), priorityEncoder0.input("1"), js_id="wire_1754161738298")    # comp1.out[1] -> priorityEncoder0.in[1]
circuit0.connect(comp2.output("eq"), priorityEncoder0.input("2"), js_id="wire_1754161743503")    # comp2.out[1] -> priorityEncoder0.in[2]
circuit0.connect(comp3.output("eq"), priorityEncoder0.input("3"), js_id="wire_1754161748345")    # comp3.out[1] -> priorityEncoder0.in[3]
circuit0.connect(comp4.output("eq"), priorityEncoder0.input("4"), js_id="wire_1754161753501")    # comp4.out[1] -> priorityEncoder0.in[4]
circuit0.connect(comp5.output("eq"), priorityEncoder0.input("5"), js_id="wire_1754161759938")    # comp5.out[1] -> priorityEncoder0.in[5]
circuit0.connect(comp6.output("eq"), priorityEncoder0.input("6"), js_id="wire_1754161782167")    # comp6.out[1] -> priorityEncoder0.in[6]
circuit0.connect(and0, priorityEncoder0.input("7"), js_id="wire_1754161789858")    # and0 -> priorityEncoder0.in[7]
circuit0.connect(priorityEncoder0.output("inum"), output0, js_id="wire_1754161800202")    # priorityEncoder0 -> output0
circuit0.connect(input0, splitter0, js_id="wire_1754161812594")    # input0 -> splitter0
circuit0.connect(splitter0.output("0"), comp0.input("a"), js_id="wire_1754161551295")    # splitter0 -> comp0.in[0]
circuit0.connect(comp6.output("eq"), and0.input("0"), js_id="wire_1754161712790")    # comp6.out[1] -> and0.in[0]


ls = [44368563, 45253299, 46465843, 6456627, 13960499, 32871, 3221229683]
for iw in ls:
    print("IW: ", hex(iw))
    input0.value = iw
    circuit0.run()
    print(output0.value)
    circuit0.stop()