
You: 

Golden Gates is a new educational circuit simulaton tool and user inteface for constructing and simulated digital logic circuits.

The Golden Gates Language (GGL) is a restricted version of Python that can specify circuits and sub-circuits.

The capabilities of GGL are based on the native circuit elements and components in the Digital Education Circuit Simulation Application:

https://github.com/hneemann/Digital

The Docs are here in PDF:

https://github.com/hneemann/Digital/releases/download/v0.31/Doc_English.pdf

The circuit specification form should for the use of basic gates, wires, splitters, inputs, outputs, as well as higher level components like adders, muxes, decoders, etc.

Here is what we are thinking of an initial form:



```
from ggl import circuit
from ggl import logic

c = circuit.Circuit()

a1 = c.logic.and(bits=4, input=2)
i1 = c.logic.input(bits=4)
i2 = c.logic.input(bits=4)
o1 = c.logic.ouput(bits=4)
c.connect(i1, a1.input[0])
c.connect(i2, a1.input[0])
c.connect(a1.ouput, o1)

i1.value = 0b0001
i2.value = 0b1001
c.run()
print(o1)
# output should be 0b0001
```


Propose a full specification of GGL by analyzing the current Digital (https://github.com/hneemann/Digital/releases/download/v0.31/Doc_English.pdf) functionality and generalizing the example form above. You can also give design options with tradeoffs.

ChatGPT: 

To create a complete specification for the Golden Gates Language (GGL), could you clarify the following:

 
2. Should the GGL support all components and features from the Digital tool, including memories, clocking, and sequential elements?
 
4. Should the language be limited to simulation scripting, or should it also support UI interactions (e.g., placing components on a virtual grid)?
 
6. Are you targeting beginners, advanced users, or both in terms of the abstraction level?
 
8. Would you like the specification to include a standard library of reusable subcircuits or just primitives?
 
10. Are there any performance or interoperability goals (e.g., export to Verilog, run on microcontrollers)?


Once I have this information, I can generate a comprehensive and structured specification proposal for GGL.

You: 

In the first draft GGL does not need to support all components and features from the Digital tool. See below for the list of components to support.

GGL should support simulation scripting, but it is also going to be used as a circuit specification that could be used by a UI front end. We can either "eval" the circuit to get an in-memory circuit data structure or use the Python AST library to parse and form the circuit data structure in memory. So, GGL won't support UI interaction directly, but it will be used to provide a UI with a circuit data structure than then can be edited in a graphical schematic form (like Digital).

We are targeting beginner to intermediate users. However we want GGL to be rich enough to be able to specify large circuits like a processor implementation with a register file, decoder, ALU, memory, etc.

The specification should include primitives (like gates and wires), and a standard library of higher-level components like adders and registers.

We don't have strong performance goals other than simulation should be reasonable efficient. We don't current have interoperability goals, but export to Verilog would be nice in the future.

Here is the list of initial supported components:

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

ChatGPT: 

Great, I’ll create a complete first-draft specification of the Golden Gates Language (GGL) based on the components you've selected from the Digital simulation tool. I’ll focus on a beginner- to intermediate-friendly syntax for defining digital circuits using Python-like constructs, support simulation scripting, and design for integration with a future UI.


This will include primitive gates, IO, wiring elements, memory, and arithmetic modules, and will suggest language constructs, class structures, connection mechanisms, and extensibility features (e.g., standard library of higher-level components). I’ll also outline optional design tradeoffs such as dynamic typing vs. strong typing, flat vs. hierarchical modules, and function-based vs. object-oriented definitions.


I’ll let you know once the full GGL specification is ready.
Research completed in 17m · 34 sources · 28 searches
Golden Gates Language (GGL) Specification for Digital Circuit Modeling

# Golden Gates Language (GGL) Specification 


## Introduction and Design Goals 

Golden Gates Language (GGL) is a Python-based domain-specific language (DSL) for describing and simulating digital logic circuits. It is inspired by the component set of Helmut Neemann’s *Digital* logic simulator[github.com](https://github.com/hneemann/Digital#:~:text=,to%20create%20a)  and targets beginner to intermediate users. GGL’s syntax and semantics are designed to be **readable and Python-like** , making it accessible to those with basic Python knowledge[aha.stanford.edu](https://aha.stanford.edu/building-dsls-python#:~:text=Python%20is%20the%20preferred%C2%A0language%20for,my%20experience%20of%20building%C2%A0DSLs%20at%C2%A0AHA) . The language aims to serve both as a scripting interface for simulation and as a schematic description format for a future GUI editor. Key design goals include:
 
- **Clarity and Readability:**  Use a Python-like syntax (indentation, object instantiation, etc.) to define circuits in a human-readable way, suitable for education and code editors.
 
- **Rich Component Library:**  Provide built-in classes for logic gates, I/O devices, wires, arithmetic units, memory elements, etc., closely mirroring the Digital tool’s components. This allows constructing anything from simple gates to complete processors[github.com](https://github.com/hneemann/Digital#:~:text=,to%20create%20a) .
 
- **Connectivity and Wiring:**  Allow straightforward connection of outputs to inputs using Python object references (no need for explicit net declarations in simple cases). Multi-bit buses are supported, with bitwise operations performed on bus signals[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Binary%20AND%20gate,This) .
 
- **Simulation and AST:**  Circuits written in GGL can be executed as a Python script to simulate behavior or *evaluated* into an in-memory data structure (AST or netlist graph). This facilitates programmatic analysis and integration with a GUI (the GUI can generate or consume GGL code).
 
- **Reusable Subcircuits:**  Support encapsulating groups of components into reusable subcircuits (like functions or classes) so users can build libraries of common designs (adders, ALUs, decoders, etc.) and instantiate them as components in larger circuits. Parameterization (e.g. variable bit widths) is supported for generic circuit blocks[github.com](https://github.com/hneemann/Digital#:~:text=,be%20clocked%20at%20120%20kHz) .
 
- **Future Extensibility:**  While performance is not a primary concern, the specification leaves room for future extensions, such as automated conversion of GGL circuits to Verilog HDL for FPGA synthesis or export[github.com](https://github.com/hneemann/Digital#:~:text=Verilog%20iverilog,but%20sufficient%20for%20beginners) .

**Note:**  GGL focuses purely on circuit description and simulation logic. It does *not* cover GUI aspects or interactive UI controls (those will be handled by the future schematic editor). In GGL, components like buttons or clocks are represented, but user interaction (e.g. clicking a button) would be modeled by function calls or input toggles in the simulation script rather than GUI events.

## Basic Concepts and Syntax Overview 


In GGL, a digital circuit is described by instantiating component objects and connecting their ports. The DSL is essentially a Python API: writing a GGL file is like writing a Python script with a special library of logic components. The following concepts define the foundation of GGL’s syntax:

 
- **Components and Ports:**  Each logic element (gate, flip-flop, etc.) is represented by a Python class in GGL. Creating an instance (e.g. `g1 = AndGate()`) represents placing that component in the circuit. Components have input and output *ports* (attributes) through which they connect to other components. For example, an `AndGate` might have two input ports (say `in1`, `in2`) and one output port (`out`). In GGL code, you connect components by passing references of one component’s output to another’s input, or by using special wire objects.
 
- **Signals and Connections:**  A signal (wire) in the circuit is represented by connecting the **same Python object**  (or a designated *Wire* object) to multiple component ports. If one component’s output is assigned to another’s input, they share a signal. You can make connections in two primary ways:
 
  2. **By constructor arguments:**  Many component constructors accept other components’ outputs as arguments for inputs. For example, `sum = XorGate(A, B)` could create an XOR gate with inputs fed by the outputs of components `A` and `B` (if `A` and `B` are input sources). The constructor returns a reference to the new gate’s output signal (or the gate object itself with accessible ports).
 
  4. **By explicit wiring:**  Alternatively, instantiate components first, then connect via attributes or methods. For instance:


```python
xor1 = XorGate()          # create an XOR gate
xor1.in1 = A.out          # connect input A (source) to xor1’s first input
xor1.in2 = B.out          # connect input B to xor1’s second input
sum.out = xor1.out        # connect xor1’s output to the sum output pin
```

(This example assumes `A` and `B` are Input components with an `.out` port, and `sum` is an Output pin.)
 
- **Hierarchical Circuits (Subcircuits):**  Users can define a *subcircuit* (a reusable module) using Python functions or classes. A subcircuit encapsulates a set of components and exposes a defined interface (its own inputs/outputs) so it can be instantiated like a component. For example, one might define a `FullAdder` subcircuit that internally wires two half-adders and an OR gate, then use `FullAdder()` as a building block in a larger adder. GGL supports this via either a class-based approach (subclassing a `Circuit` base class) or a decorator-based function (see **Subcircuits and Reusability**  below).
 
- **Parameterization:**  Many components take parameters (passed to the constructor as keyword args) to configure their behavior or size. For instance, most components that handle multi-bit signals have a `bit_width` (or `data_bits`) parameter to specify bus width. If not specified, a default (often 1 for single-bit) is used. Components also have optional attributes like `name` (label) for identification and possibly others specific to the component (e.g. a memory’s size or an initial value).
 
- **Execution model:**  A GGL description can be executed directly in Python. Instantiating the components and linking them builds an internal netlist graph. The simulation engine can then propagate logic values through this graph. Alternatively, the GGL code can be parsed (via Python’s AST or `eval`) to produce a data structure representation of the circuit, which the GUI or other tools can manipulate. Because GGL is Python, users can leverage variables, loops, and conditionals when generating circuits (e.g. looping to instantiate an array of similar components), offering powerful macro-like capabilities within the language.


Below is a simple example illustrating the GGL syntax for a tiny circuit (a half-adder, which outputs sum and carry for two input bits):



```python
# Define inputs
A = Input(name="A")       # a 1-bit input labeled "A"
B = Input(name="B")       # another input "B"
# Define logic gates and connect them
sum_bit = Xor(A, B)       # XOR gate taking A and B (bitwise). sum_bit is the output signal (XOR result).
carry_bit = And(A, B)     # AND gate taking A and B. carry_bit is the output signal (AND result).
# Define outputs to expose the results
S = Output(sum_bit, name="S")     # Output pin driven by sum_bit (labeled "S")
C = Output(carry_bit, name="C")   # Output pin for carry_out (labeled "C")
```

In the above code, calling `Xor(A, B)` constructs an XOR gate with `A.out` and `B.out` connected to its inputs, and returns the XOR’s output signal (so `sum_bit` is effectively the XOR’s output). Similarly, `And(A, B)` returns the AND output. The `Output(...)` component ties those internal signals to external output pins of the circuit. This half-adder example demonstrates the concise, connection-by-constructor style. Equivalently, one could instantiate `xor_gate = XorGate(); xor_gate.in1 = A.out; xor_gate.in2 = B.out; sum_bit = xor_gate.out` for a more explicit wiring approach. Both achieve the same net connections in the final circuit AST.

With the basics covered, we now detail each category of components available in GGL, explaining how to instantiate them, their parameters, ports, and usage. Components are grouped into categories analogous to the Digital tool’s library for clarity.


## Logic Gates 

GGL provides the standard set of logic gates: **AND** , **NAND** , **OR** , **NOR** , **XOR** , **XNOR** , and **NOT** . These are basic combinational elements with one output determined by the boolean function of the inputs. All gate classes support both single-bit and multi-bit inputs (buses); if multi-bit signals are connected, the operation is performed bitwise on each bit of the bus[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Binary%20AND%20gate,This) . Unless otherwise specified, gates propagate changes instantly (in simulation, we assume an ideal zero or uniform delay for simplicity).
 
- **Instantiation:**  Each gate is a class named with a capitalized logic name (e.g. `And`, `Or`, `Not`, etc.). You can instantiate a gate by calling the class, optionally passing input signals and parameters. For example:
 
  - `g = And(A, B)` – creates a 2-input AND gate with inputs connected to signals `A` and `B` (which could be either `Input` components or any binary signal). This returns the output signal of the AND gate.
 
  - `g2 = NOr(bit_width=4)` – creates a 4-bit NOR gate with no inputs wired yet (you would then connect to `g2.in1`, `g2.in2`, etc. manually). The `bit_width=4` parameter indicates each input and the output are 4-bit buses, and the NOR will be applied bitwise.
 
- **Inputs:**  By default, binary gates (AND, OR, etc.) have **two**  input ports. You can extend to more inputs in two ways: (1) by providing more than two signals in a list or varargs (e.g. `And(A, B, C)` for a 3-input AND), or (2) by setting a parameter `num_inputs` when instantiating (if you want to create an unconnected gate with a specific number of input pins). All inputs must have the same bit-width (1-bit by default). The **NOT**  gate is unary (single input). **NAND** , **NOR** , **XNOR**  are simply the inverted-output versions of AND, OR, XOR respectively.
 
- **Outputs:**  Each of these gates produces a single output signal. For multi-bit inputs, the output is the same bit-width, with each bit computed by applying the gate operation to the corresponding input bits[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Binary%20AND%20gate,This) . For instance, if `X` and `Y` are 8-bit buses, `And(X, Y)` yields an 8-bit bus where each bit is the AND of the corresponding bits of X and Y.
 
- **Parameters:**  Aside from `bit_width` (common to all, default 1), gates don’t require additional parameters. Optionally a `name` (string) can be given for documentation (e.g. `And(name="G1")`), which might be used as a label in a schematic. Multi-bit gates interpret their inputs as unsigned binary vectors for bitwise ops; sign is not applicable for pure logic gates (signed interpretation matters only in arithmetic components like adders or comparators).
 
- **Example:** 


```python
# 3-input NAND example (2-bit bus):
A = Input(bit_width=2); B = Input(bit_width=2); C = Input(bit_width=2)
nand_out = NAnd(A, B, C, name="NAND3_2bit")  # 3-input NAND, each input 2 bits
led = LED(nand_out)  # drive an LED with the result (will light if any bit of output is 1)
```

In this example, `NAnd` gate computes the bitwise NAND of A, B, C (each 2 bits). The LED will light up if the NAND output is `1` on its single bit input (for a bus, the LED could be attached to one bit or a combined indication).

**Behavior:**  The logic gates implement standard truth tables. E.g., an `And` outputs 1 only if *all* inputs are 1[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Binary%20AND%20gate,This) ; `Or` outputs 1 if *any* input is 1, etc. For `Xor`, exactly one of its inputs being 1 (for two inputs) yields 1 (for more inputs, it’s the parity of 1’s). **NOT**  outputs the boolean negation of its input. Multi-input XOR and XNOR are computed as repeated pairwise XOR (odd parity yields 1 for XOR).

## I/O Components (Inputs, Outputs, LEDs, Clocks, etc.) 

The I/O elements in GGL represent external interfaces or interactive controls in a circuit. These include digital input sources (constants or toggles), output indicators, clocks, and probes. They do not perform logic functions but serve as **endpoints or sources**  of signals:
 
- **Input:**  Represents an external binary input pin (e.g. a user-provided signal or a test vector source). In simulation, an `Input` can be driven via the testbench or script. Syntax: `inp = Input(bit_width=1, name="X", default=0)`. You may specify `bit_width` > 1 to create a multi-bit input (for example, a 8-bit input bus). The `default` parameter sets the initial logic level (0 or 1 for single-bit, or an integer for multi-bit) at simulation start. By default, an Input starts low (0). The `name` is a label for reference. An `Input` component provides an `.out` port which is the signal fed into the circuit. (It effectively behaves like a constant source that can be changed during simulation.)
 
- **Output:**  Represents an external output pin of the circuit. It doesn’t drive any logic itself but is used to mark a signal as an output to the outside world. Syntax: `outp = Output(signal, name="Y")`. When instantiating, you typically pass the internal signal that should appear at this output. The `Output` component can be thought of as a label or connection to a pin; it has an input port (to receive the internal signal) and no output ports (since it *is* an output). For example, `Output(sum_bit, name="SUM")` ties the `sum_bit` signal to an output pin labeled "SUM". If you instantiate an `Output` without providing the driving signal, you can later connect to its `.in` attribute.
 
- **LED:**  A Light-Emitting Diode indicator – it behaves like an Output but specifically visualizes a single-bit signal’s value (often in the GUI, green for 1, dark for 0)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=2,input%20is%20set%20to%201) . In simulation, it acts just like a sink; whether it’s on or off can be read via its input state. Syntax: `led = LED(signal, name="status")`. LED accepts only 1-bit input (no buses)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=2,input%20is%20set%20to%201) . If the input is logic 1, the LED is considered lit; if 0, it’s off. (For multi-bit visualization, one would use multiple LEDs or a 7-seg display component if available, but that’s outside the core list).
 
- **Clock:**  A clock generator that produces a periodic square wave (alternating 0/1) output. Syntax: `clk = Clock(period=5, duty_cycle=0.5, name="CLK")`. The `Clock` has no input; it provides an `.out` signal that toggles automatically during simulation. Parameters:
 
  - `period`: The number of simulation time steps for a full cycle (or in an actual real-time context, perhaps in ms or desired frequency). For example, `period=10` might produce a 50% duty cycle wave with 5 steps high and 5 steps low if not otherwise specified.
 
  - `duty_cycle`: High-time fraction (0.5 by default for a 50% duty clock).
 
  - (If running within a script loop, the toggling can be handled by the simulator’s global clock tick; in a pure eval context, the `Clock` might just be a special source that one can step manually.)

The clock is useful for driving sequential circuits. E.g., a D flip-flop might use `clk.out` as its clock input.
 
- **Button:**  A momentary push-button input. In the GUI, a button can be pressed by the user, but in GGL simulation it can be toggled via code (e.g., calling `button.press()` or setting its state). A `Button` has an `.out` like an `Input`. It typically outputs `1` when "pressed" and `0` when not. Syntax: `btn = Button(name="ResetBtn", default=0)`. The `default` state might be 0 (unpressed). This component is functionally similar to an `Input` (a controllable source), except it’s meant to represent a momentary contact (which might be treated differently in UI or have a default auto-release behavior). For simulation simplicity, it can be considered just a manual input that one can set high or low.
 
- **DIP Switch:**  A DIP switch is a simple toggle switch (often in a multi-switch package). In Digital and GGL, a DIP switch outputs either high or low based on its toggle position[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Simple%20DIP%20switch%20that%20can,output%20value%20of%20the%20switch) . It’s effectively another form of input source. Syntax: `sw = DipSwitch(default=1, name="ModeSel")`. If multi-bit DIP packs are supported, one might have `bit_width` for the number of switches, but the **simple DIP switch**  component is treated as a single-bit on/off source[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Simple%20DIP%20switch%20that%20can,output%20value%20of%20the%20switch) . The `default` parameter sets its initial output (1 for on, 0 for off). In a script, you may toggle it by setting `sw.out.value = 1` or a similar interface provided.
 
- **Probe:**  A logic probe is used to monitor signals without affecting them (in the GUI it might show a waveform or numeric value). In GGL, a `Probe(signal, name="P1")` attaches to a signal and allows observing it during simulation. The `Probe` could record the signal’s history or print its current value when queried. It has essentially one input (the signal to watch) and no output (does not drive anything). This is primarily for testing and debugging – for example, you might place a `Probe` on an internal bus to verify its value changes in a test.

All these I/O components do not modify the signal; they either provide it or consume it. In a netlist sense, an `Input` or `Clock` has only an output port (source node), an `Output` or `LED` has only an input port (sink node), and a `Button`/`Switch` has an output (source) that can change based on external action.

## Wires, Constants, and Buses 


In a schematic, wires connect components. GGL mostly handles wiring by passing around references to outputs (as shown earlier), but it also provides explicit wire and constant components for clarity and advanced use cases, especially for representing power rails or splitting/joining buses:

 
- **Wire (explicit):**  Although you can often connect outputs to inputs directly in code, you may sometimes want to introduce a named wire (net) explicitly – for example, to connect a single source to many destinations without repeatedly referencing the source expression, or to clarify the net’s intended name. GGL can have a class `Wire(bit_width=n, name="NetName")`. A `Wire` by itself is just a passive conduit; you would attach one signal to it (its input) and then use its output end to route to others. In effect, it behaves like a piece of wire connecting two or more points. For instance:


```python
w = Wire(bit_width=8, name="DATA_BUS")
w.connect(src.out)        # attach source output to the wire
consumer1.in = w.out      # connect wire to multiple consumers
consumer2.address = w.out # etc.
```

All points connected to `w` become a single electrical node. In simulation, `Wire` could be implemented as just an identity buffer or alias. (In the Digital tool, a “Driver” element exists for similar purposes[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Configures%20the%20spread%20of%20the,driver%20is%20controlled%20by%20the) , but in GGL we can treat a wire as a no-delay, no-behavior connector.)
 
- **Ground and VCC:**  These are constant power rails. **Ground**  provides a constant logic 0, and **VCC**  (power) provides a constant logic 1. They have no inputs, only an output (the constant). Use `gnd = Ground()` and `vdd = VCC()`. By default, these are 1-bit signals valued 0 or 1 respectively. If a multi-bit constant of all zeros or ones is needed, you can specify `bit_width`; e.g. `Ground(bit_width=8)` would act as an 8-bit bus of all zeros (likewise for VCC). These are useful to tie unused inputs low, pull-down resistors, or supply default high to an enable, etc., without needing a separate input. (They correspond to fixed logical 0/1 sources in the circuit.)
 
- **Constant (binary constant):**  The Constant component outputs a specific binary value (which could be multi-bit). This is more general than VCC/GND. Syntax: `const = Constant(value=0b1010, bit_width=4, name="K")`. This example creates a 4-bit constant with binary value 1010 (10 in decimal). If `bit_width` is larger than needed for the given value, it will pad (or sign-extend if we introduce a signed constant variant). Conversely, if the value doesn’t fit in the specified width, it may be truncated or raise an error. The Constant has no input, only an `out` port providing the set value. It’s typically used for providing fixed operands to arithmetic circuits or for setting initial conditions.
 
- **Tunnel (Named connection):**  A Tunnel is a conceptual wire that allows connecting distant points in a schematic by name rather than by drawing a line. In GGL code, you usually don’t need tunnels, since you can directly use a common Python variable to represent the net. However, for completeness and for round-tripping from the GUI, GGL can include a `Tunnel(label="NET_NAME")` component. All `Tunnel` instances with the same label represent the same net (the simulator or AST builder will unify them). A `Tunnel` in code would behave like a Wire: you would attach a source to one tunnel and anything connected to another tunnel with the same label will receive that signal. For example:


```python
t1 = Tunnel(label="SYNC")    # one end
t2 = Tunnel(label="SYNC")    # other end
t1.in = some_signal
flipflop.clock = t2.out      # the clock input gets the same 'some_signal'
```

Under the hood, the engine knows t1 and t2 share "SYNC" and thus ties them together. In practice, using explicit `Wire` objects or direct connections is simpler when writing code; tunnels are mainly to mirror the concept used in schematics for cleanliness.
 
- **Splitter (Bus splitter/merger):**  Splitters allow dividing a multi-bit bus into smaller buses or individual bits, and conversely merging multiple signals into a wider bus. In Digital, the *Bidirectional Splitter* serves this role[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=11,the%20connections%20of%20the%20switch) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Data%20Bits%20Number%20of%20data,Rotation) . In GGL, since Python naturally supports indexing and slicing, you have two ways to split/merge:
 
  2. **Using Python slicing on signals:**  If a signal object represents a bus, GGL can overload the indexing operator. For example, if `data` is a 16-bit bus (say from a Register), `data[3]` could represent the 4th bit of that bus as a 1-bit signal, and `data[7:0]` could represent the lower byte (bits 0 through 7) as an 8-bit sub-bus. You could then connect `data[7:0]` into an 8-bit adder’s input, for instance. This slicing is intuitive for Python users and avoids needing an explicit splitter component.
 
  4. **Using a Splitter component:**  Sometimes, especially when importing/exporting from the GUI, a dedicated splitter is useful to explicitly show how a bus is broken down. GGL provides `Splitter` which can be configured with how to split. Syntax: `spl = Splitter(bit_width=8, positions=[4,2,2])`. In this example, an 8-bit input bus will be split into three outputs of 4 bits, 2 bits, and 2 bits respectively (assuming `positions` list describes group sizes). Alternatively, one can specify explicit bit index ranges: e.g. `Splitter(bit_width=8, map="4-7,0-3")` to map output0 = bits4-7, output1 = bits0-3 (the Digital format[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=configured%20with%20,It) ). The Splitter has one `.in` (8-bit in this case) and multiple `.outs` (here two outs, out0 4-bit and out1 4-bit in that mapping). It can also work in reverse (merging): if you instead drive the `.out` ports and leave `.in` unconnected, it will merge those sub-buses into a single bus on `.in`. Essentially, Splitter is bidirectional[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=11,the%20connections%20of%20the%20switch)  – directionless wire grouping – and is configured by the bit mapping attribute.

**Note:**  In most cases, using native signal slicing is preferred in GGL scripts for brevity. However, the `Splitter` component ensures that any arbitrary bus wiring (including splitting one bus into discontiguous bits of another, etc.) can be represented. For instance, splitting out bit 7 of a byte to one path and bits 0-6 to another would be done by a Splitter or by two slices (`data[7]` and `data[6:0]` in Python, which the DSL supports as separate signals).

Using these wire and constant components, you can manage complex interconnections. For example, tying many inputs to ground is as easy as connecting them to a single `Ground().out` signal. Buses can be constructed and deconstructed flexibly, enabling, say, an 8-bit adder’s carry out bit to be split off separately from the sum bits, etc.

## Multiplexers and Encoders (Plexers) 

**Plexers**  are components that route or select signals: multiplexers choose one of many inputs, demultiplexers and decoders direct an input to one of many outputs, and encoders produce a binary code corresponding to an active input. GGL supports the following plexers:
 
- **Multiplexer (MUX):**  The multiplexer selects one of N data inputs to forward to its output, based on a select signal. A MUX has `2^k` data inputs and a k-bit select input (or, in some configurations, an arbitrary number of inputs with enough select bits to index them). In GGL, the `Multiplexer` can be instantiated in two ways:
 
  2. Specify the number of inputs via a parameter, and connect signals later.
 
  4. Directly provide a list of input signals.

**Syntax:**  `mux = Multiplexer(inputs=[sig0, sig1, sig2, sig3], select=sel_bus, bit_width=1)`. In this example, a 4-to-1 multiplexer is created with 4 one-bit inputs, and a 2-bit select bus `sel_bus`. It will output `sig0` when `sel_bus` is `00`, `sig1` for `01`, etc. Alternatively: `mux = Multiplexer(num_inputs=4, bit_width=8)` would create an 8-bit-wide 4-to-1 mux (so each input is 8 bits, output 8 bits, and select 2 bits) with no connections yet – you would then assign to `mux.in_0, mux.in_1, ... mux.in_3` and `mux.sel`. Under the hood, the number of select bits is log2 of number of inputs (rounded up).
**Ports:**  For an N-input mux, ports are typically named `in_0, in_1, ..., in_{N-1}` for data inputs, one port `sel` (which is ⌈log2 N⌉ bits), and one `out` port for the output[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=This%20input%20is%20used%20to,Attributes) . The **Data Bits**  attribute (bit_width) defines the width of each data input/output[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Data%20Bits%20Number%20of%20data,used%20for%20the%20selector%20input) . If the select value is out of range (e.g. greater than N-1), by default the output may default to 0 or hold the last value – but typically this won’t happen if select lines are properly sized to match N.
**Example:**  `mux8 = Multiplexer(bit_width=8, num_inputs=2); mux8.in_0 = busA; mux8.in_1 = busB; mux8.sel = choice_bit; Y = Output(mux8.out)` – This creates a 2:1 mux (since num_inputs=2, 1 select bit) that chooses between 8-bit buses `busA` and `busB`.
 
- **Demultiplexer (DEMUX):**  The inverse of a mux – it takes one input and routes it to one of N outputs, based on a select. GGL’s `Demultiplexer` has one data input, an output count or select-bit count, and one select input. **Syntax:**  `dm = Demultiplexer(select=sel_bus, bit_width=1, num_outputs=4)`. If `sel_bus` is `10` (2 in decimal) in a 4-output demux, the input value is sent to output index 2 (`out_2`), while other outputs are set to a default (often 0)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=The%200,Attributes) . In GGL we might default the non-selected outputs to 0. Ports: `in` (data in), `sel` (select bits), and outputs `out_0 ... out_{N-1}`. Data bits parameter works similarly (each output is that width). If no `num_outputs` given but select bits width is given, outputs = 2^(select bits). A `default` parameter could specify what value to drive on the inactive outputs (0 if not specified)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Number%20of%20bits%20used%20for,com%2Fhneemann%2FDigital%2045%20%2F%2086) .
**Example:**  Routing a single 8-bit bus to one of four registers:


