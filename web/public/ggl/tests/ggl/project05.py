import sys
sys.path.append('../')
from ggl import arithmetic, circuit, component, io, logic, memory, plexers, wires

# Build the circuit
circuit0 = circuit.Circuit()
clk = io.Input(label="CLK", bits=1)
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

counter_8bit = circuit.Component(circuit0)

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="iw", bits=32, js_id="input_1_1754161168829")
splitter0 = wires.Splitter(bits=32, splits=[(0,6), (7,11)], js_id="splitter_1_1754161490198")
comp0 = arithmetic.Comparator(label="=", bits=7, js_id="compare_1_1754161071079")
comp1 = arithmetic.Comparator(label="=", bits=8, js_id="compare_2_1754161091914")
comp2 = arithmetic.Comparator(label="=", bits=8, js_id="compare_3_1754161093116")
comp3 = arithmetic.Comparator(label="=", bits=8, js_id="compare_4_1754161093679")
comp4 = arithmetic.Comparator(label="=", bits=8, js_id="compare_5_1754161094116")
comp5 = arithmetic.Comparator(label="=", bits=7, js_id="compare_6_1754161094510")
comp6 = arithmetic.Comparator(label="=", bits=8, js_id="compare_7_1754161094943")
comp7 = arithmetic.Comparator(label="=", bits=8, js_id="compare_9_1754161095898")
priorityEncoder0 = plexers.PriorityEncoder(label="PE", num_inputs=8, js_id="priorityEncoder_1_1754161650546")
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

# Export as a reusable component
analyze_decode = circuit.Component(circuit0)

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=8, js_id="input_1_1754161943439")
input1 = io.Input(label="PN", bits=1, js_id="input_2_1754162103961")
rom0 = memory.ROM(label="fib_rec", address_bits=8, data_bits=32, data=[1049235, 10667107, 32871, 4269867283, 1126435, 10564643, 4294247699, 4267700463, 10565667, 8467715, 4293199123, 4250923247, 16855811, 6620467, 77955, 25231635, 32871, 3221229683, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], js_id="rom_1_1754161954030")
rom1 = memory.ROM(label="is_pal", address_bits=8, data_bits=32, data=[12961379, 1049875, 62914671, 11862707, 164483, 12911411, 197379, 6456931, 1299, 33554543, 4286644499, 1126435, 1410451, 4294313491, 4238340335, 77955, 8454419, 32871, 3221229683, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], js_id="rom_2_1754161955088")
rom2 = memory.ROM(label="get_bitseq", address_bits=8, data_bits=32, data=[1085670067, 1213075, 67109779, 7510115, 328467, 4293919635, 20971631, 11883315, 1049491, 5477299, 4294149011, 7566643, 32871, 3221229683, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], js_id="rom_3_1754161955462")
rom3 = memory.ROM(label="quad", address_bits=8, data_bits=32, data=[44368563, 45253299, 46465843, 6456627, 13960499, 32871, 3221229683, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], js_id="rom_4_1754161955932")
mux0 = plexers.Multiplexer(num_inputs=4, bits=32, js_id="multiplexer_1_1754162067648")
output0 = io.Output(label="D", bits=1, js_id="output_1_1754162128807")
constant0 = io.Constant(bits=8, js_id="constant_1_1754161993921")
constant0.value = 1

