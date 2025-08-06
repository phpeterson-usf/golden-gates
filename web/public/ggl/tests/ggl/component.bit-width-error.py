import sys
sys.path.append('../')

from ggl import circuit, io, logic, wires
from ggl.errors import CircuitError

circuit0 = circuit.Circuit(js_logging=True, circuit_name="add_1bit")

input0 = io.Input(label="A", bits=1, js_id="input_1_1753897146463")
input1 = io.Input(label="B", bits=1, js_id="input_2_1753897149632")
input2 = io.Input(label="CIN", bits=1, js_id="input_3_1753897156434")
and0 = logic.And(num_inputs=3, inverted_inputs=[0, 1], js_id="and-gate_1_1753897197345")
and1 = logic.And(num_inputs=3, inverted_inputs=[0, 2], js_id="and-gate_1753897212565_m6ghz7phz")
and2 = logic.And(num_inputs=3, inverted_inputs=[1, 2], js_id="and-gate_1753897215516_p9jt67wbu")
and3 = logic.And(num_inputs=3, js_id="and-gate_1753897215516_bc9520mj8")
and4 = logic.And(num_inputs=3, inverted_inputs=[0], js_id="and-gate_1753897220336_g2d8c6g0w")
and5 = logic.And(num_inputs=3, inverted_inputs=[1], js_id="and-gate_1753897220336_7u31wd89y")
and6 = logic.And(num_inputs=3, inverted_inputs=[2], js_id="and-gate_1753897220336_dyntmp6zl")
and7 = logic.And(num_inputs=3, js_id="and-gate_1753897220336_d11qtipw2")
or0 = logic.Or(num_inputs=4, js_id="or-gate_1_1753897567293")
or1 = logic.Or(num_inputs=4, js_id="or-gate_1753897583016_cfx5n4m6e")
output0 = io.Output(label="SUM", bits=1, js_id="output_1_1753897458222")
output1 = io.Output(label="COUT", bits=1, js_id="output_2_1753897474607")

circuit0.connect(input2, and7.input("2"), js_id="wire_1753897268912")    # input2 -> and7.in[2]
circuit0.connect(input2, and6.input("2"), js_id="wire_1753897275863")    # input2 -> and6.in[2]
circuit0.connect(input2, and5.input("2"), js_id="wire_1753897279268")    # input2 -> and5.in[2]
circuit0.connect(input2, and4.input("2"), js_id="wire_1753897282087")    # input2 -> and4.in[2]
circuit0.connect(input2, and3.input("2"), js_id="wire_1753897289558")    # input2 -> and3.in[2]
circuit0.connect(input2, and2.input("2"), js_id="wire_1753897292003")    # input2 -> and2.in[2]
circuit0.connect(input2, and1.input("2"), js_id="wire_1753897295349")    # input2 -> and1.in[2]
circuit0.connect(input2, and0.input("2"), js_id="wire_1753897299916")    # input2 -> and0.in[2]
circuit0.connect(input0, and7.input("0"), js_id="wire_1753897315050")    # input0 -> and7.in[0]
circuit0.connect(input0, and6.input("0"), js_id="wire_1753897317418")    # input0 -> and6.in[0]
circuit0.connect(input0, and5.input("0"), js_id="wire_1753897319950")    # input0 -> and5.in[0]
circuit0.connect(input0, and4.input("0"), js_id="wire_1753897323117")    # input0 -> and4.in[0]
circuit0.connect(input0, and3.input("0"), js_id="wire_1753897326466")    # input0 -> and3.in[0]
circuit0.connect(input0, and2.input("0"), js_id="wire_1753897329129")    # input0 -> and2.in[0]
circuit0.connect(input0, and1.input("0"), js_id="wire_1753897331824")    # input0 -> and1.in[0]
circuit0.connect(input0, and0.input("0"), js_id="wire_1753897334800")    # input0 -> and0.in[0]
circuit0.connect(input1, and7.input("1"), js_id="wire_1753897341683")    # input1 -> and7.in[1]
circuit0.connect(input1, and6.input("1"), js_id="wire_1753897345081")    # input1 -> and6.in[1]
circuit0.connect(input1, and5.input("1"), js_id="wire_1753897347666")    # input1 -> and5.in[1]
circuit0.connect(input1, and4.input("1"), js_id="wire_1753897351260")    # input1 -> and4.in[1]
circuit0.connect(input1, and3.input("1"), js_id="wire_1753897354149")    # input1 -> and3.in[1]
circuit0.connect(input1, and2.input("1"), js_id="wire_1753897364500")    # input1 -> and2.in[1]
circuit0.connect(input1, and1.input("1"), js_id="wire_1753897366989")    # input1 -> and1.in[1]
circuit0.connect(input1, and0.input("1"), js_id="wire_1753897370567")    # input1 -> and0.in[1]
circuit0.connect(and0, or0.input("0"), js_id="wire_1753897388649")    # and0 -> or0.in[0]
circuit0.connect(and1, or0.input("1"), js_id="wire_1753897397826")    # and1 -> or0.in[1]
circuit0.connect(and2, or0.input("2"), js_id="wire_1753897403165")    # and2 -> or0.in[2]
circuit0.connect(and3, or0.input("3"), js_id="wire_1753897410847")    # and3 -> or0.in[3]
circuit0.connect(and4, or1.input("0"), js_id="wire_1753897435502")    # and4 -> or1.in[0]
circuit0.connect(and5, or1.input("1"), js_id="wire_1753897441840")    # and5 -> or1.in[1]
circuit0.connect(and6, or1.input("2"), js_id="wire_1753897448173")    # and6 -> or1.in[2]
circuit0.connect(and7, or1.input("3"), js_id="wire_1753897453393")    # and7 -> or1.in[3]
circuit0.connect(or0, output0, js_id="wire_1753897580211")    # or0 -> output0
circuit0.connect(or1, output1, js_id="wire_1753897596139")    # or1 -> output1