```python
dm = Demultiplexer(bit_width=8, num_outputs=4)
dm.in = data_bus
dm.sel = addr[1:0]   # 2-bit select from some address bus
reg0.D = dm.out_0; reg1.D = dm.out_1; reg2.D = dm.out_2; reg3.D = dm.out_3
```

Here only one register’s `D` input will see `data_bus`, determined by `addr`.
 
- **Decoder:**  A decoder takes an n-bit binary input and activates exactly one of 2^n outputs (the one corresponding to the binary value), setting the rest to 0. In GGL, `Decoder(bit_width=n)` creates a 2^n output decoder (each output 1-bit). Ports: `sel` (n-bit input) and outputs `out_0 ... out_{2^n-1}`. Each output `out_k` goes high (1) if `sel == k` (in binary), all others are low[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=The%200,Attributes) . Optionally, some decoders have an enable input; we can include an optional `enable` input pin (if not connected, assume always enabled). If `enable` is 0, all outputs could be forced low (or tri-stated if we consider a 3-state decoder, but usually decoders drive 0/1).
**Example:**  `dec3 = Decoder(bit_width=3); dec3.sel = opcode   # 3->8 decoder for a 3-bit opcode` – Now `dec3.out_0 ... out_7` represent one-hot signals for each opcode value.
 
