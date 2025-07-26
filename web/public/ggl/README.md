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

## Coding Style

- We use `pycodestyle` (formerly known as `pep8` like this:
    ```sh
    pip install pycodestyle
    autopep8 --in-place *.py
    ```
- We haven't set up any custom config in `~/.config/pycodestyle` but that could be done

## Callbacks

⏺ The __vueUpdateCallback function expects 3 scalar arguments:

  window.__vueUpdateCallback = (eventType, componentId, value) => {

  Arguments:

  1. eventType (string): The type of event - 'value', 'step', or 'error'
  2. componentId (string): The Vue component ID (corresponds to the js_id parameter)
  3. value (any): The payload data - can be scalar or object depending on event type

  From Python, you would call it like:

  ### For value updates
  updateCallback('value', component_js_id, new_value)

  ### For step highlighting
  updateCallback('step', component_js_id, {'active': True, 'style': 'processing', 'duration':
  500})

  ### For errors
  updateCallback('error', component_js_id, {'severity': 'error', 'messageId': 'SOME_ERROR',
  'details': {}})
  
  ### Or simple string error:
  updateCallback('error', component_js_id, "Error message string")

  The value parameter can be a Python dict that gets converted to a JavaScript object when
  passed across the Pyodide boundary.