import sys
sys.path.append('../')

from ggl import io, logic, circuit

circuit0 = circuit.Circuit(js_logging=True)

input1 = io.Input(bits=1, label="R")
input1.value = 0

input2 = io.Input(bits=1, label="S")
input2.value = 0

nor2 = logic.Nor()
circuit0.connect(input2, nor2.input("1"))    # input2 -> nor2.in[1]

nor1 = logic.Nor()
circuit0.connect(input1, nor1.input("0"))    # input1 -> nor1.in[0]
circuit0.connect(nor2, nor1.input("1"))    # nor2 -> nor1.in[1]
circuit0.connect(nor1, nor2.input("0"))    # nor1 -> nor2.in[0]

output1 = io.Output(bits=1, label="Q", js_id="output_1")
circuit0.connect(nor1, output1)    # nor1 -> output1

output2 = io.Output(bits=1, label="NotQ", js_id="output_2")
circuit0.connect(nor2, output2)    # nor2 -> output2

circuit0.run()
print(output1.value)
print(output2.value)