- **Bit Selector:**  This component selects a single bit out of a multi-bit bus. It’s essentially a very narrow multiplexer (or a configurable wire tap). In Digital, the *Bit Selector* has a fixed index to pick[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=5,the%20highest%20number%20is%20output) . In GGL, you can simply use slicing (`bus[i]`), but the component is available for completeness or dynamic selection. There are two modes:
 
  - **Static bit selector:**  You specify an index as a parameter. E.g., `sel = BitSelector(index=5, in_width=8)`. This will have one 8-bit `in` port and one 1-bit `out` port which always reflects bit 5 of the input.
 
  - **Dynamic bit selector:**  Provide an index input port. E.g., `sel = BitSelector(in_width=16, index_width=4)`, producing a 1-bit out. You would connect a 4-bit index signal to `sel.index` and a 16-bit bus to `sel.in`. Then `sel.out` = `sel.in[ index ]`. Under the hood this is like a multiplexer selecting one bit of the input.


If using static mode, it’s purely combinatorial wiring. In dynamic mode, it’s essentially a 1-bit wide multiplexer with 16 inputs (in the above example), which might be less efficient; but the DSL can handle it.
 
- **Priority Encoder:**  A priority encoder takes multiple boolean inputs and outputs a binary number representing the index of the highest-priority input that is high[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=5,com%2Fhneemann%2FDigital%2047%20%2F%2086) . For example, if inputs [in0...in7] correspond to priority from 0 (lowest) to 7 (highest), and inputs 3 and 5 are high simultaneously, the encoder outputs `101` (5) if we assume 0-based indexing with 7 as highest priority. GGL’s `PriorityEncoder` can be created by specifying number of inputs (or number of output bits):

**Syntax:**  `enc = PriorityEncoder(num_inputs=10)` – for 10 inputs, the output needs 4 bits (since 10<16) to encode 0-9. Ports:
 
  - Inputs: `in0 ... in9` (each 1-bit). (If many inputs, it may be more convenient to pass an array: `PriorityEncoder(inputs=[...])` similar to mux.)
 
  - Outputs: `num` (the binary number of the highest active input) and an optional `any` flag[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=5,com%2Fhneemann%2FDigital%2047%20%2F%2086) . The `any` output is 1 if any input is high (i.e., at least one input present) – essentially a binary OR of all inputs, useful to know if the `num` output is valid. If no input is high, `num` could default to 0 or last value; typically we would treat `num` as invalid in that case, hence the `any` (sometimes called `valid`) signal. In our example, `enc.num` would be 4-bit, encoding 0-9, and `enc.any` indicates an input was found.
 
  - Attributes: `num_outputs_bits` (or GGL can deduce from `num_inputs` as ceil(log2 N)). If `num_inputs` is not a power of two, the encoder still outputs a full binary width (e.g., 10 inputs -> 4-bit output, unused codes 10-15 won’t occur). The highest-numbered input has priority on tie[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=5,the%20highest%20number%20is%20output) .

**Example:**  Suppose we have 8 request lines and we want to encode which one is active:


```python
enc = PriorityEncoder(num_inputs=8)
for i in range(8):
    enc.inputs[i] = req[i]   # assuming req is a list of 8 Input sources or signals
grant = enc.num    # 3-bit output
gotRequest = enc.any
```

