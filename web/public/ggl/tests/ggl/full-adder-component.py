import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

# Create a 1-bit full adder subcircuit
c = circuit.Circuit()

# Inputs
a = io.Input(bits=1, label="a")
b = io.Input(bits=1, label="b")
cin = io.Input(bits=1, label="cin")

# Internal gates
sum1 = logic.Xor(label="sum1", bits=1)
sum2 = logic.Xor(label="sum2", bits=1)
and1 = logic.And(label="and1", bits=1)
and2 = logic.And(label="and2", bits=1)
or1 = logic.Or(label="or1", bits=1)

# Outputs
sum_out = io.Output(bits=1, label="sum")
cout = io.Output(bits=1, label="cout")

# Wiring for the sum bit: sum = a ⊕ b ⊕ cin
c.connect(a, sum1.inputs[0])
c.connect(b, sum1.inputs[1])
c.connect(sum1, sum2.inputs[0])
c.connect(cin, sum2.inputs[1])
c.connect(sum2, sum_out)

# Wiring for the carry-out: cout = (a ∧ b) ∨ ((a ⊕ b) ∧ cin)
c.connect(a, and1.inputs[0])
c.connect(b, and1.inputs[1])
c.connect(sum1, and2.inputs[0])
c.connect(cin, and2.inputs[1])
c.connect(and1, or1.inputs[0])
c.connect(and2, or1.inputs[1])
c.connect(or1, cout)

# Create reusable component
full_adder_1bit = circuit.Component(c)

# Test the component
test_circuit = circuit.Circuit()

# Test inputs
test_a = io.Input(bits=1, label="test_a")
test_a.value = 1

test_b = io.Input(bits=1, label="test_b")
test_b.value = 1

test_cin = io.Input(bits=1, label="test_cin")
test_cin.value = 0

# Test outputs
test_sum = io.Output(bits=1, label="test_sum")
test_cout = io.Output(bits=1, label="test_cout")

# Instantiate the full adder
fa = full_adder_1bit()

# Connect test inputs to full adder
test_circuit.connect(test_a, fa.input("a"))
test_circuit.connect(test_b, fa.input("b"))
test_circuit.connect(test_cin, fa.input("cin"))
test_circuit.connect(fa.output("sum"), test_sum)
test_circuit.connect(fa.output("cout"), test_cout)

# Run test: 1 + 1 + 0 = 10 (sum=0, carry=1)
test_circuit.run()

print(test_sum.value)
print(test_cout.value)

test_circuit.stop()