# Vue Frontend Architecture

## GGL Code Generation

This document explains how Golden Gates Language (GGL) code generation works in the Vue frontend.

### Overview

The frontend uses a TypeScript mixin-based architecture to generate GGL Python code from circuit components. This design provides type safety, code reuse through inheritance, and maintains object-oriented principles that mirror the Python GGL implementation.

### Architecture

#### Core Interfaces

**`types/Generatable.ts`**
- `Generatable` - Interface that all components must implement
- `GeneratedStatement` - Return type containing variable name and GGL code
- Provides compile-time contract enforcement

```typescript
interface Generatable {
  generate(): GeneratedStatement
}

interface GeneratedStatement {
  varName: string
  code: string
}
```

#### Factory-Based Architecture

The generation system uses a factory pattern with TypeScript classes that mirror the Python GGL class hierarchy:

```
ComponentGeneratorFactory
├── BaseComponentGenerator (abstract)
│   ├── IOComponentGenerator (abstract)
│   │   ├── InputGenerator
│   │   └── OutputGenerator
│   ├── LogicGateGenerator
│   ├── SplitterGenerator
│   ├── MergerGenerator
│   └── WireGenerator
```

**Base Level:**
- `BaseComponentGenerator` - Common utilities (sequential variable name generation starting from 0, collision-free)

**Category Level:**
- `IOComponentGenerator` - Shared logic for input/output components
- `LogicGateGenerator` - Shared logic for ALL logic gates (AND, OR, XOR, etc.)

**Specific Level:**
- `InputGenerator` - Input component generation
- `OutputGenerator` - Output component generation
- `SplitterGenerator` - Splitter component generation
- `MergerGenerator` - Merger component generation

#### Key Benefits

1. **Code Deduplication**: All logic gates (AND, OR, XOR, NAND, NOR, XNOR, NOT) share the same generation logic in `LogicGateGenerator`

2. **Type Safety**: TypeScript enforces that all generators implement the `ComponentGenerator` interface

3. **Inheritance**: Classes inherit from each other, reducing duplication at each level

4. **Separation of Concerns**: Vue components handle UI, generator classes handle code generation

### Component Implementation

Vue components focus purely on UI rendering, while code generation is handled by the factory system:

```typescript
// LogicGate.vue
export default defineComponent({
  name: 'LogicGate',
  props: {
    // ... UI props only
  },
  // ... UI methods only
  // No generate() method - handled by factory
})
```

```typescript
// InputNode.vue  
export default defineComponent({
  name: 'InputNode',
  props: {
    // ... UI props only
  },
  // ... UI methods only
  // No generate() method - handled by factory
})
```

### Generated Code Examples

**Input Component:**
```python
input0 = io.Input(bits=1, label="A")
input0.value = 0
```

**Logic Gate:**
```python
and0 = logic.And(bits=1, label="", num_inputs=2)
```

**Output Component:**
```python
output0 = io.Output(bits=1, label="R", base=10)
```

### Code Generation Flow

1. **Component Data**: Vue components maintain UI state and component data
2. **Factory Pattern**: `ComponentGeneratorFactory` creates the appropriate generator class based on component type
3. **Circuit Generation**: `useCodeGenController.js` uses the factory to create generators from component data
4. **Type Safety**: All generators implement the `ComponentGenerator` interface
5. **GGL Output**: Complete Python program ready for execution

### File Structure

```
src/
├── types/
│   └── ComponentGenerator.ts        # Core interfaces
├── generators/
│   ├── BaseComponentGenerator.ts    # Base utilities
│   ├── IOComponentGenerator.ts      # I/O shared logic
│   ├── InputGenerator.ts            # Input generation
│   ├── OutputGenerator.ts           # Output generation
│   ├── LogicGateGenerator.ts        # All logic gates
│   ├── SplitterGenerator.ts         # Splitter generation
│   ├── MergerGenerator.ts           # Merger generation
│   ├── WireGenerator.ts             # Wire generation
│   └── ComponentGeneratorFactory.ts # Factory function
├── components/
│   ├── InputNode.vue                # Pure UI component
│   ├── OutputNode.vue               # Pure UI component
│   ├── LogicGate.vue                # Pure UI component
│   ├── SplitterComponent.vue        # Pure UI component
│   └── MergerComponent.vue          # Pure UI component
└── composables/
    └── useCodeGenController.js      # Orchestrates generation
```

### Design Principles

1. **Object-Oriented**: Maintains inheritance patterns from Python GGL
2. **Type Safety**: Compile-time enforcement of generation contracts
3. **DRY Principle**: Single implementation shared across similar components
4. **Separation of Concerns**: UI and generation logic are cleanly separated
5. **Factory Pattern**: Single entry point for creating generators based on component type
6. **Data-Driven**: Generators work with component data rather than Vue instances

This architecture eliminates the previous fragmented approach where generation logic was scattered across multiple files and provides a clean, maintainable foundation for circuit-to-code generation.