If multiple `req` are true, `grant` gives the index of the highest one.

All these plexer components are purely combinational. The **Multiplexer**  and **Bit Selector**  propagate the selected input’s value to the output (with a negligible propagation delay). The **Demultiplexer**  and **Decoder**  drive one-hot outputs based on select. The **Priority Encoder**  computes a binary value from a one-hot or arbitrary inputs (with priority for highest-index input)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=5,com%2Fhneemann%2FDigital%2047%20%2F%2086) . They facilitate conditional data routing which is essential in implementing things like control units, bus arbitrators, etc., in a high-level way.

## Flip-Flops (Sequential Logic) 

Sequential logic elements store state. GGL currently includes only the **D Flip-Flop**  (the most commonly used flip-flop) as a primitive in this category, which can be used to build registers, shift registers, etc. (Other flip-flop types like JK, T can be constructed or are omitted for simplicity.)
 
- **D Flip-Flop (DFF):**  A D-type flip-flop captures the value on its Data input `D` on a clock edge and holds it until the next capture. In GGL, `DFlipFlop(bit_width=1, edge='rising', initial=0)` instantiates a D flip-flop. By default it is a positive-edge triggered flip-flop[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=6.4.%20D,allows%20to%20store%20multiple%20bits) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=6.4.%20D,allows%20to%20store%20multiple%20bits) . Key ports and attributes:
 
  - Inputs: `D` (the data input, width can be >1 to store a multi-bit word)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=6.4.%20D,allows%20to%20store%20multiple%20bits) , `C` (the clock input). Optionally, some DFFs have an asynchronous clear or preset, but GGL’s base DFF does **not**  include those by default (to get reset functionality, see the Register component or use external logic to drive D accordingly).
 
  - Outputs: `Q` (the stored value output) and `~Q` (inverted output) if needed. By default, GGL’s `DFlipFlop` provides just `Q`. If an inverted output is desired, it could be enabled via a parameter (e.g. `inv_output=True`) or simply by adding a NOT gate externally. The Digital tool’s D flip-flop provides an inverted output[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=6.4.%20D,allows%20to%20store%20multiple%20bits) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=https%3A%2F%2Fgithub) , so GGL may include it as `dff.qn` or similar.
 
  - Behavior: On each rising clock edge (if `edge='rising'`), the value present on `D` is latched into the internal state. On a falling edge (if configured for falling), similarly. The output `Q` updates to this new stored value after the clock edge. The **bit width**  can be set to store multiple bits in one DFF (essentially it acts as a group of flip-flops in one component)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=6.4.%20D,allows%20to%20store%20multiple%20bits) . For example, `DFlipFlop(bit_width=4)` has a 4-bit `D` input and 4-bit `Q` output, storing an entire 4-bit word synchronously.
 
  - Initial value: `initial` (or `default`) parameter sets the power-up state of Q. If not specified, it defaults to 0. E.g., a DFF used as a simple register bit might start at 0 unless an initial 1 is required.

**Example usage:** 


```python
dff = DFlipFlop(bit_width=1, name="bit_storage")
dff.D = some_signal    # connect data input
dff.C = clk.out        # connect clock (assuming clk is a Clock component)
# dff.Q is the output; we can use it in the next stage
next_stage.D = dff.Q   # feed into another FF or logic
```

This will transfer `some_signal` into `dff.Q` on each clock rising edge. If `some_signal` changes at other times, `dff.Q` holds the last captured value until the next edge.

Because DFF is fundamental, it’s kept simple. If asynchronous reset or preset is needed, one can either use the `Register` component (which adds an enable and clear) or combine a DFF with logic: e.g., drive D with 0 when a reset signal is active, etc. Edge-triggered behavior is assumed; for level-sensitive latches, GGL could introduce a separate Latch component if needed (not in the base list).

Timing: In simulation, the flip-flop will update its outputs at the moment of the triggering clock edge (with possibly a tiny delta delay to order events). If multiple flip-flops share a clock, they effectively update simultaneously on that clock.


## Memory Components (RAM) 

Memory modules store larger amounts of state (many bits, typically addressed by an index). GGL includes **RAM (Random Access Memory)**  components, focusing on two configurations: single-port RAM with separate read/write lines, and dual-port RAM. These correspond to the Digital simulator’s RAM variants[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=7,Inputs) . All RAMs in GGL are synchronous by default (writes occur on a clock edge, and reads can be asynchronous or synchronous depending on type). There is no need for users to implement memory bits one-by-one; these components handle it internally.
 
- **Single-Port RAM (separate R/W ports):**  This RAM has one port for writing and one port for reading, but they share the address space. It is like having a memory where you can present an address and data to write on a write-enable signal, and (simultaneously or at other times) present an address to read out data. The term "separated ports" means the data-in and data-out are on separate pins (not a bidirectional bus)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=7,Inputs) . GGL syntax might call this simply `RAM` by default:


```python
mem = RAM(addr_width=10, data_width=8, dual_port=False, synchronous=True)
```


This creates a memory with $2^{10}=1024$ addressable locations, each 8 bits wide. Ports and parameters:

 
  - **Address lines:**  Perhaps two addresses: one for read, one for write (`read_addr`, `write_addr`), since ports are separate. Alternatively, some designs have a single address bus that is time-multiplexed; but separated ports implies independent.
 
  - **Data ports:**  `data_in` (for writes, 8-bit), `data_out` (for reads, 8-bit). The `data_out` will output the value stored at `read_addr`.
 
  - **Control:**  `write_enable` (WE) to enable writing `data_in` to `write_addr` on the active clock edge. There may also be a `clock` input `C` – likely required for synchronous operation. If `synchronous=True`, both read and write occur on clock edges (e.g., address and data must be stable before clock, data_out updates after clock). If asynchronous read is desired (`synchronous=False` for read), then `data_out` could combinatorially reflect `read_addr` at all times (like a combinational ROM), while write is still edge-triggered.
 
  - Optionally, a `chip_enable` or `enable` pin can globally enable/disable the memory (if low, output could be high-Z or hold last value).
 
  - **Initial contents:**  Memory can be initialized via a parameter, e.g., `contents` which can be a list of values of length $2^{addr_width}$ (or a file path to load). If not provided, default might be all zeros. For example, `RAM(..., contents=[...])`.
 
  - **Behavior:**  On a write cycle (when clock rises and `write_enable` is 1), the value on `data_in` is stored into the memory at the address on `write_addr`. On a read, `data_out` presents the value at `read_addr`. If using asynchronous read, `data_out` changes as soon as `read_addr` changes (combinatorial output), reflecting the currently stored value. If using synchronous read, then a clock is needed for reads too – possibly the same clock; in that case, `data_out` updates at the clock edge (after address is latched internally). Digital’s *Block RAM* was the synchronous read variant[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=7.2.%20Block,This%20allows%20the) , whereas the base *RAM* was asynchronous read. We can allow an attribute `async_read=True/False`. By default in GGL we might choose asynchronous read for simplicity (like a combinatorial memory output).
 
  - **Example usage:** 


```python
mem = RAM(addr_width=8, data_width=16, name="VideoRAM")
mem.clock = clk.out
mem.write_addr = cpu_addr
mem.data_in = cpu_data_bus
mem.write_enable = cpu_mem_wr
mem.read_addr = gpu_addr
gpu_data = mem.data_out   # GPU reads from same memory concurrently
```

Here, one port is used by the CPU to write (with `cpu_mem_wr` controlling writes), and the read port is used by a GPU to fetch data. Because separate addresses are provided, the CPU could write to one location while the GPU reads another in the same cycle. If they coincidentally access the same address and one is writing, the read might get the old or new value depending on timing (write-first vs read-first configuration; we could specify a mode, but by default assume read sees new data if write and read address match and write happens). Typically, this configuration is actually a simple dual-port (one write, one read) memory.
 
- **Dual-Port RAM:**  Truly *dual-port* memory generally means two ports that each can perform reads or writes simultaneously, often with separate clocks. The Digital component *RAM Dual Port* likely allowed two independent accesses[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=match%20at%20L2556%207.2.%20Block,This%20allows%20the) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=7,Inputs) . GGL’s `RAM(dual_port=True, ...)` or a separate class `DualPortRAM` can handle this. Ports:
 
  - Two sets of address, data, write-enable, and possibly two clocks if needed (often dual-port RAM can have one clock for both or separate).
 
  - For simplicity, we might assume a single clock domain and allow either port to read or write. Alternatively, restrict one port to read-only and the other to write-only to avoid conflicts (that’s actually the separated port case above). But “dual-port” here implies possibly both can write.
 
  - If both ports write to the same address in one cycle, that’s a conflict – GGL doesn’t define arbitration, so it’s user responsibility to avoid or the result is undefined (or last one wins).
 
  - If one writes and one reads same address at same time, one could define read-first or write-first behavior (could be an attribute; often write-first so the read gets updated data).
 
  - **Instantiation:**  `mem2 = DualPortRAM(addr_width=10, data_width=8)`. This might be equivalent to `RAM(addr_width=10, data_width=8, dual_port=True)`. Ports are like `addrA, data_inA, data_outA, weA` and `addrB, data_inB, data_outB, weB`, plus a common or separate clock(s).
 
  - If separate clocks needed (to model truly independent domains), one could have `clockA` and `clockB`. If kept to one clock, then operations happen together.


The use-case is for systems where two masters need fast access to the same memory (e.g., dual-port VRAM for CPU/GPU). In GGL simulation, this works as long as you carefully manage accesses.
 
- **Bidirectional vs Separate Data Bus:**  The memory components above use separate data in and data out. Some RAMs use a single bidirectional bus for both read and write (like typical SRAM in circuits, using tri-states). The Digital “RAM, bidirectional Port” is such a variant. GGL can support it but it complicates the simulation (requires tri-state logic to turn around the bus). Since the spec explicitly says "with separated and dual ports", we focus on separate port (no bus contention issues). If needed, a bidirectional port RAM could be a different class or an attribute `bidirectional=True` meaning the `data` port is both input and output, and an output enable signal controls it. But by default, GGL’s RAM uses distinct `data_in` and `data_out` lines (so implementing a classic von Neumann memory interface where reading and writing can even happen in the same cycle on different addresses, as above).
 
- **Memory Attributes:** 
 
  - `addr_width` (number of address bits) – determines the number of locations = $2^{addr_width}$.
 
  - `data_width` (size of each word in bits).
 
  - Possibly `depth` could be given instead of `addr_width` (if one prefers to specify depth directly). One of `depth` or `addr_width` suffices.
 
  - `contents` or `init_file` to initialize memory. Could accept a Python list of int or a string (filename to load a HEX/binary file). For example: `RAM(addr_width=4, data_width=8, contents=[5,7,3, ...])`.
 
  - If needed: `read_only` flag (for ROM, though we have a separate ROM component).
 
  - `name` for identification.


Memory components, being higher-level, are implemented behind the scenes (one could imagine them as an array of flip-flops or using Python lists to simulate storage). From a user perspective, they behave as described.