circuit0.connect(rom1.output("D"), mux0.input("1"), js_id="wire_1754162085536")    # rom1 -> mux0.in[1]
circuit0.connect(rom2.output("D"), mux0.input("2"), js_id="wire_1754162089737")    # rom2 -> mux0.in[2]
circuit0.connect(rom3.output("D"), mux0.input("3"), js_id="wire_1754162093647")    # rom3 -> mux0.in[3]
circuit0.connect(input1, mux0.input("sel"), js_id="wire_1754162119066")    # input1 -> mux0.in[4]
circuit0.connect(mux0, output0, js_id="wire_1754162133175")    # mux0 -> output0
circuit0.connect(rom0.output("D"), mux0.input("0"), js_id="wire_1754162755276")    # rom0 -> mux0.in[0]
circuit0.connect(constant0, rom0.input("sel"), js_id="wire_1754162822772")    # constant0 -> rom0.in[1]
circuit0.connect(constant0, rom1.input("sel"), js_id="wire_1754162828187")    # constant0 -> rom1.in[1]
circuit0.connect(constant0, rom2.input("sel"), js_id="wire_1754162832930")    # constant0 -> rom2.in[1]
circuit0.connect(constant0, rom3.input("sel"), js_id="wire_1754162838507")    # constant0 -> rom3.in[1]
circuit0.connect(input0, rom1.input("A"), js_id="wire_1754162859822")    # input0 -> rom1.in[0]
circuit0.connect(input0, rom2.input("A"), js_id="wire_1754162866768")    # input0 -> rom2.in[0]
circuit0.connect(input0, rom3.input("A"), js_id="wire_1754162873227")    # input0 -> rom3.in[0]
circuit0.connect(input0, rom0.input("A"), js_id="wire_1754162853338")    # input0 -> rom0.in[0]
# Export as a reusable component
instruction_memory = circuit.Component(circuit0)


circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="PN", bits=2, js_id="input_1_1754163895356")
input0.value = 3
input1 = io.Input(label="CLK", bits=1, js_id="input_2_1754199853071")
input1.value = 1
instruction_memory_1 = instruction_memory()
and0 = logic.And(inverted_inputs=[1], js_id="and-gate_1_1754195063561")
comp0 = arithmetic.Comparator(label="=", bits=32, js_id="compare_1_1754166982615")
analyze_decode_1 = analyze_decode()
output0 = io.Output(label="iw", bits=32, js_id="output_11_1754197476382")
inum = io.Output(label="inum", bits=3)
counter_8bit_1 = counter_8bit()
reg0 = memory.Register(label="REG", bits=8, js_id="register_8_1754164301625")
reg1 = memory.Register(label="REG", bits=8, js_id="register_1_1754164265627")
reg2 = memory.Register(label="REG", bits=1, js_id="register_2_1754164285939")
reg3 = memory.Register(label="REG", bits=8, js_id="register_3_1754164288706")
reg4 = memory.Register(label="REG", bits=1, js_id="register_4_1754164290422")
reg5 = memory.Register(label="REG", bits=8, js_id="register_5_1754164292136")
reg6 = memory.Register(label="REG", bits=1, js_id="register_6_1754164293790")
reg7 = memory.Register(label="REG", bits=8, js_id="register_7_1754164299897")
output1 = io.Output(label="DONE", bits=1, js_id="output_10_1754167094638")
mux0 = plexers.Multiplexer(num_inputs=8, bits=8, js_id="multiplexer_1_1754164043134")
decoder0 = plexers.Decoder(label="DEC", num_outputs=8, js_id="decoder_1_1754164072211")
output2 = io.Output(label="TOTAL", bits=8, js_id="output_9_1754164726948")
output3 = io.Output(label="J", bits=8, js_id="output_8_1754164726376")
output4 = io.Output(label="ITYPE", bits=8, js_id="output_1_1754164719058")
output5 = io.Output(label="RTYPE", bits=8, js_id="output_2_1754164723134")
output6 = io.Output(label="LOAD", bits=8, js_id="output_3_1754164723796")
output7 = io.Output(label="STYPE", bits=8, js_id="output_4_1754164724628")
output8 = io.Output(label="BTYPE", bits=8, js_id="output_5_1754164724989")
output9 = io.Output(label="JALR", bits=8, js_id="output_6_1754164725453")
output10 = io.Output(label="JAL", bits=8, js_id="output_7_1754164725876")
adder0 = arithmetic.Adder(label="+", bits=8, js_id="adder_1_1754166628535")
constant0 = io.Constant(bits=8, js_id="constant_1_1754166647891")
constant0.value = 1
constant1 = io.Constant(bits=8, js_id="constant_2_1754166667931")
constant1.value = 0
constant2 = io.Constant(bits=32, js_id="constant_3_1754167067804")
constant2.value = 0xC0001073

