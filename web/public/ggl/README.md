# GGL (Golden Gates Language) Module

This directory contains the Python-based circuit simulation engine for Golden Gates.

## Location Rationale

The GGL module is placed in `web/public/ggl/` for the following reasons:

1. **Direct Browser Access**: Vite serves the `public/` directory at the web root, making these files accessible at `/ggl/` in the browser
2. **Pyodide Integration**: When Pyodide runs in the browser, it can directly import modules from `/ggl/` without any path manipulation
3. **No Build Processing**: Files in `public/` are served as-is without Vite transformation, which is ideal for Python source files

## Usage with Pyodide

```python
# After Pyodide is initialized, you can import directly:
from ggl import Circuit, Input, Output, AndGate

# Or import the entire module:
import ggl
```

## Module Structure

- `__init__.py` - Package initialization with all exports
- `circuit.py` - Circuit class for managing nodes and connections
- `node.py` - Base Node class and Connector
- `edge.py` - Edge class for connections
- `io.py` - Input/Output node classes
- `logic.py` - Logic gate implementations (AND, OR, NOT, NAND, NOR, XOR)
- `config.toml` - Configuration file