One should also note the **timing** : If using asynchronous read, reading from memory is like combinatorial logic – a change in `read_addr` or an updated stored value immediately reflects on `data_out`. If using synchronous, you need a clock tick to see new data after setting address. Write operations are typically synchronous (require clock).

## Memory Elements (Registers, ROMs, Counters) 

This category includes other storage elements beyond raw RAM: **registers**  (flip-flop based data registers), **ROM**  (read-only memory), and **counters**  (sequential incrementers). These often incorporate additional logic for enable or preset.
 
- **Register:**  A Register is similar to a multi-bit D flip-flop with a clock enable (and often a reset). It provides a convenient packaged component for storing a word. In Digital, the Register has an enable input unlike a bare DFF[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=9,en) . Syntax in GGL: `reg = Register(width=16, enable=True, reset=True, name="IR")`. This would create a 16-bit register (instruction register, say) with clock enable and reset.
**Ports:** 
 
  - `D` (width N input data).
 
  - `Q` (width N output).
 
  - `C` (clock).
 
  - `EN` (enable input). When EN is 1 at a clock edge, the register loads D; if EN is 0 at the clock edge, the register holds its previous value[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=9,en) .
 
  - `CLR` or `RST` (reset input, optional). If present and high at the clock edge (assuming synchronous reset) or asynchronously (if asynchronous reset), it resets Q to 0 (or a given default) regardless of D/EN. We can assume synchronous clear for simplicity, or specify `async_reset=True` if needed.


In usage, the Register simplifies writing sequential circuits since you don’t have to manually gate a DFF with an enable. For example:



```python
pc = Register(width=12, name="PC")  # program counter register, 12-bit
pc.clock = clk.out
pc.EN = update_flag               # only load when update_flag is 1
pc.D = next_pc_value
# PC.Q now outputs the latched program counter value
```

If `update_flag` is 0 on a clock edge, PC retains its old value[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=9,en) . If it’s 1, PC loads `next_pc_value`. If `reset` pin was available and triggered, PC.Q would go to 0 (or some preset value).

The Register’s internals are essentially a bunch of DFFs plus an AND gate on the clock or D path for the enable, plus possibly a mux for loading either D or 0 for reset. We expose it simply as one component.
 
- **ROM (Read-Only Memory):**  A ROM is like a RAM but programmed with fixed content and usually without a write capability during simulation (except maybe via an initial load or a separate programming interface). In GGL, `ROM(addr_width=A, data_width=D, contents=[...])` creates a memory whose contents are fixed. Ports:
 
  - `A` (Address input, A bits).
 
  - `D` (Data output, D bits).
 
  - Optionally an `enable` or `sel` input[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=9,value%20at%20the%20D%20pin) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=en%20Enable%20pin,com%2Fhneemann%2FDigital%2063%20%2F%2086) . In Digital’s ROM, a `sel` input is provided to tri-state the output when not selected[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=en%20Enable%20pin,com%2Fhneemann%2FDigital%2063%20%2F%2086) . If `sel` (chip select) is high, the output is driven with the stored word; if `sel` is low, the output goes to high-impedance (so that multiple ROMs could share a bus, only one active at a time). In GGL, we can include a `chip_enable` pin (active high). If not connected, assume always enabled.
 
  - The output might be tri-stated on disable; to simulate tri-state in GGL, we may model the output as `None` or a separate high-Z state. But often it’s enough to say if disabled, output is effectively not driving (and if multiple devices on bus, one must be enabled at a time).

**Contents:**  specify as list or file. For instance:


```python
font_rom = ROM(addr_width=10, data_width=8, name="FontROM",
               contents=font_bytes)
font_rom.A = char_code
pixel_byte = font_rom.D
```

This ROM might hold 8x8 font glyphs indexed by character code. It’s entirely combinational on read: `D` outputs `contents[A]` (the value at address A). Usually, ROMs are asynchronous read devices (like a combinational truth table). If extremely large, one might consider a clock for timing, but typically no clock is needed for ROM in simulation.
 
- **Counter (without preset):**  A Counter automatically increments or decrements a value on each clock pulse. GGL’s `Counter(width=n, up=True)` creates an n-bit up-counter. Ports:
 
  - `C` (clock input).
 
  - `EN` (enable count)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Inputs%20en%20If%20set%20to,Outputs%20out)  – if high, the counter increments on each clock edge; if low, it pauses (holds value)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=en%20If%20set%20to%201,counter%20if%20set%20to%201) .
 
  - `CLR` (clear) – if high, resets the counter to 0 (synchronously on clock edge or asynchronously depending on design, but Digital implies synchronous clear[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=9,set%20in%20the%20attribute%20dialog) ).
 
  - Output: `Q` (n-bit count output).
 
  - Output: `OVF` (overflow) – goes high for one cycle when the counter wraps around (i.e., when it transitions from max value back to 0)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Returns%20the%20counted%20value,maximal%20value%20and%20the%20en) . In Digital’s description, `ovf` is 1 if the counter is at max and a further increment is attempted while enabled[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Returns%20the%20counted%20value,maximal%20value%20and%20the%20en) . We simulate this as an output that pulses or stays high at the wrap point.

The counter starts at 0 (unless a different start value is needed; one could extend parameter `initial_value`).
**Example:** 


```python
cnt = Counter(width=4, name="LoopCounter")
cnt.C = clk.out
cnt.EN = run_loop
cnt.CLR = reset
loop_index = cnt.Q   # use this in other logic
if cnt.OVF:
    # maybe trigger something when overflow (loop complete)
    ...
```

This 4-bit counter will count 0,1,2,...,15,0,1,... as long as `run_loop` is true each clock. If `reset` goes high, it resets to 0 next clock.
 
- **Counter with Preset (Up/Down Counter):**  An advanced counter that can be loaded with an arbitrary value and count either up or down. In GGL: `CounterPreset(width=n, max_value=None)` or a single `Counter` class with extra parameters `has_load=True, up_down=True`. Digital’s version has direction and load[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=) . Ports in this case:
 
  - `C` (clock), `EN` (enable) – same as basic counter.
 
  - `DIR` (direction) – if this input is 0, count upwards, if 1, count downwards (or vice versa)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=) . If not provided, assume up by default.
 
  - `LD` (load enable) – if this input is 1 at a clock edge, the counter will load the value present on the `IN` bus into the counter instead of counting[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=) . This is a synchronous parallel load.
 
  - `IN` (input bus) – the value to load when `LD` is high.
 
  - `CLR` (clear) – same as before.
 
  - Outputs: `Q` (count output), `OVF` (overflow/underflow flag). For an up/down counter, the meaning of OVF can be: if counting up, it goes high when transitioning from max to 0; if counting down, when transitioning from 0 to max (underflow). Digital’s description: *“OVF is set to 1 if the counter reaches its maximum value when counting up, or reaches 0 when counting down, while enabled”*[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Returns%20the%20counted%20value,maximal%20value%20and%20the%20en) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=) .
 
  - Attribute: `max_value` – if provided (non-zero), this defines an upper limit other than the default (which is all 1s for n-bit). If set, the counter will wrap at that value instead of $2^n - 1$. For instance, a decade counter might set `max_value=9` for a 4-bit counter, so it counts 0-9 then wraps to 0. If `max_value=0`, as per Digital, it means use the full range (all bits one)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Returns%20the%20counted%20value,maximal%20value%20and%20the%20en) .

**Example:** 


```python
counter = Counter(width=8, has_load=True, up_down=True, name="AddrCounter")
counter.C = clk.out
counter.DIR = direction  # 0 = increment, 1 = decrement
counter.LD = load_enable
counter.IN = load_value  # 8-bit bus to load from
counter.CLR = reset
address = counter.Q
```


This can act as a program counter that can jump (load a value) or increment/decrement through addresses.

If `direction` is 0, it counts up: 0,1,2,... until max (or max_value) then wraps (with OVF pulse)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Returns%20the%20counted%20value,maximal%20value%20and%20the%20en) . If `direction` is 1, it counts down: maybe starting from max if not loaded, then down to 0 (with OVF possibly signaling underflow).


These memory elements simplify state machine design and sequential logic:

 
- A Register is effectively a DFF with enable (and often used to hold data or state bits).
 
- A ROM provides fixed combinational data (useful for look-up tables, instruction memory in CPUs, etc.).
 
- Counters free the user from manually adding and incrementing logic for simple count-up sequences, and often come with useful signals like overflow.

All sequential components (`Register`, `Counter`) require a clock. The user must connect a `Clock` component’s `.out` or some clock signal to them. GGL might enforce a single global clock or allow multiple clocks; it’s flexible, but typically one drives them all unless a design calls for multiple clock domains.

## Arithmetic Components 


GGL includes a range of arithmetic logic components for operating on multi-bit binary numbers. These are higher-level combinational blocks built from gates but provided as primitives for convenience:

 
- **Adder:**  Adds two binary numbers (plus an optional carry-in) and outputs their sum (and an optional carry-out). This can represent a full adder or multi-bit ripple-carry adder. **Syntax:**  `add = Adder(width=n)`, where `n` is the number of bits for inputs A and B. Ports:
 
  - Inputs: `a` (n-bit), `b` (n-bit), and `c_in` (1-bit carry-in, optional). If `c_in` is not connected, it is assumed 0.
 
  - Outputs: `s` (n-bit sum output), `c_out` (1-bit carry-out)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Second%20input%20to%20add,set%20there%20was%20an%20overflow) .
 
  - The addition performed is: `s = a + b + (c_in ? 1 : 0)`[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,the%20carry%20input%20is%20set) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,c_i) . If the result exceeds n bits, the `c_out` indicates the overflow (the carry out of the MSB)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=s%20The%20result%20of%20the,set%20there%20was%20an%20overflow) . For example, a 4-bit adder adding 15 (1111) and 1 (0001) would output 0 (0000) with c_out = 1.
 
  - If only two numbers with no carry are needed, the carry-in can be left at default 0. If a multi-bit addition chain is needed (like constructing a 16-bit adder from four 4-bit adders), you’d connect c_out of one to c_in of the next.
 
  - The Adder treats inputs as unsigned by default. If interpreting as two’s complement signed, the sum logic is the same bitwise; the user would just interpret the output accordingly. The overflow flag for signed might need separate logic (like checking c_out ^ second to last carry), which this simple adder doesn’t directly provide. We assume c_out as an unsigned overflow indicator. (A more advanced component could provide a signed overflow flag if needed.)
 
  - **Example:**  `adder8 = Adder(width=8); adder8.a = op1; adder8.b = op2; result = adder8.s; carry = adder8.c_out`.
 
