# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Golden Gates is an educational circuit simulation tool implemented in Python. It provides:
- A Python library (GGL - Golden Gates Language) for constructing and simulating digital logic circuits
- Core circuit elements: gates, inputs, outputs, edges (wires)
- Circuit simulation engine using a breadth-first work queue

## Architecture

The codebase follows a modular architecture:

### Core Components
- **Circuit** (`circuit.py`): Main container that holds nodes and manages simulation via `run()` method
- **Node** (`node.py`): Base class for all circuit elements. Key subclasses:
  - `BitsNode`: Nodes with bit width (gates, plexers, registers)
  - Input/output points use string names (e.g., "0", "1", "cin", "cout")
- **Edge** (`edge.py`): Connections between nodes that carry values
  - One-to-many: single output can feed multiple inputs
  - Bidirectional references between nodes and edges
- **Logic Gates** (`logic.py`): AND, OR, XOR gates inheriting from `Gate` class
- **I/O Nodes** (`io.py`): Input, Output, and Constant nodes

### Key Design Patterns
1. **Propagation Model**: Values propagate from inputs through edges to nodes
2. **Work Queue**: Circuit simulation uses breadth-first traversal, not depth-first
3. **Named Endpoints**: Nodes have named input/output points for flexible connections
4. **Bidirectional References**: Nodes and edges maintain references to each other

## Common Commands

### Running Tests
```bash
# Run a single test
cd model/ggl/tests/ggl
python3 1-and-1.py

# The test framework uses autograder (https://github.com/phpeterson-usf/autograder/)
# Test cases are defined in ggl.toml files
```

### Working with the GGL Library
```python
# Import the library modules
import sys
sys.path.append('../')  # Adjust path as needed
from ggl import circuit, io, logic

# Create a circuit
c = circuit.Circuit()

# Create components
g = logic.And(bits=1, label='mygate')
a = io.Input(bits=1, label='a')
r = io.Output(bits=1, label='result')

# Connect components (srcnode, srcname, destnode, destname)
c.connect(a, "0", g, "0")
c.connect(g, "0", r, "0")

# Set input values and run
a.value = 0b1
c.run()
print(r.value)
```

## Development Notes

- The project uses Python's built-in logging module configured at INFO level
- Test structure follows autograder conventions with TOML configuration
- No external dependencies beyond Python standard library
- Circuit labels are optional but recommended for debugging