import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import wires

circuit0 = circuit.Circuit()

a = io.Input(bits=4, label="a")
a.value = 0b1010                                                    # input val 10

split = wires.Splitter(label="split", bits=4)
merge = wires.Merger(label="merge", bits=4)

r = io.Output(bits=4, label="R")

circuit0.connect(a, split.inputs[0])

for i in range(a.bits):
    circuit0.connect(split.outputs[i], merge.inputs[i])

circuit0.connect(merge, r.inputs[0])

circuit0.run()
circuit0.stop()
print(r.value)