- **Subtracter:**  Subtracts two binary numbers. In two’s complement, subtraction can be done by inverting the second number and using an adder with carry-in = 1. GGL provides a direct Subtract component for convenience. **Syntax:**  `sub = Subtract(width=n)`. Ports:
 
  - Inputs: `a` (minuend, n-bit), `b` (subtrahend, n-bit), `c_in` (borrow in, optional). If `c_in` is 1, it effectively subtracts an extra 1 (i.e., implements $a - b - 1$)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=s%20co%20Sub%2010,com%2Fhneemann%2FDigital%2067%20%2F%2086) .
 
  - Outputs: `s` (n-bit difference), `c_out` (borrow out / underflow flag)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=b%20ci%20s%20co%20Sub,b) .
 
  - Operation: `s = a - b - (c_in ? 1 : 0)`. If `a < b` (in unsigned sense) a borrow will result, indicated by c_out=1 (meaning an overflow occurred in subtraction)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=b%20ci%20s%20co%20Sub,b) . In two’s complement terms, c_out=1 could indicate an arithmetic underflow if treating these as signed, but careful: for signed overflow detection in subtraction, different logic is needed; here we just give the raw carry/borrow.
 
  - Typically, if you want to subtract with borrow in and out (e.g., multi-stage subtractors), you chain c_out to next stage’s c_in.
 
  - If no borrow in needed, leave it 0. Example: `diff = Subtract(width=16); diff.a = X; diff.b = Y; out = diff.s`.
 
  - This internally might invert b and feed to an adder. Indeed, Digital’s doc suggests the subtract component uses the carry in to decrement result by 1[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=s%20co%20Sub%2010,com%2Fhneemann%2FDigital%2067%20%2F%2086)  (which aligns with two’s complement: to compute a - b, you do a + (~b) + 1).
 
- **Multiplier:**  Multiplies two binary numbers. **Syntax:**  `mul = Multiply(width=n, signed=False)`. This multiplies two n-bit numbers, producing a result up to 2n bits. Ports:
 
  - Inputs: `a` (n-bit), `b` (n-bit).
 
  - Output: `out` or `product` (2n-bit). For example, an 8x8 multiply yields a 16-bit product.
 
  - Attribute: `signed` (boolean). If `True`, interpret inputs as signed 2’s complement and produce a signed result (which still is 2n bits). The underlying multiplication algorithm or result will handle sign-extension appropriately[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Sub%2010,com%2Fhneemann%2FDigital%2067%20%2F%2086) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,com%2Fhneemann%2FDigital%2069%20%2F%2086) . If `False` (default), treat as unsigned. Setting `signed=True` might ensure the MSB is sign-extended in the result and uses signed multiplication logic.
 
  - This is a purely combinational multiplier (e.g., array or Wallace tree multiplier internally). The result is combinatorially available given inputs (which could be expensive for large n, but again performance is not a focus).
 
  - Example: `mul16 = Multiply(width=16, signed=True); mul16.a = X; mul16.b = Y; product = mul16.out`. If X = -1 and Y = 2 (16-bit signed), product will be -2 (32-bit signed, which in hex would appear as FFFF…FE).
 
  - Typically, multiplication in hardware is expensive; but for completeness it’s included.
 
- **Division:**  Divides two numbers, producing a quotient (and possibly remainder). **Syntax:**  `div = Divide(width=n, signed=False)`. Ports:
 
  - Inputs: `numerator` (n-bit), `denominator` (n-bit).
 
  - Outputs: `quotient` (n-bit), `remainder` (n-bit) – or some may choose quotient  and remainder of width n. Alternatively, `Divide` might by default output both. If only quotient is needed, the remainder port can be ignored.
 
  - If `signed=True`, performs a signed division (2’s complement). If `False`, unsigned division.
 
  - Behavior: `quotient = floor(numerator/denominator)`, `remainder = numerator mod denominator`. If denominator is 0, behavior is undefined or could set quotient to all 1s and remainder = numerator (to indicate error). We might leave division by zero as a user error not to do in simulation.
 
  - This component likely uses an internal algorithm (e.g., restoring division) to produce the output combinatorially – which is complex but doable for small n. Because the question includes divide, we specify it, but note that in an actual hardware scenario one would often implement division using sequential algorithms. However, as a component, we treat it combinational for simplicity.
 
  - Example: `div8 = Divide(width=8); div8.numerator = A; div8.denominator = B; Q = div8.quotient; R = div8.remainder`.
 
- **Barrel Shifter:**  Shifts a binary value left or right by a specified amount in one operation. **Syntax:**  `shf = BarrelShifter(width=n, direction="left", arithmetic=False)`. Ports:
 
  - Input: `in` (n-bit data to shift)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Inputs%20in%20Input%20with%20bits,com%2Fhneemann%2FDigital%2069%20%2F%2086) .
 
  - Input: `shift` (k-bit shift amount, where typically k = log2(n) to be able to shift up to n bits; but one could allow any shift up to n of course)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,given%20by%20the%20shift%20input) .
 
  - Output: `out` (n-bit shifted result)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,shift%20Input%20with%20shift%20width) .
 
  - Attributes:

 
    - `direction`: can be `"left"`, `"right"`, or `"both"`. If set to `"both"`, the `BarrelShifter` expects perhaps an extra input to choose direction (like a boolean `dir` input: 0 for left, 1 for right). Alternatively, if we allow negative shift values on the `shift` input, that could indicate opposite direction if `shift_input_has_sign=True`[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,shift%20Input%20with%20shift%20width) . Digital’s version has a *Direction* setting and an option to treat shift input as signed[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,shift%20Input%20with%20shift%20width) .
 
    - `arithmetic` or `mode`: if doing a right shift, *arithmetic* mode means it will preserve the sign bit (MSB) on right shifts (sign-extend) vs *logical* which will fill with 0s[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,shift%20Input%20with%20shift%20width) . Possibly also a *rotate* mode to rotate bits around. We can encapsulate these in a `mode` attribute:
 
      - `mode="logical"` (fill with zeros),
 
      - `mode="arithmetic"` (fill with input’s MSB for right shifts),
 
      - `mode="rotate"` (wrap around the falling-off bits to the other end).
 
    - `shift_input_has_sign`: If true, the `shift` value is treated as signed (two’s complement)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,shift%20Input%20with%20shift%20width) , so a negative shift value would trigger shifting in the opposite direction (this might be an alternative to providing a separate direction input). In Digital, they allow that as an attribute[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,shift%20Input%20with%20shift%20width) .
 
  - Behavior: The BarrelShifter can shift the entire bus in one operation. For example, a left shift of 3 on input `1011000` yields `1000xxx` (with xxx being zeros). A right logical shift of 2 on `1011000` yields `0010110`. A right arithmetic shift of 2 on `1011000` (if we interpret input as signed and it was negative since MSB=1) would yield `1110110` (assuming 7-bit input in these examples).
 
  - Example:



```python
sh = BarrelShifter(width=16, mode="logical", direction="both")
sh.in = value16
sh.shift = amt4    # 4-bit shift amount
sh.dir = dir_bit   # custom extended: let's say GGL allows a dir input if direction="both"
shifted = sh.out
```

If `dir_bit=0`, this does left shift by `amt4`. If `dir_bit=1`, right shift by `amt4` (logical, since mode logical). If we had `mode="arithmetic"`, right shifts would replicate MSB.
 
- **Comparator:**  Compares two values and outputs comparison flags. **Syntax:**  `cmp = Comparator(width=n, signed=False)`. Ports:
 
  - Inputs: `a` (n-bit), `b` (n-bit).
 
  - Outputs: Typically three 1-bit signals: `gt` (1 if a > b), `eq` (1 if a == b), `lt` (1 if a < b)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=in%20Input%20with%20bits%20to,com%2Fhneemann%2FDigital%2069%20%2F%2086) . This covers all comparisons. They are mutually exclusive (exactly one is high, or in some implementations if equal, only eq is high and others low; if a > b, gt high; if a < b, lt high).
 
  - Attribute: `signed` – if true, interpret as signed comparison (so 1000 is less than 0111 if 8-bit, etc.). If false, compare as unsigned. The logic differs in how it checks the MSB in the subtraction for example.
 
  - The comparator is essentially a subtractor internally or a cascade of logic that sets those outputs. For convenience we present separate outputs. In Digital, the comparator outputs '>', '=' and '<' signals[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=in%20Input%20with%20bits%20to,com%2Fhneemann%2FDigital%2069%20%2F%2086) . We mirror that.
 
  - Example: `cmp8 = Comparator(width=8, signed=True); cmp8.a = X; cmp8.b = Y; if cmp8.gt: ...`.
 
  - If the user only needs one type of comparison (say equality), they might just use an XNOR followed by a reduction AND gate in custom logic. But the comparator gives all at once, akin to how certain CPUs produce flags.
 
- **Negator (Two’s complement negation):**  The Negation component produces the two’s complement negation of a number (i.e., arithmetic negation). It essentially computes `out = -in`. In binary, that is `~in + 1`. **Syntax:**  `neg = Negation(width=n)`. Ports:
 
  - Input: `in` (n-bit)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Inputs%20in%20Input%20of%20the,Attributes%20Data%20Bits) .
 
  - Output: `out` (n-bit)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Outputs%20out%20Returns%20the%20result,Rotation) .
 
  - It’s equivalent to a bitwise NOT and an adder of 1. But as a component it’s simpler to drop in when needed (for example, building a subtractor or implementing a 2’s complement operation).
 
  - Example: `neg.out` could feed into an Adder’s second input to do A + (-B).
 
  - If `in` is 0, `out` will be 0 (with an overflow if we consider sign, since -0 = 0 anyway, that’s fine). If `in` = 1000 (for 4-bit, which is -8 in two’s complement), `out` will also be 1000 (since -(-8) = 8, but 8 is -8 in 4-bit two’s complement due to overflow). That highlights that negation of the most negative number in two’s complement yields itself with an overflow. Our component won’t explicitly flag that condition; it just produces the bit result. This matches two’s complement arithmetic.
 
  - Digital’s documentation explicitly calls it “Negation in 2’s complement”[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,Attributes) .
 
- **Sign Extender:**  Extends the bit-width of a signed number by replicating the sign bit (MSB). **Syntax:**  `sext = SignExtender(in_width=m, out_width=n)`, with n > m. Ports:
 
  - Input: `in` (m-bit)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,output%20bit%20width%21%20Outputs%20out) .
 
  - Output: `out` (n-bit)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=is%20a%20single%20bit%2C%20this,than%20the%20output%20bit%20width) .
 
  - Function: `out` consists of the input value in the lower m bits, and the top (n-m) bits of `out` are all copies of `in`’s MSB (sign bit)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,output%20on%20all%20output%20bits) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,output%20bit%20width%21%20Outputs%20out) . If the input is interpreted as a signed number, the output is the same value represented in a wider bit-width.
 
  - This is a simple but frequently needed operation when mixing bit-widths (e.g., going from a 8-bit immediate value to a 16-bit ALU input in a CPU).
 
  - Example: If `in=5` (0b0101, m=4) and we extend to 8 bits, `out = 00000101`. If `in = -3` (0b1101 in 4-bit two’s comp), sign extender to 8-bit gives `11111101` (which is -3 in 8-bit)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,output%20on%20all%20output%20bits) .
 
  - If someone tries to use SignExtender with out_width < in_width, that’s not extension – we might not allow that (or just note that out_width must be greater, as the Digital doc says[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Inputs%20in%20Input%20value,output%20bit%20width%21%20Attributes%20Label) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=The%20name%20of%20this%20element,com%2Fhneemann%2FDigital%2071%20%2F%2086) ).
 
  - If one needs zero-extension instead (for unsigned), they can either not use sign extender (just directly wire lower bits to a larger bus, the missing high bits will be 0 by default if using a splitter configured accordingly or connect them to GND), or we could have a ZeroExtender component (but usually not necessary; constant 0s can be wired).
 
