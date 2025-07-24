import sys
sys.path.append('../')
from ggl import circuit, logic, io, wires, plexers
# build srlatch

def make_d_latch_clr(d_val, clk_val, clr_val):
    circuit0 = circuit.Circuit(js_logging=True)
    # inputs r and s
    input1 = io.Input(bits=1, label="r")
    input1.value = 0

    input2 = io.Input(bits=1, label="s")
    input2.value = 0

    # outputs
    output1 = io.Output(bits=1, label="q", js_id="output_1")
    output2 = io.Output(bits=1, label="notq", js_id="output_2")
    # wiring
    nor2 = logic.Nor()
    nor1 = logic.Nor()
    circuit0.connect(input2, nor2.input("1"))    # input2 -> nor2.in[1]
    circuit0.connect(input1, nor1.input("0"))    # input1 -> nor1.in[0]
    circuit0.connect(nor2, nor1.input("1"))    # nor2 -> nor1.in[1]
    circuit0.connect(nor1, nor2.input("0"))    # nor1 -> nor2.in[0]
    circuit0.connect(nor1, output1)    # nor1 -> output1
    circuit0.connect(nor2, output2)    # nor2 -> output2

    sr_latch = circuit.Component(circuit0)

    d_latch_clr = circuit.Circuit()


    # inputs
    clk = io.Clock(frequency=1,label="CLK")
    clk.value = clk_val
    d = io.Input(bits=1, label="D")
    d.value = d_val
    clr = io.Input(bits=1, label="CLR")
    clr.value = clr_val
    or0 = logic.Or()
    and0 = logic.And(inverted_inputs=[1])
    and1 = logic.And(inverted_inputs=[1])
    and2 = logic.And()
    srlatch_1 = sr_latch()
    # outputs
    Q = io.Output(bits=1, label="Q", js_id="output_1_1753221650549")
    notQ = io.Output(bits=1, label="notQ", js_id="output_2_1753221652561")

    # wiring
    d_latch_clr.connect(srlatch_1.output("q"), Q)    # srlatch_1 -> output0
    d_latch_clr.connect(srlatch_1.output("notq"), notQ)    # srlatch_1.out[1] -> output1
    d_latch_clr.connect(clk, or0.input("0"))    # input0 -> or0.in[0]
    d_latch_clr.connect(clr, or0.input("1"))    # input2 -> or0.in[1]
    d_latch_clr.connect(d, and0.input("0"))    # input1 -> and0.in[0]
    d_latch_clr.connect(clr, and0.input("1"))    # input2 -> and0.in[1]
    d_latch_clr.connect(or0, and1.input("0"))    # or0 -> and1.in[0]
    d_latch_clr.connect(and0, and1.input("1"))    # and0 -> and1.in[1]
    d_latch_clr.connect(and0, and2.input("1"))    # and0 -> and2.in[1]
    d_latch_clr.connect(or0, and2.input("0"))    # or0 -> and2.in[0]
    d_latch_clr.connect(and2, srlatch_1.input("s"))    # and2 -> srlatch_1.in[1]
    d_latch_clr.connect(and1, srlatch_1.input("r"))    # and1 -> srlatch_1.in[0]

    d_latch_clr.run()
    return Q.value, notQ.value

for i, (d_val, clk_val, clr_val) in enumerate([
    (1, 1, 0),
    (0, 1, 0),
    (1, 0, 0),
    (0, 0, 1),
    (1, 1, 1),
    (1, 0, 0),
], start=1):
    q, notq = make_d_latch_clr(d_val, clk_val, clr_val)
    print(f"Test {i}: D={d_val}, CLK={clk_val}, CLR={clr_val} => Q={q}, ~Q={notq}")