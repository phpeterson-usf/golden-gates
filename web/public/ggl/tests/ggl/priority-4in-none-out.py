import sys
sys.path.append('../')

from ggl import io, circuit, plexers

circuit0 = circuit.Circuit()
decoder0 = plexers.PriorityEncoder(num_inputs=4, label='pri0')

in0 = io.Input(label='in0')
circuit0.connect(in0, decoder0.input("0"))
in0.value = 0

in1 = io.Input(label='in1')
circuit0.connect(in1, decoder0.input("1"))
in1.value = 0

in2 = io.Input(label='in2')
circuit0.connect(in2, decoder0.input("2"))
in2.value = 0

in3 = io.Input(label='in3')
circuit0.connect(in3, decoder0.input("3"))
in3.value = 0

inum = io.Output(bits=2, label='inum')
circuit0.connect(decoder0.output("inum"), inum)

any = io.Output(bits=1, label="any")
circuit0.connect(decoder0.output("any"), any)

circuit0.run()

print(inum.value)
print(any.value)

"""
Test the case where no inputs are high, so inum and any are both 0
expected
0
0
"""