- **Bit Counter (Population Count):**  Counts the number of bits set to 1 in an input vector. **Syntax:**  `bc = BitCounter(width=m)`. Ports:
 
  - Input: `in` (m-bit)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,bits.%20Attributes) .
 
  - Output: `out` (⌈log2(m+1)⌉-bit, or we could make it m-bit to hold the maximum count m in binary)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Outputs%20out%20Outputs%20the%20number,Switches) .
 
  - Behavior: outputs the integer count of how many bits of `in` are 1[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,Inputs%20in) . For example, if in = 10101100 (which has four 1's), out = 0100 (4 in binary)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,Inputs%20in) .
 
  - The output width should be enough to represent m (if all bits were 1). For m=8, output width could be 4 bits (since max count 8 = 1000 (3 bits) plus one more bit to represent 8). Digital’s attribute is `Data Bits` (for input width) and the output bits are determined accordingly[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Outputs%20the%20number%20of%201,Switches) .
 
  - Use case: This can be used for parity calculation, population count in algorithms, etc.
 
  - Implementation likely uses a tree of adders or a lookup, but that’s internal.

These arithmetic components treat data typically as unsigned unless noted. The `signed` flags (in Comparator, Multiply, Divide) modify how results are interpreted or calculated. For instance, the comparator will check sign bits if signed. The barrel shifter in arithmetic mode uses sign bit fill on right shifts.
**Example of using Arithmetic components together:**  Suppose we want to build an ALU that can do add, subtract, AND, OR based on a control input:


```python
A = Input(bit_width=8); B = Input(bit_width=8); 
op = Input(bit_width=2)  # 2-bit operation code: 00=ADD, 01=SUB, 10=AND, 11=OR
adder = Adder(width=8);  adder.a = A; adder.b = B
subt = Subtract(width=8); subt.a = A; subt.b = B
andg = And(bit_width=8); andg.in1 = A; andg.in2 = B
org  = Or(bit_width=8);  org.in1 = A; org.in2 = B
# Use a 4-way multiplexer to select which result:
alu_mux = Multiplexer(num_inputs=4, bit_width=8)
alu_mux.sel = op
alu_mux.in_0 = adder.s    # sum output
alu_mux.in_1 = subt.s    # difference output
alu_mux.in_2 = andg.out  # bitwise AND
alu_mux.in_3 = org.out   # bitwise OR
ALU_out = Output(alu_mux.out, name="ALU_result")
# Carry out and Zero flag
carry_flag = Output(adder.c_out, name="CARRY")  # valid if op was add
zero_flag = Output(BitCounter(width=8).in(alu_mux.out).out == 0, name="ZFLAG")
```

In this pseudo-code, we used multiple arithmetic blocks and a multiplexer to create a simple ALU. We also illustrate deriving a zero flag by counting bits of the result (if none are 1, result was zero). The GGL syntax might allow a comparator or direct equality check instead of `BitCounter(...)==0`. But it demonstrates composition of these primitives.

## Switches (Connect/Disconnect Elements) 

The *Switches* category includes components that can connect or isolate signals manually or by a control signal. In GGL, the primary such component we include is the simple **Switch**  (which can be thought of as a pass-gate controlled by a boolean, or a manual on/off link). Other devices like transistors, relays, etc., from the Digital tool are more analog in nature and are omitted. We focus on a digital switch:
 
- **Switch:**  A basic on/off switch that connects two nodes when closed and disconnects them when open[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=11,the%20connections%20of%20the%20switch) . This can simulate, for example, a physical toggle connecting a circuit or an SPST (single-pole single-throw) switch. **Syntax:**  `sw = Switch(bit_width=1, initially_closed=False, name="SW1")`. Features:
 
  - It has two terminals (let’s call them `A1` and `B1` by convention, following Digital’s naming[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Simple%20switch,Attributes) ). These are essentially the two ends of the switch. Each can be connected to a wire or component pin.
 
  - When the switch is “closed” (on), it conducts, effectively shorting A1 and B1 (making them the same node, so signals pass through unchanged). When “open” (off), A1 and B1 are isolated (no current flow, i.e., no logic connection)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Simple%20switch,Attributes) .
 
  - `bit_width` can be >1 to indicate this is actually a bundle of that many switches operated together (like a multi-bit switch or multi-pole switch). In that case, A1 and B1 become buses of that width.
 
  - **Control:**  The simple Switch is manually controlled (like a DIP switch but connecting two lines rather than outputting fixed 0/1). In simulation, you might toggle it via an API: e.g., `sw.close()` or setting `sw.closed = True`. There is also an attribute `Closed` (initial state) one can set at instantiation[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Pole%20count%20Number%20of%20poles,initial%20state%20of%20the%20switch) . There is *no separate input pin* for controlling the switch in this simple variant (for that, one would use something like a transmission gate or FET controlled by a signal – those are beyond scope).
 
  - No logic transformation: it doesn’t invert or modify the signal, it only passes or blocks it. And it has **no propagation delay**  (when closed, it’s like a wire: changes propagate immediately)[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Simple%20switch,Attributes) .
 
  - This can be used as a manual override or for configuration. For example, one might have a switch to connect a debug signal to an output when needed.

**Example:** 


```python
sw = Switch(name="S1")
sw.A1 = circuit_node
sw.B1 = test_pin.out
# Initially switch is open (A1 and B1 not connected). Later in sim:
sw.closed = True  # now test_pin is connected into circuit_node
```


This could represent patching in a test signal into the running circuit.


In hardware terms, think of it as a jumper or a toggle that either completes a connection or breaks it.
 
- **Double Throw Switch:**  (SPDT) Not explicitly requested in the subset, but for completeness, Digital has one[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=https%3A%2F%2Fgithub) . We won’t detail it fully, but it’s a switch with one common terminal and two selectable throws. GGL could model it as `DoubleThrowSwitch` with ports A (common), B (throw1), C (throw2), and a control or position attribute to connect A–B or A–C.
 
- **Relay, Transistor, etc.:**  These analog-like components (relay coils, FETs, transmission gates) exist in Digital but are beyond the scope of GGL as a purely digital DSL. They essentially implement similar switching behavior but with certain logic (like a transmission gate is an electronically controlled Switch). If needed, a `TransmissionGate(control=x)` could be a future component, but not in this base spec.

**Tri-state Buffers:**  Although not listed explicitly, often one needs a controlled connection in digital buses – a tri-state buffer is like a switch controlled by a signal (drive output when enable=1, or output floats when enable=0). GGL does not list it, but you can achieve that with a combination of a gate and a Switch or using the bus and ROM select as described. If needed, one could have `TriStateBuffer(bit_width=n)` with input, output, enable, that when enabled drives output = input, when disabled effectively disconnects output (output high-Z). The ROM’s behavior with `sel` is an example of tri-state usage[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=C%20Clock%20input,com%2Fhneemann%2FDigital%2063%20%2F%2086) . We assume any tri-state needs (e.g., bus arbitration) can be handled by the user using logic or by enabling/disabling outputs of devices (like the ROM’s chip select) appropriately.

In summary, the Switch is a manually-operated connectivity element with no inherent logic function besides connecting nodes. When closed, it’s as if you replaced it with a wire; when open, it’s as if the wire is cut.


## Subcircuits and Reusability 

One of GGL’s powerful features is the ability to define **subcircuits**  – reusable circuit blocks – using Python abstractions. Subcircuits allow you to define a complex arrangement of components once and instantiate it multiple times, potentially with different parameters. This enables hierarchical design (building bigger circuits from smaller ones) and the creation of standard libraries (e.g., a full adder subcircuit, an ALU, a memory module, etc.). GGL supports subcircuits in a way analogous to defining a function or class in Python:
 
- **Class-based Subcircuit Definition:**  You can define a subclass of a provided `Circuit` base class. Inside the class’s constructor, you instantiate components and wire them together, and assign input/output attributes for the subcircuit’s interface. For example:


```python
class FullAdder(Circuit):
    def __init__(self, name=None):
        super().__init__(name)
        # Define interface of subcircuit
        self.a = Input(name="A")
        self.b = Input(name="B")
        self.cin = Input(name="C_in")
        self.sum = Output(name="S")
        self.cout = Output(name="C_out")
        # Internal wiring using primitive gates:
        xor1 = Xor(self.a, self.b)
        sum_xor = Xor(xor1, self.cin)
        carry1 = And(xor1, self.cin)
        carry2 = And(self.a, self.b)
        carry_out = Or(carry1, carry2)
        # Connect to subcircuit outputs
        self.sum.in = sum_xor    # drive the sum output pin
        self.cout.in = carry_out
```

In this definition, when you instantiate `fa = FullAdder(name="FA1")`, it will create the internal XOR/AND/OR gates and expose pins `fa.a, fa.b, fa.cin, fa.sum, fa.cout`. You can then connect `fa` into a larger circuit: e.g., `fa.a = bit0; fa.b = bit1; fa.cin = prev_carry`. In simulation, the `fa.sum.out` and others work like any other signals. Essentially, the `FullAdder` class acts like a new component type composed of basic ones.
The `Circuit` base class would handle that each `Input` and `Output` declared in `FullAdder` actually refers to the external connections of the subcircuit, not new separate components inside (they likely are thin wrappers to the parent circuit’s connectivity).
 
- **Function/Decorator-based Subcircuit:**  As an alternative, GGL might allow a more concise definition using a decorator. For example:


```python
@subcircuit(inputs=["A","B","C_in"], outputs=["S","C_out"])
def FullAdder(A, B, C_in):
    S = Xor(Xor(A, B), C_in)        # sum = A xor B xor C_in
    C_out = Or( And(Xor(A,B), C_in), And(A, B) )
    return S, C_out
```

Here, the `@subcircuit` decorator would take care of creating a new circuit block named FullAdder with the given inputs and outputs. The function body uses those as if they were signals (the decorator would provide proxy objects for A, B, C_in representing subcircuit inputs). It builds the logic and returns the outputs. Internally, this is transformed into a circuit object similar to the class above. This style can be more approachable to beginners as it resembles writing a combinational logic formula, with the DSL handling wiring.
 
- **Parameterizable Subcircuits:**  You can design subcircuits that take parameters, like bit width. For instance, you could write a subcircuit `RippleAdder(n)` that builds an n-bit ripple-carry adder from n instances of the FullAdder above. In class form, that could be:


```python
class RippleAdder(Circuit):
    def __init__(self, bit_width=8):
        self.a = Input(bit_width, name="A")
        self.b = Input(bit_width, name="B")
        self.cin = Input(name="C_in")
        self.sum = Output(bit_width, name="SUM")
        self.cout = Output(name="C_out")
        # create bit_width full adders chained
        carry = self.cin
        for i in range(bit_width):
            fa = FullAdder()
            fa.a = self.a[i]
            fa.b = self.b[i]
            fa.cin = carry
            self.sum[i].connect(fa.sum.out)  # connect each sum bit
            carry = fa.cout  # next carry comes from this FA
        self.cout.in = carry
```

