# Code Generation Architecture

This directory contains the TypeScript class hierarchy that generates Python source code for the GGL (Golden Gates Language) circuit simulation engine from Vue.js UI components.

## Overview

The code generation system converts visual circuit designs created in the Vue.js interface into executable Python code that runs on the GGL simulation engine. This is achieved through a well-structured TypeScript class hierarchy that maps UI components to their corresponding Python GGL classes.

## Class Hierarchy

```
ComponentGeneratorFactory
├── BaseComponentGenerator (abstract)
│   ├── IOComponentGenerator (abstract)
│   │   ├── InputGenerator
│   │   └── OutputGenerator
│   ├── LogicGateGenerator
│   └── WireComponentGenerator (abstract)
│       ├── SplitterGenerator
│       └── MergerGenerator
```

### BaseComponentGenerator

The foundation class that provides:
- **Global variable naming** with sequential numbering (input0, input1, etc.)
- **Component data extraction** (id, type, props, label)
- **Name registry** to prevent variable name conflicts
- **Common interface** for all component types

### IOComponentGenerator

Abstract base class for input/output components providing:
- Bit width, value, and number base handling
- Value formatting for different bases (binary, decimal, hex)
- Common GGL parameter generation

### WireComponentGenerator

Abstract base class for wire-based components providing:
- Range handling for splitters and mergers
- Range formatting for Python array syntax
- Wire connection management

## Generator Classes

### InputGenerator
Generates Python code for input components:
```python
input0 = io.Input(bits=1, label="A")
input0.value = 0
```

**Features:**
- Configurable bit width
- Initial value setting in specified base format
- Label assignment

### OutputGenerator
Generates Python code for output components:
```python
output0 = io.Output(bits=1, label="R", js_id="component-123")
```

**Features:**
- JavaScript ID mapping for result retrieval
- Configurable bit width and labeling

### LogicGateGenerator
Handles all logic gate types (AND, OR, XOR, NOT, NAND, NOR, XNOR):
```python
and0 = logic.And(bits=1, label="", num_inputs=2)
```

**Features:**
- Dynamic gate type extraction from component type string
- Configurable number of inputs
- Bit width configuration

### SplitterGenerator
Generates splitter components for wire division:
```python
splitter0 = wires.Splitter(label="splitter", bits=8, splits=[[0,1],[2,3],[4,5],[6,7]])
```

**Features:**
- Converts range objects to Python array format
- Handles complex bit splitting configurations

### MergerGenerator
Generates merger components for wire combination:
```python
merger0 = wires.Merger(label="merger", bits=8, merge_inputs=[[0,1],[2,3],[4,5],[6,7]])
```

**Features:**
- Similar to splitter but for merging wire segments
- Range-based input configuration

## ComponentGeneratorFactory

The factory serves as the single entry point for creating generators:

```typescript
export function createComponentGenerator(componentData: ComponentData): ComponentGenerator {
  switch (componentData.type) {
    case 'input': return new InputGenerator(componentData)
    case 'output': return new OutputGenerator(componentData)
    case 'and-gate':
    case 'or-gate':
    // ... all gate types
      return new LogicGateGenerator(componentData)
    case 'splitter': return new SplitterGenerator(componentData)
    case 'merger': return new MergerGenerator(componentData)
    default: throw new Error(`Unknown component type: ${componentData.type}`)
  }
}
```

**Benefits:**
- Type safety through the ComponentGenerator interface
- Centralized component type mapping
- Clean separation between UI and code generation

## Integration with useCodeGenController

The `useCodeGenController` composable orchestrates the entire generation process:

1. **Component Processing**: Uses BFS to process components in dependency order
2. **Factory Integration**: Creates generators via the factory for each component
3. **Variable Tracking**: Maintains component ID to variable name mapping
4. **Connection Generation**: Creates `circuit.connect()` calls for wires
5. **Wire Junction Handling**: Processes complex wire connections
6. **Program Assembly**: Combines all parts into a complete Python program

### Key Features

- **Dual Path**: Uses component instances if available, falls back to factory
- **Name Registry Reset**: Ensures fresh variable names for each generation
- **BFS Ordering**: Processes components in logical dependency order
- **Connection Mapping**: Handles complex wire routing including junctions

## Generated Python Code Structure

The system generates clean, readable Python code that directly maps to the GGL API:

```python
from ggl import io, logic, circuit, wires

circuit0 = circuit.Circuit(js_logging=True)

# Component declarations
input0 = io.Input(bits=1, label="A")
input0.value = 1

input1 = io.Input(bits=1, label="B")
input1.value = 1

and0 = logic.And(bits=1, label="", num_inputs=2)

output0 = io.Output(bits=1, label="R", js_id="output-123")

# Connections
circuit0.connect(input0, and0.input("0"))    # input0 -> and0.in[0]
circuit0.connect(input1, and0.input("1"))    # input1 -> and0.in[1]
circuit0.connect(and0, output0)              # and0 -> output0

circuit0.run()
```

## Variable Naming Conventions

- **Sequential numbering** starting from 0 (input0, input1, etc.)
- **Type-based prefixes** (input, output, and, or, etc.)
- **Global registry** prevents collisions across component types

## Vue Component Integration

Vue components interact with the generation system through:

1. **Component Data Structure**: Each component has `{id, type, props, x, y}` structure
2. **Component Registry**: Maps component types to Vue components and metadata
3. **Dynamic Connections**: Some components (splitter/merger) have dynamic ports
4. **Circuit Canvas**: Renders components and passes data to generators

The integration maintains clean separation:
- Vue components handle only UI rendering
- Code generation is completely separated
- Component data flows from UI to generators via the factory

## Adding New Component Types

To add a new component type:

1. **Create a new generator class** extending the appropriate base class
2. **Implement the `generateCode()` method** to produce Python code
3. **Add the component type** to the ComponentGeneratorFactory switch statement
4. **Add component metadata** to the component registry
5. **Create the corresponding Vue component** for UI rendering

## Error Handling

The system includes robust error handling:
- Try-catch blocks around generator creation
- Graceful degradation for missing components
- Detailed logging for debugging
- Type checking through TypeScript interfaces

This architecture provides a robust, type-safe, and maintainable foundation for converting visual circuit designs into executable Python code for the GGL simulation engine.