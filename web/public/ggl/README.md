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
- `config.toml` - Autograder configuration file

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
  updateCallback('step', component_js_id, {'active': True, 'style': 'processing'})


## Logging

The default log level is `logging.WARN`. Our `logger` objects propagate to the browser console when running under Pyodide.

To change the log level in a GGL source file:

```python
import logging
logger = new_logger(__name__, logging.INFO)
```

If you're working in GGL without Pyodide you can use an environment variable to avoid changing code:

```sh
export ggloglevel='logging.INFO'; grade test
```

## Errors

1. Use the Exception class in `errors.py` to bubble errors up to the front-end. 
1. Errors do not use the Vue callback mechanism. 
1. Error strings are stored in the locale file(s) in the front-end, and referred to using string IDs which are shared between the front-end and GGL