import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import wires

circuit0 = circuit.Circuit()


a = io.Input(bits=8, label="a")
a.value = 0b10110110

split = wires.Splitter(label="split", bits=8, splits=[(1,0),(7,6),(5,4),(3,2)])


merge = wires.Merger(label="merge", bits=8, merge_inputs=[(0,1),(6,7),(4,5),(2,3)])


r = io.Output(bits=8, label="r")
circuit0.connect(a, split.inputs[0])

for i in range(len(split.splits)):
    circuit0.connect(split.outputs[i], merge.inputs[i])

circuit0.connect(merge, r.inputs[0])
circuit0.run()
circuit0.stop()

print(r.value)