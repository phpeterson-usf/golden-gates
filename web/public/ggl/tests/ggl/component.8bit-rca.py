import sys
sys.path.append('../')

from ggl import circuit, io, logic, wires


circuit0 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=1)
input1 = io.Input(label="B", bits=1)
input2 = io.Input(label="CIN", bits=1)
and0 = logic.And(num_inputs=3)
and1 = logic.And(num_inputs=3, inverted_inputs=[2])
and2 = logic.And(num_inputs=3, inverted_inputs=[1])
and3 = logic.And(num_inputs=3, inverted_inputs=[0])
and4 = logic.And(num_inputs=3)
and5 = logic.And(num_inputs=3, inverted_inputs=[1, 2])
and6 = logic.And(num_inputs=3, inverted_inputs=[0, 2])
and7 = logic.And(num_inputs=3, inverted_inputs=[0, 1])
or0 = logic.Or(num_inputs=4)
or1 = logic.Or(num_inputs=4)
output0 = io.Output(label="COUT", bits=1)
output1 = io.Output(label="SUM1", bits=1)

circuit0.connect(input2, and1.input("2"))    # input2 -> and1.in[2]
circuit0.connect(input2, and2.input("2"))    # input2 -> and2.in[2]
circuit0.connect(input2, and3.input("2"))    # input2 -> and3.in[2]
circuit0.connect(input2, and4.input("2"))    # input2 -> and4.in[2]
circuit0.connect(input2, and5.input("2"))    # input2 -> and5.in[2]
circuit0.connect(input2, and6.input("2"))    # input2 -> and6.in[2]
circuit0.connect(input2, and7.input("2"))    # input2 -> and7.in[2]
circuit0.connect(input0, and1.input("0"))    # input0 -> and1.in[0]
circuit0.connect(input0, and2.input("0"))    # input0 -> and2.in[0]
circuit0.connect(input0, and3.input("0"))    # input0 -> and3.in[0]
circuit0.connect(input0, and4.input("0"))    # input0 -> and4.in[0]
circuit0.connect(input0, and5.input("0"))    # input0 -> and5.in[0]
circuit0.connect(input0, and6.input("0"))    # input0 -> and6.in[0]
circuit0.connect(input0, and7.input("0"))    # input0 -> and7.in[0]
circuit0.connect(input1, and1.input("1"))    # input1 -> and1.in[1]
circuit0.connect(input1, and2.input("1"))    # input1 -> and2.in[1]
circuit0.connect(input1, and3.input("1"))    # input1 -> and3.in[1]
circuit0.connect(input1, and4.input("1"))    # input1 -> and4.in[1]
circuit0.connect(input1, and5.input("1"))    # input1 -> and5.in[1]
circuit0.connect(input1, and6.input("1"))    # input1 -> and6.in[1]
circuit0.connect(input1, and7.input("1"))    # input1 -> and7.in[1]
circuit0.connect(and7, or1.input("0"))    # and7 -> or1.in[0]
circuit0.connect(and6, or1.input("1"))    # and6 -> or1.in[1]
circuit0.connect(and5, or1.input("2"))    # and5 -> or1.in[2]
circuit0.connect(and4, or1.input("3"))    # and4 -> or1.in[3]
circuit0.connect(and3, or0.input("0"))    # and3 -> or0.in[0]
circuit0.connect(and2, or0.input("1"))    # and2 -> or0.in[1]
circuit0.connect(and1, or0.input("2"))    # and1 -> or0.in[2]
circuit0.connect(and0, or0.input("3"))    # and0 -> or0.in[3]
circuit0.connect(or1, output1)    # or1 -> output1
circuit0.connect(or0, output0)    # or0 -> output0
circuit0.connect(input2, and0.input("2"))    # input2 -> and0.in[2]
circuit0.connect(input0, and0.input("0"))    # input0 -> and0.in[0]
circuit0.connect(input1, and0.input("1"))    # input1 -> and0.in[1]

# Export as a reusable component
add_1bit = circuit.Component(circuit0)

#-----------------------

circuit1 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=4)
input1 = io.Input(label="B", bits=4)
input2 = io.Input(label="CIN", bits=1)
splitter0 = wires.Splitter(bits=4, splits=[(0,0), (1,1), (2,2), (3,3)])
splitter1 = wires.Splitter(bits=4, splits=[(0,0), (1,1), (2,2), (3,3)])
add_1bit_1 = add_1bit()
add_1bit_2 = add_1bit()
add_1bit_3 = add_1bit()
add_1bit_4 = add_1bit()
merger0 = wires.Merger(bits=4, merge_inputs=[(0,0), (1,1), (2,2), (3,3)])
output0 = io.Output(label="COUT", bits=1)
output1 = io.Output(label="SUM4", bits=4)

