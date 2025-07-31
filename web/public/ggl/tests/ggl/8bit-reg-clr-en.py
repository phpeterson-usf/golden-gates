import sys
sys.path.append('../')
from ggl import circuit, logic, io, wires, plexers

from ggl import arithmetic, circuit, component, io, logic, memory, plexers, wires

sr = circuit.Circuit(js_logging=True)
# inputs r and s
r = io.Input(bits=1, label="r")
r.value = 0

s = io.Input(bits=1, label="s")
s.value = 0

# outputs
output1 = io.Output(bits=1, label="q", js_id="output_1")
output2 = io.Output(bits=1, label="notq", js_id="output_2")
# wiring
nor2 = logic.Nor()
nor1 = logic.Nor()
sr.connect(s, nor2.input("1"))    # input2 -> nor2.in[1]
sr.connect(r, nor1.input("0"))    # input1 -> nor1.in[0]
sr.connect(nor2, nor1.input("1"))    # nor2 -> nor1.in[1]
sr.connect(nor1, nor2.input("0"))    # nor1 -> nor2.in[0]
sr.connect(nor1, output1)    # nor1 -> output1
sr.connect(nor2, output2)    # nor2 -> output2

sr_latch = circuit.Component(sr)

dlatchclr = circuit.Circuit()

# inputs
clk = io.Input(bits=1, label="CLK")
clk.value = 1
d = io.Input(bits=1, label="D")
d.value = 1
clr = io.Input(bits=1, label="CLR")
clr.value = 1
or0 = logic.Or()
and0 = logic.And(inverted_inputs=[1])
and1 = logic.And(inverted_inputs=[1])
and2 = logic.And()
srlatch_1 = sr_latch()
# outputs
Q = io.Output(bits=1, label="Q", js_id="output_1_1753221650549")
notQ = io.Output(bits=1, label="notQ", js_id="output_2_1753221652561")

# wiring
dlatchclr.connect(srlatch_1.output("q"), Q)    # srlatch_1 -> output0
dlatchclr.connect(srlatch_1.output("notq"), notQ)    # srlatch_1.out[1] -> output1

dlatchclr.connect(clk, or0.input("0"))    # input0 -> or0.in[0]
dlatchclr.connect(clr, or0.input("1"))    # input2 -> or0.in[1]
dlatchclr.connect(d, and0.input("0"))    # input1 -> and0.in[0]
dlatchclr.connect(clr, and0.input("1"))    # input2 -> and0.in[1]
dlatchclr.connect(or0, and1.input("0"))    # or0 -> and1.in[0]
dlatchclr.connect(and0, and1.input("1"))    # and0 -> and1.in[1]
dlatchclr.connect(and0, and2.input("1"))    # and0 -> and2.in[1]
dlatchclr.connect(or0, and2.input("0"))    # or0 -> and2.in[0]
dlatchclr.connect(and2, srlatch_1.input("s"))    # and2 -> srlatch_1.in[1]
dlatchclr.connect(and1, srlatch_1.input("r"))    # and1 -> srlatch_1.in[0]

d_latch_clr = circuit.Component(dlatchclr)

dflip_flop = circuit.Circuit(js_logging=True)

d1 = io.Input(label="D", bits=1, js_id="input_1_1753687049207")
d1.value = 0
en1 = io.Input(label="EN", bits=1, js_id="input_2_1753687058028")
en1.value = 0
clr1 = io.Input(label="CLR", bits=1, js_id="input_3_1753687058247")
clr1.value = 0
mux0 = plexers.Multiplexer(num_inputs=2, js_id="multiplexer_1_1753687440528")
d_latch_clr_1 = d_latch_clr()
d_latch_clr_2 = d_latch_clr()
output0 = io.Output(label="Q", bits=1, js_id="output_1_1753687420425")
clk0 = io.Clock(frequency=1, js_id="clock_1_1753687084421")
not0 = logic.Not(num_inputs=1, js_id="not-gate_1_1753687214640")

dflip_flop.connect(clk0, not0)    # clk0 -> not0
dflip_flop.connect(clr1, d_latch_clr_2.input("CLR"))    # clr1 -> d_latch_clr_2.in[2]
dflip_flop.connect(not0, d_latch_clr_2.input("CLK"))    # not0 -> d_latch_clr_2.in[0]
dflip_flop.connect(d_latch_clr_1.output("Q"), mux0.input("0"))    # d_latch_clr_1 -> mux0.in[0]
dflip_flop.connect(d1, mux0.input("1"))    # d1 -> mux0.in[1]
dflip_flop.connect(en1, mux0.input("sel"))    # en1 -> mux0.in[2]
dflip_flop.connect(mux0, d_latch_clr_2.input("D"))    # mux0 -> d_latch_clr_2.in[1]

