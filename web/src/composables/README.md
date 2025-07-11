# Composables Architecture

This directory contains the composables that implement the MVC architecture for the Golden Gates circuit designer.

## Architecture Overview

The application follows a clean MVC pattern with clear separation of concerns:

- **Model Layer**: `useCircuitManager.js` - Centralized state management for all circuits
- **View Layer**: Vue components (App.vue, CircuitCanvas.vue, ComponentInspector.vue, etc.)
- **Controller Layer**: Various composables that handle business logic and user interactions

## Composables

### Core Architecture

#### `useCircuitManager.js` (Model Layer)
- **Purpose**: Centralized state management for all circuits
- **Responsibilities**:
  - Circuit data storage and retrieval
  - Tab management
  - Circuit navigation
  - Component operations (add, remove, update)
  - State import/export
- **Key Concepts**:
  - Single source of truth for all circuit data
  - Peer-based circuit system (no "main" circuit)
  - Reactive state management using Vue 3 composition API

#### `useCircuitOperations.js` (Controller Layer)
- **Purpose**: Business logic for circuit operations
- **Responsibilities**:
  - File operations (save/load circuits)
  - Simulation management
  - Circuit validation
  - User confirmations
  - Error handling
- **Dependencies**: `useCircuitManager`, `useFileOperations`, `usePyodide`

#### `useCanvasInteractions.js` (Controller Layer)
- **Purpose**: UI interaction logic for circuit canvas
- **Responsibilities**:
  - Mouse and keyboard event handling
  - Component placement logic
  - Wire drawing interactions
  - Selection management
  - Drag and drop operations
- **Dependencies**: `useCircuitManager`, canvas operation composables

### Supporting Composables

#### `useCanvasOperations.js`
- Canvas rendering and viewport management
- Zoom, pan, grid snapping
- Mouse position calculations

#### `useWireManagement.js`
- Wire drawing and editing
- Connection point management
- Wire junction handling

#### `useSelection.js`
- Component and wire selection
- Multi-select operations
- Rubber-band selection

#### `useDragAndDrop.js`
- Component dragging
- Wire dragging
- Grid snapping during drag

#### `useFileOperations.js`
- File save/load operations
- JSON validation
- Error handling

#### `usePyodide.js`
- Python/Pyodide integration
- Simulation execution
- Error handling

## Data Flow

```
User Action → View (Component) → Controller (Composable) → Model (CircuitManager) → View Update
```

### Example: Adding a Component

1. **User Action**: Click "Add Component" in menu
2. **View**: App.vue receives click event
3. **Controller**: `useCircuitOperations.createNewCircuit()` called
4. **Model**: `useCircuitManager.createCircuit()` updates state
5. **View Update**: All dependent components react to state changes

## Key Principles

### 1. Single Source of Truth
- All circuit data is stored in `useCircuitManager`
- No duplicate state across components
- Reactive updates propagate automatically

### 2. Clear Separation of Concerns
- **Model**: Data storage and basic operations
- **View**: UI rendering and user interaction
- **Controller**: Business logic and coordination

### 3. Consistent Naming
- `activeCircuit` instead of `currentCircuit`
- `allCircuits` instead of `circuits`
- `circuitManager` instead of `hierarchy`

### 4. Prop vs Direct Usage
- Pass managers as props to components
- Use composables directly in setup() functions
- Avoid mixing patterns within the same component

## Usage Guidelines

### Creating a New Feature

1. **Identify the layer**: Is this data (Model), UI (View), or logic (Controller)?
2. **Choose the right composable**: Use existing or create new if needed
3. **Follow naming conventions**: Use consistent naming patterns
4. **Document dependencies**: Clearly state what each composable depends on

### Debugging

1. **Check the model first**: Verify data in `useCircuitManager`
2. **Trace the flow**: Follow User Action → View → Controller → Model
3. **Use Vue DevTools**: Inspect reactive state and component props
4. **Check console logs**: Each layer has appropriate logging

### Testing

1. **Unit test composables**: Test business logic in isolation
2. **Integration test components**: Test component + composable interactions
3. **E2E test user flows**: Test complete user journeys

## Migration Notes

### From Old Architecture

The old architecture mixed responsibilities and had unclear data flow. The new architecture provides:

- **Better maintainability**: Clear separation makes changes easier
- **Improved testability**: Each layer can be tested independently
- **Enhanced debuggability**: Clear data flow makes issues easier to trace
- **Easier feature addition**: Well-defined patterns for new features

### Breaking Changes

- `useCircuitHierarchy` → `useCircuitManager`
- `currentCircuit` → `activeCircuit`
- `circuits` → `allCircuits`
- Component props changed from `hierarchy` to `circuitManager`

## Future Improvements

1. **Type Safety**: Add TypeScript interfaces for better type checking
2. **Error Boundaries**: Implement error boundaries for better error handling
3. **Performance**: Add virtualization for large circuits
4. **Undo/Redo**: Implement command pattern for undo/redo functionality
5. **Persistence**: Add automatic save/restore functionality