circuit1.connect(add_1bit_1.output("COUT"), add_1bit_2.input("CIN"))    # add_1bit_1.out[1] -> add_1bit_2.in[2]
circuit1.connect(add_1bit_2.output("COUT"), add_1bit_3.input("CIN"))    # add_1bit_2.out[1] -> add_1bit_3.in[2]
circuit1.connect(add_1bit_3.output("COUT"), add_1bit_4.input("CIN"))    # add_1bit_3.out[1] -> add_1bit_4.in[2]
circuit1.connect(add_1bit_4.output("COUT"), output0)    # add_1bit_4.out[1] -> output0
circuit1.connect(add_1bit_1.output("SUM1"), merger0.input("0"))    # add_1bit_1 -> merger0.in[0]
circuit1.connect(add_1bit_2.output("SUM1"), merger0.input("1"))    # add_1bit_2 -> merger0.in[1]
circuit1.connect(add_1bit_3.output("SUM1"), merger0.input("2"))    # add_1bit_3 -> merger0.in[2]
circuit1.connect(add_1bit_4.output("SUM1"), merger0.input("3"))    # add_1bit_4 -> merger0.in[3]
circuit1.connect(merger0, output1)    # merger0 -> output1
circuit1.connect(input2, add_1bit_1.input("CIN"))    # input2 -> add_1bit_1.in[2]
circuit1.connect(input0, splitter0)    # input0 -> splitter0
circuit1.connect(splitter0.output("0"), add_1bit_1.input("A"))    # splitter0 -> add_1bit_1.in[0]
circuit1.connect(splitter0.output("1"), add_1bit_2.input("A"))    # splitter0.out[1] -> add_1bit_2.in[0]
circuit1.connect(splitter0.output("2"), add_1bit_3.input("A"))    # splitter0.out[2] -> add_1bit_3.in[0]
circuit1.connect(splitter0.output("3"), add_1bit_4.input("A"))    # splitter0.out[3] -> add_1bit_4.in[0]
circuit1.connect(input1, splitter1)    # input1 -> splitter1
circuit1.connect(splitter1.output("0"), add_1bit_1.input("B"))    # splitter1 -> add_1bit_1.in[1]
circuit1.connect(splitter1.output("1"), add_1bit_2.input("B"))    # splitter1.out[1] -> add_1bit_2.in[1]
circuit1.connect(splitter1.output("2"), add_1bit_3.input("B"))    # splitter1.out[2] -> add_1bit_3.in[1]
circuit1.connect(splitter1.output("3"), add_1bit_4.input("B"))    # splitter1.out[3] -> add_1bit_4.in[1]

# Export as a reusable component
add_4bit = circuit.Component(circuit1)

#-----------------------

circuit2 = circuit.Circuit(js_logging=True)

input0 = io.Input(label="A", bits=8)
input0.value = 0x12
input1 = io.Input(label="B", bits=8)
input1.value = 0x34
input2 = io.Input(label="CIN", bits=1)
input2.value = 0
splitter0 = wires.Splitter(bits=8, splits=[(0,3), (4,7)])
splitter1 = wires.Splitter(bits=8, splits=[(0,3), (4,7)])
add_4bit_1 = add_4bit()
add_4bit_2 = add_4bit()
merger0 = wires.Merger(bits=8, merge_inputs=[(0,3), (4,7)])
output0 = io.Output(label="COUT", bits=1)
output1 = io.Output(label="SUM8", bits=8)

circuit2.connect(splitter0.output("0"), add_4bit_1.input("A"))    # splitter0 -> add_4bit_1.in[0]
circuit2.connect(splitter0.output("1"), add_4bit_2.input("A"))    # splitter0.out[1] -> add_4bit_2.in[0]
circuit2.connect(splitter1.output("0"), add_4bit_1.input("B"))    # splitter1 -> add_4bit_1.in[1]
circuit2.connect(splitter1.output("1"), add_4bit_2.input("B"))    # splitter1.out[1] -> add_4bit_2.in[1]
circuit2.connect(add_4bit_1.output("COUT"), add_4bit_2.input("CIN"))    # add_4bit_1.out[1] -> add_4bit_2.in[2]
circuit2.connect(input2, add_4bit_1.input("CIN"))    # input2 -> add_4bit_1.in[2]
circuit2.connect(add_4bit_1.output("SUM4"), merger0.input("0"))    # add_4bit_1 -> merger0.in[0]
circuit2.connect(add_4bit_2.output("SUM4"), merger0.input("1"))    # add_4bit_2 -> merger0.in[1]
circuit2.connect(add_4bit_2.output("COUT"), output0)    # add_4bit_2.out[1] -> output0
circuit2.connect(merger0, output1)    # merger0 -> output1
circuit2.connect(input0, splitter0)    # input0 -> splitter0
circuit2.connect(input1, splitter1)    # input1 -> splitter1
circuit2.run()

print(hex(output1.value))  # expected: 0x46