dflip_flop.connect(clr1, d_latch_clr_1.input("CLR"))    # clr1 -> d_latch_clr_1.in[2]
dflip_flop.connect(clk0, d_latch_clr_1.input("CLK"))    # clk0 -> d_latch_clr_1.in[0]
dflip_flop.connect(d_latch_clr_2.output("Q"), d_latch_clr_1.input("D"))    # d_latch_clr_2 -> d_latch_clr_1.in[1]
dflip_flop.connect(d_latch_clr_1.output("Q"), output0)    # d_latch_clr_1 -> output0

d_flip_flop = circuit.Component(dflip_flop)

circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="EN", bits=1, js_id="input_1_1753942793773")
input1 = io.Input(label="CLK", bits=1, js_id="input_2_1753942797910")
input2 = io.Input(label="CLR", bits=1, js_id="input_3_1753942798257")
input3 = io.Input(label="D", bits=8, js_id="input_4_1753942799097")
d_flip_flop_1 = d_flip_flop()
d_flip_flop_2 = d_flip_flop()
d_flip_flop_3 = d_flip_flop()
d_flip_flop_4 = d_flip_flop()
d_flip_flop_5 = d_flip_flop()
d_flip_flop_6 = d_flip_flop()
d_flip_flop_7 = d_flip_flop()
d_flip_flop_8 = d_flip_flop()
splitter0 = wires.Splitter(bits=8, splits=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6), (7,7)], js_id="splitter_1_1753942944504")
merger0 = wires.Merger(bits=8, merge_inputs=[(0,0), (1,1), (2,2), (3,3), (4,4), (5,5), (6,6), (7,7)], js_id="merger_1_1753943555286")
output0 = io.Output(label="Q", bits=1, js_id="output_1_1753943670102")

circuit0.connect(input1, d_flip_flop_1.input("CLK"))    # input1 -> d_flip_flop_1.in[3]
circuit0.connect(input2, d_flip_flop_1.input("CLR"))    # input2 -> d_flip_flop_1.in[2]
circuit0.connect(input0, d_flip_flop_1.input("EN"))    # input0 -> d_flip_flop_1.in[1]
circuit0.connect(input1, d_flip_flop_2.input("CLK"))    # input1 -> d_flip_flop_2.in[3]
circuit0.connect(input2, d_flip_flop_2.input("CLR"))    # input2 -> d_flip_flop_2.in[2]
circuit0.connect(input0, d_flip_flop_2.input("EN"))    # input0 -> d_flip_flop_2.in[1]
circuit0.connect(input1, d_flip_flop_3.input("CLK"))    # input1 -> d_flip_flop_3.in[3]
circuit0.connect(input2, d_flip_flop_3.input("CLR"))    # input2 -> d_flip_flop_3.in[2]
circuit0.connect(input0, d_flip_flop_3.input("EN"))    # input0 -> d_flip_flop_3.in[1]
circuit0.connect(input1, d_flip_flop_4.input("CLK"))    # input1 -> d_flip_flop_4.in[3]
circuit0.connect(input2, d_flip_flop_4.input("CLR"))    # input2 -> d_flip_flop_4.in[2]
circuit0.connect(input0, d_flip_flop_4.input("EN"))    # input0 -> d_flip_flop_4.in[1]
circuit0.connect(input1, d_flip_flop_5.input("CLK"))    # input1 -> d_flip_flop_5.in[3]
circuit0.connect(input2, d_flip_flop_5.input("CLR"))    # input2 -> d_flip_flop_5.in[2]
circuit0.connect(input0, d_flip_flop_5.input("EN"))    # input0 -> d_flip_flop_5.in[1]
circuit0.connect(input1, d_flip_flop_6.input("CLK"))    # input1 -> d_flip_flop_6.in[3]
circuit0.connect(input2, d_flip_flop_6.input("CLR"))    # input2 -> d_flip_flop_6.in[2]
circuit0.connect(input0, d_flip_flop_6.input("EN"))    # input0 -> d_flip_flop_6.in[1]
circuit0.connect(input1, d_flip_flop_7.input("CLK"))    # input1 -> d_flip_flop_7.in[3]
circuit0.connect(input2, d_flip_flop_7.input("CLR"))    # input2 -> d_flip_flop_7.in[2]
circuit0.connect(input0, d_flip_flop_7.input("EN"))    # input0 -> d_flip_flop_7.in[1]
circuit0.connect(input1, d_flip_flop_8.input("CLK"))    # input1 -> d_flip_flop_8.in[3]
circuit0.connect(input2, d_flip_flop_8.input("CLR"))    # input2 -> d_flip_flop_8.in[2]
circuit0.connect(input0, d_flip_flop_8.input("EN"))    # input0 -> d_flip_flop_8.in[1]
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