# Export as a reusable component
add_1bit = circuit.Component(circuit0)


circuit0 = circuit.Circuit(js_logging=True, circuit_name="add_4bit")

input0 = io.Input(label="A", bits=4, js_id="input_1_1753899140854")
input1 = io.Input(label="B", bits=4, js_id="input_2_1753899197287")
input2 = io.Input(label="CIN", bits=1, js_id="input_3_1753899329970")
add_1bit_1 = add_1bit()
add_1bit_2 = add_1bit()
add_1bit_3 = add_1bit()
add_1bit_4 = add_1bit()
merger0 = wires.Merger(bits=4, merge_inputs=[(0,0), (1,1), (2,2), (3,3)], js_id="merger_1_1753899079940")
splitter0 = wires.Splitter(bits=4, splits=[(0,0), (1,1), (2,2), (3,3)], js_id="splitter_1_1753899153448")
splitter1 = wires.Splitter(bits=4, splits=[(0,0), (1,1), (2,2), (3,3)], js_id="splitter_1753899205541_q8ksohe46")
output0 = io.Output(label="SUM", bits=5, js_id="output_1_1753899042632")
output1 = io.Output(label="COUT", bits=1, js_id="output_2_1753899060901")

circuit0.connect(add_1bit_1.output("COUT"), add_1bit_2.input("CIN"), js_id="wire_1753899029044")    # add_1bit_1.out[1] -> add_1bit_2.in[2]
circuit0.connect(add_1bit_2.output("COUT"), add_1bit_3.input("CIN"), js_id="wire_1753899033932")    # add_1bit_2.out[1] -> add_1bit_3.in[2]
circuit0.connect(add_1bit_3.output("COUT"), add_1bit_4.input("CIN"), js_id="wire_1753899038768")    # add_1bit_3.out[1] -> add_1bit_4.in[2]
circuit0.connect(add_1bit_4.output("COUT"), output1, js_id="wire_1753899075094")    # add_1bit_4.out[1] -> output1
circuit0.connect(add_1bit_1.output("SUM"), merger0.input("0"), js_id="wire_1753899103335")    # add_1bit_1 -> merger0.in[0]
circuit0.connect(add_1bit_2.output("SUM"), merger0.input("1"), js_id="wire_1753899108827")    # add_1bit_2 -> merger0.in[1]
circuit0.connect(add_1bit_3.output("SUM"), merger0.input("2"), js_id="wire_1753899114595")    # add_1bit_3 -> merger0.in[2]
circuit0.connect(add_1bit_4.output("SUM"), merger0.input("3"), js_id="wire_1753899120623")    # add_1bit_4 -> merger0.in[3]
circuit0.connect(merger0, output0, js_id="wire_1753899124863")    # merger0 -> output0
circuit0.connect(input2, add_1bit_1.input("CIN"), js_id="wire_1753899138693")    # input2 -> add_1bit_1.in[2]
circuit0.connect(input0, splitter0, js_id="wire_1753899172193")    # input0 -> splitter0
circuit0.connect(splitter0.output("0"), add_1bit_1.input("A"), js_id="wire_1753899177836")    # splitter0 -> add_1bit_1.in[0]
circuit0.connect(splitter0.output("1"), add_1bit_2.input("A"), js_id="wire_1753899182903")    # splitter0.out[1] -> add_1bit_2.in[0]
circuit0.connect(splitter0.output("2"), add_1bit_3.input("A"), js_id="wire_1753899187032")    # splitter0.out[2] -> add_1bit_3.in[0]
circuit0.connect(splitter0.output("3"), add_1bit_4.input("A"), js_id="wire_1753899192037")    # splitter0.out[3] -> add_1bit_4.in[0]
circuit0.connect(input1, splitter1, js_id="wire_1753899213287")    # input1 -> splitter1
circuit0.connect(splitter1.output("0"), add_1bit_1.input("B"), js_id="wire_1753899220871")    # splitter1 -> add_1bit_1.in[1]
circuit0.connect(splitter1.output("1"), add_1bit_2.input("B"), js_id="wire_1753899229596")    # splitter1.out[1] -> add_1bit_2.in[1]
circuit0.connect(splitter1.output("2"), add_1bit_3.input("B"), js_id="wire_1753899236292")    # splitter1.out[2] -> add_1bit_3.in[1]
circuit0.connect(splitter1.output("3"), add_1bit_4.input("B"), js_id="wire_1753899243358")    # splitter1.out[3] -> add_1bit_4.in[1]