circuit0.connect(constant0, adder0.input("a"), js_id="wire_1754166665071")    # constant0 -> adder0.in[0]
circuit0.connect(constant1, adder0.input("cin"), js_id="wire_1754166672579")    # constant1 -> adder0.in[2]
circuit0.connect(constant2, comp0.input("a"), js_id="wire_1754167090763")    # constant2 -> comp0.in[0]
circuit0.connect(comp0.output("eq"), output1, js_id="wire_1754167104334")    # comp0.out[1] -> output1
circuit0.connect(comp0.output("eq"), and0.input("1"), js_id="wire_1754195145910")    # comp0.out[1] -> and0.in[1]
circuit0.connect(adder0.output("sum"), reg1.input("D"), js_id="wire_1754195414231")    # adder0 -> reg1.in[0]
circuit0.connect(decoder0.output("0"), reg1.input("en"), js_id="wire_1754196616095")    # decoder0 -> reg1.in[2]
circuit0.connect(decoder0.output("1"), reg2.input("en"), js_id="wire_1754196626510")    # decoder0.out[1] -> reg2.in[2]
circuit0.connect(decoder0.output("2"), reg3.input("en"), js_id="wire_1754196633742")    # decoder0.out[2] -> reg3.in[2]
circuit0.connect(decoder0.output("3"), reg4.input("en"), js_id="wire_1754196640066")    # decoder0.out[3] -> reg4.in[2]
circuit0.connect(decoder0.output("5"), reg6.input("en"), js_id="wire_1754196654434")    # decoder0.out[5] -> reg6.in[2]
circuit0.connect(decoder0.output("6"), reg7.input("en"), js_id="wire_1754196661229")    # decoder0.out[6] -> reg7.in[2]
circuit0.connect(decoder0.output("7"), reg0.input("en"), js_id="wire_1754196668251")    # decoder0.out[7] -> reg0.in[2]
circuit0.connect(reg1.output("Q"), output4, js_id="wire_1754197134131")    # reg1 -> output4
circuit0.connect(reg2.output("Q"), output5, js_id="wire_1754197137387")    # reg2 -> output5
circuit0.connect(reg3.output("Q"), output6, js_id="wire_1754197141128")    # reg3 -> output6
circuit0.connect(reg4.output("Q"), output7, js_id="wire_1754197144254")    # reg4 -> output7
circuit0.connect(reg5.output("Q"), output8, js_id="wire_1754197148020")    # reg5 -> output8
circuit0.connect(reg6.output("Q"), output9, js_id="wire_1754197151017")    # reg6 -> output9
circuit0.connect(reg7.output("Q"), output10, js_id="wire_1754197153997")    # reg7 -> output10
circuit0.connect(reg0.output("Q"), output3, js_id="wire_1754197158224")    # reg0 -> output3
circuit0.connect(reg1.output("Q"), mux0.input("0"), js_id="wire_1754197170339")    # reg1 -> mux0.in[0]
circuit0.connect(reg2.output("Q"), mux0.input("1"), js_id="wire_1754197184130")    # reg2 -> mux0.in[1]
circuit0.connect(reg3.output("Q"), mux0.input("2"), js_id="wire_1754197193411")    # reg3 -> mux0.in[2]
circuit0.connect(reg4.output("Q"), mux0.input("3"), js_id="wire_1754197203404")    # reg4 -> mux0.in[3]
circuit0.connect(reg5.output("Q"), mux0.input("4"), js_id="wire_1754197222630")    # reg5 -> mux0.in[4]
circuit0.connect(reg6.output("Q"), mux0.input("5"), js_id="wire_1754197248333")    # reg6 -> mux0.in[5]
circuit0.connect(reg7.output("Q"), mux0.input("6"), js_id="wire_1754197259110")    # reg7 -> mux0.in[6]
circuit0.connect(reg0.output("Q"), mux0.input("7"), js_id="wire_1754197286594")    # reg0 -> mux0.in[7]
circuit0.connect(mux0, adder0.input("b"), js_id="wire_1754197366246")    # mux0 -> adder0.in[1]
circuit0.connect(analyze_decode_1.output("inum"), mux0.input("sel"), js_id="wire_1754197397939")    # analyze_decode_1 -> mux0.in[8]
circuit0.connect(analyze_decode_1.output("inum"), decoder0.input("sel"), js_id="wire_1754197416548")    # analyze_decode_1 -> decoder0
circuit0.connect(analyze_decode_1.output("inum"), inum)
circuit0.connect(adder0.output("sum"), reg0.input("D"), js_id="wire_1754197662935")    # adder0 -> reg0.in[0]
circuit0.connect(adder0.output("sum"), reg7.input("D"), js_id="wire_1754197678591")    # adder0 -> reg7.in[0]
circuit0.connect(adder0.output("sum"), reg6.input("D"), js_id="wire_1754197684147")    # adder0 -> reg6.in[0]
circuit0.connect(adder0.output("sum"), reg5.input("D"), js_id="wire_1754197689855")    # adder0 -> reg5.in[0]
circuit0.connect(adder0.output("sum"), reg4.input("D"), js_id="wire_1754197697103")    # adder0 -> reg4.in[0]
circuit0.connect(and0, counter_8bit_1.input("CLK"), js_id="wire_1754198449807")    # and0 -> counter_8bit_1
circuit0.connect(and0, reg3.input("CLK"), js_id="wire_1754198512489")    # and0 -> reg3.in[1]
circuit0.connect(and0, reg4.input("CLK"), js_id="wire_1754198536362")    # and0 -> reg4.in[1]
circuit0.connect(and0, reg5.input("CLK"), js_id="wire_1754198545609")    # and0 -> reg5.in[1]
circuit0.connect(and0, reg7.input("CLK"), js_id="wire_1754198557600")    # and0 -> reg7.in[1]
circuit0.connect(input1, and0.input("0"), js_id="wire_1754199858160")    # input1 -> and0.in[0]
circuit0.connect(instruction_memory_1.output("D"), output0, js_id="wire_1754197758998")    # instruction_memory_1 -> output0
circuit0.connect(adder0.output("sum"), reg3.input("D"), js_id="wire_1754197707264")    # adder0 -> reg3.in[0]
circuit0.connect(adder0.output("sum"), reg2.input("D"), js_id="wire_1754197712866")    # adder0 -> reg2.in[0]
circuit0.connect(instruction_memory_1.output("D"), comp0.input("b"), js_id="wire_1754197739509")    # instruction_memory_1 -> comp0.in[1]
circuit0.connect(instruction_memory_1.output("D"), analyze_decode_1.input("iw"), js_id="wire_1754197752844")    # instruction_memory_1 -> analyze_decode_1
circuit0.connect(counter_8bit_1.output("count"), instruction_memory_1.input("A"), js_id="wire_1754197845802")    # counter_8bit_1 -> instruction_memory_1.in[0]
circuit0.connect(input0, instruction_memory_1.input("PN"), js_id="wire_1754197848304")    # input0 -> instruction_memory_1.in[1]
circuit0.connect(counter_8bit_1.output("count"), output2, js_id="wire_1754197869166")    # counter_8bit_1 -> output2
circuit0.connect(and0, reg6.input("CLK"), js_id="wire_1754198551957")    # and0 -> reg6.in[1]
circuit0.connect(decoder0.output("4"), reg5.input("en"), js_id="wire_1754196646513")    # decoder0.out[4] -> reg5.in[2]
circuit0.connect(and0, reg2.input("CLK"), js_id="wire_1754198502505")    # and0 -> reg2.in[1]
circuit0.connect(and0, reg0.input("CLK"), js_id="wire_1754198485632")    # and0 -> reg0.in[1]
circuit0.connect(and0, reg1.input("CLK"), js_id="wire_1754198494659")    # and0 -> reg1.in[1]


while output1.value != 1:
    input1.value = 0
    circuit0.step()  # settle combinational
    input1.value = 1
    circuit0.step(rising_edge=True)  # clock update

print("Total: ", output2.value)
print("J:", output3.value)
print("Itype: ", output4.value)
print("Rtype: ", output5.value)
print("Load: ", output6.value)
print("Stype: ", output7.value)
print("Btype: ", output8.value)
print("JALR: ", output9.value)
print("JAL: ", output10.value)
