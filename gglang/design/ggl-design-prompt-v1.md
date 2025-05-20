# Golden Gates Language (GGL) Design

Golden Gates is a new educational circuit simulaton tool and user inteface for constructing and simulated digital logic circuits.

The Golden Gates Language (GGL) is a restricted version of Python that can specify circuits and sub-circuits.

The capabilities of GGL are based on the native circuit elements and components in the Digital Education Circuit Simulation Application:

https://github.com/hneemann/Digital

The Docs are here in PDF:

https://github.com/hneemann/Digital/releases/download/v0.31/Doc_English.pdf

I've attached this PDF.

Your job is to expand and generalize the proprosed specification below by adapting the elements and components found in Digital to GGL notation.

The circuit specification form should for the use of basic gates, wires, splitters, inputs, outputs, as well as higher level components like adders, multiplexors, decoders, etc. In GGL there are different elements:

- Primitive elements like gates and wires
- Built-in circuits like adders, multiplexors, and register
- User-defined circuits that are made up of primitive components, built-in circuits, and other user-define circuits.

Follow and expand on the examples given below.

```
# Simple GGL example of a user circuit
from ggl import circuit
from ggl import logic
from ggl import io

c = circuit.Circuit()

a1 = logic.and(bits=4, inputs=2, label="AND")
i1 = io.input(bits=4, label="A")
i2 = io.input(bits=4, label="B")
o1 = io.output(bits=4, label="R")
c.connect(i1, a1.inputs[0])
c.connect(i2, a1.inputs[1])
c.connect(a1, o1)

i1.value = 0b0001
i2.value = 0b1001
c.run()
print(o1)
# output should be 0b0001
```

Here is a an example of a 1-bit full adder:

```
from ggl import circuit
from ggl import logic
from ggl import io

c = circuit.Circuit()

# Inputs
a    = io.input(bits=1, label="a")
b    = io.input(bits=1, label="b")
cin  = io.input(bits=1, label="c")

# Internal gates
sum1 = logic.xor(bits=1, inputs=2)
sum2 = logic.xor(bits=1, inputs=2)
and1 = logic.and(bits=1, inputs=2)
and2 = logic.and(bits=1, inputs=2)
or1  = logic.or(bits=1, inputs=2)

# Outputs
sum_out = io.output(bits=1, label="sum")
cout    = io.output(bits=1, label="cout")

# Wiring for the sum bit: sum2 = a ⊕ b ⊕ cin
c.connect(a, sum1.inputs[0])
c.connect(b, sum1.inputs[1])
c.connect(sum1, sum2.inputs[0])
c.connect(cin, sum2.inputs[1])
c.connect(sum2, sum_out)

# Wiring for the carry-out: cout = (a ∧ b) ∨ ((a ⊕ b) ∧ cin)
c.connect(a, and1.inputs[0])
c.connect(b, and1.inputs[1])
c.connect(sum1.outputs[0], and2.inputs[0])
c.connect(cin, and2.inputs[1])
c.connect(and1, or1.inputs[0])
c.connect(and2, or1.inputs[1])
c.connect(or1, cout)

# Example: set inputs, run, and observe outputs
a.value   = 1
b.value   = 1
cin.value = 0

c.run()

print(f"Sum = {sum_out.value}")  # expected 0
print(f"Carry = {cout.value}")   # expected 1
```

You can turn a user-define circuit into a reusable component:

```
from ggl import circuit
from ggl import logic
from ggl import io

c = circuit.Circuit()

# Inputs
a    = io.input(bits=1, label="a")
b    = io.input(bits=1, label="b")
cin  = io.input(bits=1, label="cin")

# Internal gates
sum1 = logic.xor(bits=1, inputs=2)
sum2 = logic.xor(bits=1, inputs=2)
and1 = logic.and(bits=1, inputs=2)
and2 = logic.and(bits=1, inputs=2)
or1  = logic.or(bits=1, inputs=2)

# Outputs
sum  = io.output(bits=1, label="sum")
cout = io.output(bits=1, label="cout")

# Wiring for the sum bit: sum2 = a ⊕ b ⊕ cin
c.connect(a, sum1.inputs[0])
c.connect(b, sum1.inputs[1])
c.connect(sum1, sum2.inputs[0])
c.connect(cin,  sum2.inputs[1])
c.connect(sum2, sum)

# Wiring for the carry-out: cout = (a ∧ b) ∨ ((a ⊕ b) ∧ cin)
c.connect(a, and1.inputs[0])
c.connect(b, and1.inputs[1])
c.connect(sum1, and2.inputs[0])
c.connect(cin, and2.inputs[1])
c.connect(and1, or1.inputs[0])
c.connect(and2, or1.inputs[1])
c.connect(or1, cout)

full_adder_1bit = circuit.Component(c)
```

Now this component can be used in other user-defined circuits:

