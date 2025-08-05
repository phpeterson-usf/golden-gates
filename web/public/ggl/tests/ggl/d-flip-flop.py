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

dlatchclr = circuit.Component(dlatchclr)


circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="D", bits=1, js_id="input_1_1753687049207")
input0.value = 1
input1 = io.Input(label="EN", bits=1, js_id="input_2_1753687058028")
input1.value = 1
input2 = io.Input(label="CLR", bits=1, js_id="input_3_1753687058247")
input2.value = 0
mux0 = plexers.Multiplexer(selector_bits=1, js_id="multiplexer_1_1753687440528")
dlatchclr_1 = dlatchclr()
dlatchclr_2 = dlatchclr()
output0 = io.Output(label="Q", bits=1, js_id="output_1_1753687420425")
clk0 = io.Clock(frequency=1, mode="manual", js_id="clock_1_1753687084421")
not0 = logic.Not(num_inputs=1, js_id="not-gate_1_1753687214640")

circuit0.connect(input0, mux0.input("1"), js_id="wire_1753687506207")    # input0 -> mux0.in[1]
circuit0.connect(input1, mux0.input("sel"), js_id="wire_1753687509727")    # input1 -> mux0.in[2]
circuit0.connect(dlatchclr_2.output("Q"), dlatchclr_1.input("D"), js_id="wire_1753988206853")    # dlatchclr_2 -> dlatchclr_1.in[1]
circuit0.connect(clk0, dlatchclr_1.input("CLK"), js_id="wire_1753988215596")    # clk0 -> dlatchclr_1.in[0]
circuit0.connect(clk0, not0, js_id="wire_1753988227698")    # clk0 -> not0
circuit0.connect(not0, dlatchclr_2.input("CLK"), js_id="wire_1753988232282")    # not0 -> dlatchclr_2.in[0]
circuit0.connect(mux0, dlatchclr_2.input("D"), js_id="wire_1753988236898")    # mux0 -> dlatchclr_2.in[1]
circuit0.connect(input2, dlatchclr_1.input("CLR"), js_id="wire_1753988247138")    # input2 -> dlatchclr_1.in[2]
circuit0.connect(input2, dlatchclr_2.input("CLR"), js_id="wire_1753988253883")    # input2 -> dlatchclr_2.in[2]
circuit0.connect(dlatchclr_1.output("Q"), mux0.input("0"), js_id="wire_1753988282296")    # dlatchclr_1 -> mux0.in[0]
circuit0.connect(dlatchclr_1.output("Q"), output0, js_id="wire_1753988271166")    # dlatchclr_1 -> output0
circuit0.connect(dlatchclr_1.output("Q"), not0, js_id="wire_1753988227698")    # dlatchclr_1 -> not0
circuit0.connect(dlatchclr_1.output("Q"), dlatchclr_2.input("CLR"), js_id="wire_1753988253883")    # dlatchclr_1 -> dlatchclr_2.in[2]

circuit0.run()

print(output0.value)

tests = [
    (1, 1, 0),  # Test 1
    (0, 1, 0),  # Test 2
    (1, 0, 1),  # Test 3
    (1, 1, 1),  # Test 4
]


for i, (d_val, en_val, clr_val) in enumerate(tests, 1):
    input0.value = d_val
    input1.value = en_val
    input2.value = clr_val

    # Simulate clock rising edge: 0 -> 1
    #clk0.tick()
    #circuit0.run()
    circuit0.step()

# Tick the clock manually (rising edge)
    clk0.tick()
    circuit0.step(rising_edge=True)

    # Step again to stabilize any output change
    #circuit0.step()

    print(f"Test {i}: D={d_val}, EN={en_val}, CLR={clr_val} => Q={output0.value}")