import sys
sys.path.append('../')
from ggl import arithmetic, circuit, io

# Test attribute-style syntax with arithmetic components
circuit0 = circuit.Circuit()

# Create components
a = io.Input(bits=8)
b = io.Input(bits=8)
adder = arithmetic.Adder(bits=8)
comp = arithmetic.Comparator(bits=8)
sum_out = io.Output(bits=8)
eq_out = io.Output(bits=1)

# Use NEW attribute syntax
circuit0.connect(a, adder.a)        # instead of adder.input("a")
circuit0.connect(b, adder.b)        # instead of adder.input("b")
circuit0.connect(a, comp.a)         # instead of comp.input("a")
circuit0.connect(b, comp.b)         # instead of comp.input("b")

circuit0.connect(adder.sum, sum_out)    # instead of adder.output("sum")
circuit0.connect(comp.eq, eq_out)       # instead of comp.output("eq")

# Connect carry-in to 0
cin = io.Constant(bits=1)
cin.value = 0
circuit0.connect(cin, adder.cin)    # instead of adder.input("cin")

# Test
a.value = 15
b.value = 10
circuit0.run()

print(f"{sum_out.value}")
print(f"{eq_out.value}")

circuit0.stop()