```
# 4-bit Ripple Carry Adder
from ggl import circuit
from ggl import logic
from ggl import io
from full_adder_1bit import *

# Create a new circuit
c = circuit.Circuit()

# --- Inputs ---
# Four bits of A
a0 = io.input(bits=1)
a1 = io.input(bits=1)
a2 = io.input(bits=1)
a3 = io.input(bits=1)

# Four bits of B
b0 = io.input(bits=1)
b1 = io.input(bits=1)
b2 = io.input(bits=1)
b3 = io.input(bits=1)

# Initial carry-in
cin = io.input(bits=1)

# --- Instantiate four 1-bit full adders ---
fa0 = full_adder_1bit()
fa1 = full_adder_1bit()
fa2 = full_adder_1bit()
fa3 = full_adder_1bit()

# --- Outputs ---
s0   = io.output(bits=1)
s1   = io.output(bits=1)
s2   = io.output(bits=1)
s3   = io.output(bits=1)
cout = io.output(bits=1)

# --- Wiring ---
# Bit 0
c.connect(a0, fa0.inputs[0])
c.connect(b0, fa0.inputs[1])
c.connect(cin, fa0.inputs[2])
c.connect(fa0.output("sum"), s0)       # sum0
# carry to next stage
c1 = fa0.output("cout")

# Bit 1
c.connect(a1,      fa1.input("a"))
c.connect(b1,      fa1.input("b"))
c.connect(c1,      fa1.input("cin"))
c.connect(fa1.output("cout"), s1)      # sum1
# carry to next stage
c2 = fa1.output("cout")

# Bit 2
c.connect(a2,      fa2.input("a"))
c.connect(b2,      fa2.input("b"))
c.connect(c2,      fa2.input("cin"))
c.connect(fa2.output("cout"), s2)      # sum2
# carry to next stage
c3 = fa2.output("cout")

# Bit 3
c.connect(a3,      fa3.input("a"))
c.connect(b3,      fa3.input("b"))
c.connect(c3,      fa3.input("cin))
c.connect(fa3.output("cout"), s3)      # sum3
c.connect(fa3.output[1], cout)     # final carry-out

# Package as a reusable component
ripple4 = circuit.Component(c)
```

It is possible to split and merge inputs and outputs that represent more than 1 bit.

```
# 4-bit Ripple Carry Adder
from ggl import circuit
from ggl import logic
from ggl import wires
from ggl import io

from full_adder_1bit import *

from ggl import circuit
from ggl import io
from full_adder_1bit import full_adder_1bit

# Create a new circuit
c = circuit.Circuit()

# --- Inputs ---
# Four bits of A
a = io.input(bits=4)
a_split = wires.split([4], [1,1,1,1])

# Four bits of B
b = io.input(bits=4)
b_split = wires.split([4], [1,1,1,1])

# Initial carry-in
cin = io.input(bits=1)

# --- Instantiate four 1-bit full adders ---
fa0 = full_adder_1bit()
fa1 = full_adder_1bit()
fa2 = full_adder_1bit()
fa3 = full_adder_1bit()

# --- Outputs ---
s_merge = wires.merge([1,1,1,1], [4])
sum  = io.output(bits=4, label="sum");
cout = io.output(bits=1)

# --- Wiring ---
# Bit 0
c.connect(a_split[0], fa0.input("a"))
c.connect(b_split[0], fa0_input("b"))
c.connect(cin, fa0.input("cin"))
c.connect(fa0.output("sum"), s0)       # sum0
# carry to next stage
c1 = fa0.output[1]

# Bit 1
c.connect(a1,      fa1.input("a"))
c.connect(b1,      fa1.input("b"))
c.connect(c1,      fa1.input("cin"))
c.connect(fa1.output("sum"), s1)       # sum1
# carry to next stage
c2 = fa1.output("cout")

# Bit 2
c.connect(a2,      fa2.input("a"))
c.connect(b2,      fa2.input("b"))
c.connect(c2,      fa2.input("cin"))
c.connect(fa2.output("sum"), s2)       # sum2
# carry to next stage
c3 = fa2.output("cout")

# Bit 3
c.connect(a3,      fa3.input("a"))
c.connect(b3,      fa3.input("b"))
c.connect(c3,      fa3.input("cin"))
c.connect(fa3.output("sum"), s3)       # sum3
c.connect(fa3.output("cout"), cout)     # final carry-out

# Package as a reusable component
ripple4 = circuit.Component(c)
```

When analyzing the Digital primitives and components, only focus on migrating the following elements:

D Components
1. Logic
1.1. And
1.2. NAnd
1.3. Or
1.4. NOr
1.5. XOr
1.6. XNOr
1.7. Not
2. IO
2.1. Output
2.2. LED
2.3. Input
2.4. Clock Input
2.5. Button
2.6. DIP Switch
2.7. Probe
6. Wires
6.1. Ground
6.2. Supply voltage
6.3. Constant value
6.4. Tunnel
6.5. Splitter/Merger
7. Plexers
7.1. Multiplexer
7.2. Demultiplexer
7.3. Decoder
7.4. Bit Selector
7.5. Priority Encoder
8. Flip-Flops
8.4. D-Flip-flop
9. Memory - RAM
9.1. RAM, separated Ports
9.6. RAM, Dual Port
11. Memory
11.1. Register
11.2. ROM
11.4. Counter
11.5. Counter with preset
12. Arithmetic
12.1. Adder
12.2. Subtract
12.3. Multiply
12.4. Division
12.5. Barrel shifter
12.6. Comparator
12.7. Negation
12.8. Sign extender
12.9. Bit counter
13. Switches
13.1. Switch
