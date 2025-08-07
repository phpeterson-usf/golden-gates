import sys
sys.path.append('../')

from ggl import circuit
from ggl import io
from ggl import logic

# First, create the 1-bit full adder component
c = circuit.Circuit()

# Inputs
a = io.Input(bits=1, label="a")
b = io.Input(bits=1, label="b")
cin = io.Input(bits=1, label="cin")

# Internal gates
sum1 = logic.Xor(bits=1)
sum2 = logic.Xor(bits=1)
and1 = logic.And(bits=1)
and2 = logic.And(bits=1)
or1 = logic.Or(bits=1)

# Outputs
sum_out = io.Output(bits=1, label="sum")
cout = io.Output(bits=1, label="cout")

# Wiring
c.connect(a, sum1.inputs[0])
c.connect(b, sum1.inputs[1])
c.connect(sum1, sum2.inputs[0])
c.connect(cin, sum2.inputs[1])
c.connect(sum2, sum_out)

c.connect(a, and1.inputs[0])
c.connect(b, and1.inputs[1])
c.connect(sum1, and2.inputs[0])
c.connect(cin, and2.inputs[1])
c.connect(and1, or1.inputs[0])
c.connect(and2, or1.inputs[1])
c.connect(or1, cout)

full_adder_1bit = circuit.Component(c)

# Create 4-bit ripple carry adder
ripple = circuit.Circuit()

# 4-bit inputs
a0 = io.Input(bits=1, label="a0")
a0.value = 1  # LSB
a1 = io.Input(bits=1, label="a1")
a1.value = 0
a2 = io.Input(bits=1, label="a2")
a2.value = 1
a3 = io.Input(bits=1, label="a3")
a3.value = 0  # MSB = 0101 (5)

b0 = io.Input(bits=1, label="b0")
b0.value = 1  # LSB
b1 = io.Input(bits=1, label="b1")
b1.value = 1
b2 = io.Input(bits=1, label="b2")
b2.value = 0
b3 = io.Input(bits=1, label="b3")
b3.value = 0  # MSB = 0011 (3)

cin = io.Input(bits=1, label="cin")
cin.value = 0

# Outputs
s0 = io.Output(bits=1, label="s0")
s1 = io.Output(bits=1, label="s1")
s2 = io.Output(bits=1, label="s2")
s3 = io.Output(bits=1, label="s3")
cout = io.Output(bits=1, label="cout")

# Instantiate four full adders
fa0 = full_adder_1bit()
fa1 = full_adder_1bit()
fa2 = full_adder_1bit()
fa3 = full_adder_1bit()

# Wire bit 0
ripple.connect(a0, fa0.inputs[0])
ripple.connect(b0, fa0.inputs[1])
ripple.connect(cin, fa0.inputs[2])
ripple.connect(fa0.output("sum"), s0)

# Wire bit 1
ripple.connect(a1, fa1.input("a"))
ripple.connect(b1, fa1.input("b"))
ripple.connect(fa0.output("cout"), fa1.input("cin"))
ripple.connect(fa1.output("sum"), s1)

# Wire bit 2
ripple.connect(a2, fa2.input("a"))
ripple.connect(b2, fa2.input("b"))
ripple.connect(fa1.output("cout"), fa2.input("cin"))
ripple.connect(fa2.output("sum"), s2)

# Wire bit 3
ripple.connect(a3, fa3.input("a"))
ripple.connect(b3, fa3.input("b"))
ripple.connect(fa2.output("cout"), fa3.input("cin"))
ripple.connect(fa3.output("sum"), s3)
ripple.connect(fa3.output("cout"), cout)

# Run: 5 + 3 = 8 (1000 in binary)
ripple.run()

print(s0.value)
print(s1.value)
print(s2.value)
print(s3.value)
print(cout.value)

ripple.stop()