# Export as a reusable component
add_4bit = circuit.Component(circuit0)

circuit0 = circuit.Circuit(js_logging=True, circuit_name="add_8bit")

input0 = io.Input(label="A", bits=8, js_id="input_1_1753899394884")
input0.value = 0x00
input1 = io.Input(label="B", bits=8, js_id="input_1753899454736_ioaoywl7x")
input1.value = 0x00
input2 = io.Input(label="CIN", bits=1, js_id="input_3_1753899495299")
input2.value = 0
add_4bit_1 = add_4bit()
add_4bit_2 = add_4bit()
splitter0 = wires.Splitter(bits=8, splits=[(0,3), (4,7)], js_id="splitter_1_1753899407603")
splitter1 = wires.Splitter(bits=8, splits=[(0,3), (4,7)], js_id="splitter_1753899454736_x90t5m7ru")
merger0 = wires.Merger(bits=8, merge_inputs=[(0,3), (4,7)], js_id="merger_1_1753899513793")
output0 = io.Output(label="COUT", bits=1, js_id="output_1_1753899549943")
output1 = io.Output(label="SUM", bits=8, js_id="output_2_1753899571628")

circuit0.connect(splitter0.output("0"), add_4bit_1.input("A"), js_id="wire_1753899471685")    # splitter0 -> add_4bit_1.in[0]
circuit0.connect(splitter0.output("1"), add_4bit_2.input("A"), js_id="wire_1753899477260")    # splitter0.out[1] -> add_4bit_2.in[0]
circuit0.connect(splitter1.output("0"), add_4bit_1.input("B"), js_id="wire_1753899481789")    # splitter1 -> add_4bit_1.in[1]
circuit0.connect(splitter1.output("1"), add_4bit_2.input("B"), js_id="wire_1753899486861")    # splitter1.out[1] -> add_4bit_2.in[1]
circuit0.connect(add_4bit_1.output("COUT"), add_4bit_2.input("CIN"), js_id="wire_1753899491155")    # add_4bit_1.out[1] -> add_4bit_2.in[2]
circuit0.connect(input2, add_4bit_1.input("CIN"), js_id="wire_1753899508645")    # input2 -> add_4bit_1.in[2]
circuit0.connect(add_4bit_1.output("SUM"), merger0.input("0"), js_id="wire_1753899538549")    # add_4bit_1 -> merger0.in[0]
circuit0.connect(add_4bit_2.output("SUM"), merger0.input("1"), js_id="wire_1753899544521")    # add_4bit_2 -> merger0.in[1]
circuit0.connect(add_4bit_2.output("COUT"), output0, js_id="wire_1753899561743")    # add_4bit_2.out[1] -> output0
circuit0.connect(merger0, output1, js_id="wire_1753899582359")    # merger0 -> output1
circuit0.connect(input0, splitter0, js_id="wire_1753904410717")    # input0 -> splitter0
circuit0.connect(input1, splitter1, js_id="wire_1753904413831")    # input1 -> splitter1

try:
    circuit0.run()
except CircuitError as err:
    print(err)