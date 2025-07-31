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

d_flip_flop = circuit.Circuit(js_logging=True)

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

d_flip_flop.connect(clk0, not0)    # clk0 -> not0
d_flip_flop.connect(clr1, d_latch_clr_2.input("CLR"))    # clr1 -> d_latch_clr_2.in[2]
d_flip_flop.connect(not0, d_latch_clr_2.input("CLK"))    # not0 -> d_latch_clr_2.in[0]
d_flip_flop.connect(d_latch_clr_1.output("Q"), mux0.input("0"))    # d_latch_clr_1 -> mux0.in[0]
d_flip_flop.connect(d1, mux0.input("1"))    # d1 -> mux0.in[1]
d_flip_flop.connect(en1, mux0.input("sel"))    # en1 -> mux0.in[2]
d_flip_flop.connect(mux0, d_latch_clr_2.input("D"))    # mux0 -> d_latch_clr_2.in[1]

d_flip_flop.connect(clr1, d_latch_clr_1.input("CLR"))    # clr1 -> d_latch_clr_1.in[2]
d_flip_flop.connect(clk0, d_latch_clr_1.input("CLK"))    # clk0 -> d_latch_clr_1.in[0]
d_flip_flop.connect(d_latch_clr_2.output("Q"), d_latch_clr_1.input("D"))    # d_latch_clr_2 -> d_latch_clr_1.in[1]
d_flip_flop.connect(d_latch_clr_1.output("Q"), output0)    # d_latch_clr_1 -> output0

d_flip_flop.run()

print(output0.value)
