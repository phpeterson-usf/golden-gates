import sys
sys.path.append('../')
from ggl import arithmetic, circuit, io

# Test that both old and new syntax work together
circuit0 = circuit.Circuit()

adder = arithmetic.Adder(bits=8)
a = io.Input(bits=8)
b = io.Input(bits=8)
cin = io.Constant(bits=1)
cin.value = 1
sum_out = io.Output(bits=8)

# Mix old and new syntax in the same circuit
circuit0.connect(a, adder.input("a"))    # OLD syntax
circuit0.connect(b, adder.b)             # NEW syntax
circuit0.connect(cin, adder.cin)         # NEW syntax
circuit0.connect(adder.sum, sum_out)     # NEW syntax

a.value = 100
b.value = 50
circuit0.run()

print(sum_out.value)