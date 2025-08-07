import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import wires

circuit0 = circuit.Circuit()


a = io.Input(bits=32, label="a")
a.value = 0x12345678 

split = wires.Splitter(label="split", bits=32, splits=[(0,7),(8,15),(16,23),(24,31)])


merge = wires.Merger(label="merge", bits=32, merge_inputs=[(0,7),(8,15),(16,23),(24,31)])


r = io.Output(bits=32, label="r")
circuit0.connect(a, split.inputs[0])

for i in range(len(split.splits)):
    circuit0.connect(split.outputs[i], merge.inputs[i])

circuit0.connect(merge, r.inputs[0])
circuit0.run()

print(r.value)
circuit0.stop()