This demonstrates using Python’s loop to replicate pattern – something not easily done in pure schematic but trivial in code. Now `RippleAdder(8)` yields an 8-bit adder, and `RippleAdder(16)` yields 16-bit.
GGL’s approach to parameterized subcircuits thus allows the creation of **generic circuits**  (like Digital’s generic circuits feature[github.com](https://github.com/hneemann/Digital#:~:text=,be%20clocked%20at%20120%20kHz) ), where e.g. you can define a barrel shifter that works for any width by generating the internal wiring based on a parameter.
 
- **Standard Library and Reuse:**  One can imagine a library file defining many useful subcircuits: decoders, multiplexers (though those are primitives already), entire ALUs, etc. These can be imported and used. Because GGL uses Python, you can organize these subcircuits in modules and import them normally (`from mylib import FullAdder, RippleAdder`).
 
- **Simulation semantics:**  Subcircuits do not inherently introduce new timing (unless explicitly modeled). In simulation, they are “flattened” or simulated through their internal components. From the outside, they behave just like any other component: their outputs respond to input changes combinationally or clocked depending on inside logic.
 
- **Verilog/HDL mapping:**  Subcircuits could later be translated to Verilog modules if needed (each subcircuit becoming a module). Because the DSL captures their structure, an exporter can handle that.


Using subcircuits keeps designs manageable and reflects real-world hierarchical design practices. It also allows easier verification: you could test a subcircuit (like FullAdder) independently in a small GGL script, then trust it when using in a larger design.


## Design Considerations and Syntax Trade-offs 

The GGL specification, as described, has been crafted with an emphasis on **readability**  and **usability**  for education and design. During the design process, several options were considered for how users would write circuits in Python. Below we discuss some of these decisions and trade-offs:
 
- **Class-based vs. Function-based Circuit Definitions:**  We provided two ways to define subcircuits (class and decorator function). A class-based approach is very explicit and aligns with how hardware engineers think of modules: you instantiate a class to get a component. It also naturally supports multiple instances and parameterization (via `__init__` arguments). However, it introduces boilerplate and might be a bit abstract for a beginner (they need to understand classes). The function-with-@subcircuit decorator is more approachable: it looks like writing equations for outputs in terms of inputs, almost like writing a truth table or behavioral code. We included both to cater to different user comfort levels. The decorator can internally create a class or structure, so it’s mainly syntax sugar. **Trade-off:**  The decorator approach may be less flexible for certain things (like internal state or if one needed iterative constructs inside – although one can use Python inside the function too). The class approach might be more verbose, but it’s clear and mirrors how one might manually craft netlist objects.
 
- **Direct Wiring vs. Parameter Passing:**  In our examples, we sometimes connected components by passing signals to constructors (`Xor(A,B)`) and other times by assigning attributes (`gate.in1 = X`). GGL could consistently use one style, but we decided to allow both:
 
  - **Constructor wiring**  is concise and reads like a functional circuit description (much like writing an expression). It’s very handy for combinational logic: e.g., `Z = And(Xor(A,B), C)` feels math-like. We leveraged Python’s ability to overload the call or use a convenient constructor returning output. In our spec, simple gates return their output signal for chaining.
 
  - **Explicit attribute wiring**  is sometimes necessary, especially if components are created without all connections ready, or for clarity when connecting many things (like hooking up a 8-bit bus bit by bit to a subcircuit’s inputs, etc.). It’s also the model the underlying netlist likely uses (each port is an attribute you connect).

By supporting both, a beginner can choose the style that makes sense. This dual approach is similar to some hardware libraries (e.g., migen or PyRTL) which allow both building expressions and explicit connections.
 
- **Use of Python Operators:**  An idea considered was to overload Python bitwise operators for connecting or combining signals. For example, some DSLs let you do `out <<= a & b` for an AND gate or use `a & b` directly to mean And. We opted for clear function calls (And, Or, etc.) to avoid confusion, but this is an area of possible extension. Overloading `&` for `AndGate` might be intuitive for some but could lead to subtle issues (operator precedence, mixing Python ints vs signals, etc.). For now, we keep it straightforward with function calls and leave operator overloading as an advanced feature.
 
- **Immutability vs. Mutability of Connections:**  In GGL, once you connect signals, that essentially builds the circuit. We must handle if a user tries to rewire something (e.g., assign to a port that was already connected). The DSL can either allow it (redefine the connection) or throw an error to prevent mistakes. We likely lean toward treating connections as final or requiring an explicit removal to change, to catch errors early. This is an implementation detail but important for consistency – in a real circuit, you can’t have two drivers on one input (unless that’s intended tri-state scenario).
 
- **Clock and Global Signals:**  We considered having a single implicit global clock for sequential components (so you wouldn’t need to wire the same clock to dozens of flip-flops manually). While convenient for synchronous circuits, it’s inflexible (not all circuits use one clock, and you might want multi-phase clocks, etc.). So we decided *not* to hide the clock: the user should explicitly connect clocks. This is more verbose but more transparent. We could add a shorthand like setting a default clock in a context, but that’s beyond core spec.
 
- **Decorators and Meta-programming:**  Python allows very powerful meta-programming. The `@subcircuit` decorator is one example, but we could also have decorators for things like automatically generating test benches or converting a function into a truth-table ROM, etc. We have to balance providing magical convenience vs. keeping the DSL understandable. The current spec opts for clarity (only a couple of decorators for subcircuits). More advanced uses (like a decorator to mark a method to run as simulation process, etc.) can be added later.
 
- **Dynamic vs. Static structure:**  GGL being embedded in Python means the circuit can be generated dynamically (loops, conditions, etc. at generation time). One trade-off is that the circuit netlist is fully determined only after running the script. This is fine, but if a user writes code with variable topology depending on data, it might be tricky to debug. We assume the user script is like a constructor for the design – it shouldn’t have data-dependent *structural* changes during simulation (that would be like self-modifying hardware). That’s more of a best-practice note.
 
- **Error handling and Safety:**  We ensure that certain illegal configurations (like connecting two outputs together without a proper combiner or using incompatible bit-widths) produce clear errors. The DSL could do some static checking (e.g., if you connect a 4-bit bus to a 1-bit input without splitter, flag it). Because Python is dynamically typed, these checks happen at runtime (circuit build time), but we aim for immediate feedback.
 
- **Naming Conventions:**  We chose capitalized class names for components (And, NAnd, etc.), and lower_case for instance attributes (like `.in`, `.out`, or `.sel`). This differentiates component types vs. signals in code. We’ve also tried to use meaningful names for ports (e.g., `D, C, Q` for flip-flops, `a, b, s` for adder) similar to conventional schematics, which makes the code more self-documenting.
 
- **Compatibility with Digital’s component set:**  We deliberately matched component sets and behaviors to the *Digital* simulator’s ones, to make it easy to cross-verify circuits. For example, multi-bit gate behavior[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Binary%20AND%20gate,This) , the presence of a priority encoder with similar semantics[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=5,com%2Fhneemann%2FDigital%2047%20%2F%2086) , etc., all mirror that environment. This not only validates our choices (since Digital is an established tool) but also sets the stage for possibly importing Digital’s `.dig` files into GGL or vice versa. Some minor differences: we might simplify certain things (like not exposing every attribute such as “Rotation” or analog components). But overall, a design that works in Digital should be expressible in GGL.
 
- **Potential Verilog Export:**  One design goal was future Verilog export. To facilitate that, we’ve structured GGL components in a way that closely corresponds to typical synthesizable constructs:
 
  - Each subcircuit can map to a module.
 
  - Each primitive can map to an equivalent in Verilog (e.g., gates map to `assign` or bitwise ops, adders could map to `+`, etc., or instantiate Verilog primitives).
 
  - Because we avoid fancy Python runtime logic beyond netlist definition, it’s straightforward to traverse the final netlist and spit out HDL. For instance, a GGL RAM can be exported as a Verilog memory (an `reg [7:0] mem [0:1023]` with an always block for write).
 
  - By keeping the semantics close to hardware, we avoid Python-specific contructs that wouldn’t translate (like if someone tried to do computation in Python to decide a value instead of building logic – though the DSL could catch that by distinguishing between using Python int vs. a Signal).
 
  - The main adaptation for Verilog is the idea of high-impedance (Z) states for tri-state lines – we included in ROM/tri-state concept. We might need to ensure tri-state can be represented (Verilog has `highz0` and such).
 
  - Also, sequential logic like flip-flops and counters map directly to always @(posedge clk) blocks.

In conclusion, GGL’s design choices aim to balance **ease of use**  (especially for those learning digital logic) with **flexibility**  for advanced circuits. By leveraging Python, users get to use a familiar language and features (like lists, loops, conditionals) to generate repetitive structures, which can significantly reduce manual work and errors. At the same time, the DSL enforces a clear structure that corresponds to real hardware components, which is critical for educational value and potential synthesis.

## Conclusion 


This specification detailed the syntax and capabilities of the Golden Gates Language. With its Python-like syntax and comprehensive set of components, GGL allows users to construct digital circuits ranging from simple gate networks to complex processors in a modular, reusable fashion. Each component from basic logic gates to memory units has a defined instantiation pattern and behavior, aligning with real-world digital logic principles and the proven component set of the Digital simulator. By writing GGL code, users essentially “write a circuit” – one that can be simulated immediately or fed into tools for analysis.

Through examples, we demonstrated how to instantiate components, form connections, and define subcircuits. The design trade-offs discussed ensure that GGL remains **readable**  (good for teaching, code reviews, and maintaining designs) while being **powerful**  enough to express sophisticated systems. As the language evolves, additional features like automatic testbenches, integration with physical FPGAs, or more advanced analog components can be added on this solid foundation.

In summary, Golden Gates Language provides a bridging framework between the world of textual programming and schematic circuit design, enabling a seamless flow from concept to simulation. With GGL, one can visualize a logic schematic and directly write it out in Pythonic code – combining the best of both worlds for digital design enthusiasts and professionals alike.

**References:**  The behavior and features of GGL components are based on known digital logic designs and specifically draw from the *Digital* logic simulator’s documentation[wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=Binary%20AND%20gate,This) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=2,input%20is%20set%20to%201) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=This%20input%20is%20used%20to,Attributes) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=5,com%2Fhneemann%2FDigital%2047%20%2F%2086) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=6.4.%20D,allows%20to%20store%20multiple%20bits) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,bits.%20Attributes) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,c_i) [wcours.gel.ulaval.ca](https://wcours.gel.ulaval.ca/2021/a/GIF1002/default/6travaux/Doc_English2019.pdf#:~:text=10,Attributes) , ensuring that GGL’s semantics align with established definitions. Python’s suitability for hosting such DSLs is well-recognized[aha.stanford.edu](https://aha.stanford.edu/building-dsls-python#:~:text=Python%20is%20the%20preferred%C2%A0language%20for,my%20experience%20of%20building%C2%A0DSLs%20at%C2%A0AHA) , lending credence to GGL’s approach of making hardware description as accessible as writing a Python script.![Favicon](https://www.google.com/s2/favicons?domain=https://wcours.gel.ulaval.ca&sz=32) 
![Favicon](https://www.google.com/s2/favicons?domain=https://aha.stanford.edu&sz=32) 
![Favicon](https://www.google.com/s2/favicons?domain=https://github.com&sz=32) 

Sources
