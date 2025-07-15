import { defineAsyncComponent } from 'vue'
import { GRID_SIZE } from './constants'
import { createGateRegistryEntry } from './componentFactory'
import { gateDefinitions } from '../config/gateDefinitions'

// Registry of all available circuit components
export const componentRegistry = {
  // Logic gates - generated from gateDefinitions
  'and-gate': createGateRegistryEntry('and', gateDefinitions.and),
  'or-gate': createGateRegistryEntry('or', gateDefinitions.or),
  'xor-gate': createGateRegistryEntry('xor', gateDefinitions.xor),
  'not-gate': createGateRegistryEntry('not', gateDefinitions.not),
  'nand-gate': createGateRegistryEntry('nand', gateDefinitions.nand),
  'nor-gate': createGateRegistryEntry('nor', gateDefinitions.nor),
  'xnor-gate': createGateRegistryEntry('xnor', gateDefinitions.xnor),
  
  'input': {
    component: defineAsyncComponent(() => import('../components/InputNode.vue')),
    label: 'Add Input',
    icon: 'pi pi-circle',
    category: 'io',
    defaultProps: {
      value: 0,
      base: 10,
      bits: 1,
      gridSize: GRID_SIZE,
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE,
      height: GRID_SIZE
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: -10,  // Extended left to accommodate longer values
      y: -30,  // Extended up to include value text
      width: GRID_SIZE + 20,  // Extra width for value display
      height: 45  // Height to include value text above
    },
    // Visual center relative to the component's x,y position
    center: {
      x: GRID_SIZE / 2,
      y: 0
    },
    connections: {
      outputs: [
        { name: '0', x: GRID_SIZE, y: 0 }
      ]
    },
    // Special handling for input nodes
    onCreate: (instance, index) => {
      instance.props.label = String.fromCharCode(65 + index) // A, B, C, etc.
    }
  },
  
  'output': {
    component: defineAsyncComponent(() => import('../components/OutputNode.vue')),
    label: 'Add Output',
    icon: 'pi pi-circle-fill',
    category: 'io',
    defaultProps: {
      value: 0,
      bits: 1,
      base: 10,
      gridSize: GRID_SIZE,
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE,
      height: GRID_SIZE
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: -10,  // Extended left to accommodate longer values
      y: -30,  // Extended up to include value text
      width: GRID_SIZE + 20,  // Extra width for value display
      height: 45  // Height to include value text above
    },
    // Visual center relative to the component's x,y position
    center: {
      x: GRID_SIZE / 2,
      y: 0
    },
    connections: {
      inputs: [
        { name: '0', x: 0, y: 0 }
      ]
    },
    // Special handling for output nodes
    onCreate: (instance, index) => {
      instance.props.label = String.fromCharCode(82 + index) // R, S, T, etc.
    }
  },
  
  'splitter': {
    component: defineAsyncComponent(() => import('../components/SplitterComponent.vue')),
    label: 'Splitter',
    icon: 'pi pi-share-alt',
    category: 'wires',
    defaultProps: {
      inputBits: 8,
      ranges: [
        { start: 0, end: 1 },
        { start: 2, end: 3 },
        { start: 4, end: 5 },
        { start: 6, end: 7 }
      ],
      rotation: 0
    },
    // Dynamic connections based on ranges
    getConnections: (props) => {
      const ranges = props.ranges || []
      const outputCount = ranges.length
      const minHeight = 4 * GRID_SIZE // Increased minimum height
      const totalHeight = Math.max(minHeight, (outputCount + 1) * GRID_SIZE) // More spacing
      
      // Single input on the left, centered
      const inputs = [{ 
        x: 0, 
        y: Math.round(totalHeight / 2 / GRID_SIZE) * GRID_SIZE 
      }]
      
      // Multiple outputs on the right, evenly spaced with proper margins
      const outputs = ranges.map((_, index) => {
        let y
        if (outputCount === 1) {
          y = totalHeight / 2
        } else {
          // Add top and bottom margins, distribute the rest evenly
          const topMargin = GRID_SIZE
          const bottomMargin = GRID_SIZE
          const availableHeight = totalHeight - topMargin - bottomMargin
          const spacing = availableHeight / (outputCount - 1)
          y = topMargin + index * spacing
        }
        // Snap to grid
        y = Math.round(y / GRID_SIZE) * GRID_SIZE
        return { x: 2 * GRID_SIZE, y }
      })
      
      return { inputs, outputs }
    },
    getDimensions: (props) => {
      const outputCount = (props.ranges || []).length
      const minHeight = 4 * GRID_SIZE // Increased minimum height
      const height = Math.max(minHeight, (outputCount + 1) * GRID_SIZE) // More spacing
      return {
        width: 2 * GRID_SIZE,
        height: height
      }
    }
  },
  
  'merger': {
    component: defineAsyncComponent(() => import('../components/MergerComponent.vue')),
    label: 'Merger',
    icon: 'pi pi-sign-in',
    category: 'wires',
    defaultProps: {
      outputBits: 8,
      ranges: [
        { start: 0, end: 1 },
        { start: 2, end: 3 },
        { start: 4, end: 5 },
        { start: 6, end: 7 }
      ],
      rotation: 0
    },
    // Dynamic connections based on ranges
    getConnections: (props) => {
      const ranges = props.ranges || []
      const inputCount = ranges.length
      const minHeight = 4 * GRID_SIZE // Increased minimum height
      const totalHeight = Math.max(minHeight, (inputCount + 1) * GRID_SIZE) // More spacing
      
      // Multiple inputs on the left, evenly spaced with proper margins
      const inputs = ranges.map((_, index) => {
        let y
        if (inputCount === 1) {
          y = totalHeight / 2
        } else {
          // Add top and bottom margins, distribute the rest evenly
          const topMargin = GRID_SIZE
          const bottomMargin = GRID_SIZE
          const availableHeight = totalHeight - topMargin - bottomMargin
          const spacing = availableHeight / (inputCount - 1)
          y = topMargin + index * spacing
        }
        // Snap to grid
        y = Math.round(y / GRID_SIZE) * GRID_SIZE
        return { x: 0, y }
      })
      
      // Single output on the right, centered
      const outputs = [{ 
        x: 2 * GRID_SIZE, 
        y: Math.round(totalHeight / 2 / GRID_SIZE) * GRID_SIZE 
      }]
      
      return { inputs, outputs }
    },
    getDimensions: (props) => {
      const inputCount = (props.ranges || []).length
      const minHeight = 4 * GRID_SIZE // Increased minimum height
      const height = Math.max(minHeight, (inputCount + 1) * GRID_SIZE) // More spacing
      return {
        width: 2 * GRID_SIZE,
        height: height
      }
    }
  },
  
  'schematic-component': {
    component: defineAsyncComponent(() => import('../components/SchematicComponent.vue')),
    label: 'Schematic Component',
    icon: 'pi pi-cube',
    category: 'components',
    defaultProps: {
      circuitId: '',
      label: 'Component'
    },
    // Dynamic connections based on the circuit it represents
    getConnections: (props, circuitManager) => {
      if (!props.circuitId || !circuitManager) {
        // Default single input/output if no circuit specified
        return {
          inputs: [{ x: 0, y: 0 }],
          outputs: [{ x: 90, y: 0 }] // Default width of 90px (6 grid units)
        }
      }
      
      const circuit = circuitManager.getCircuit(props.circuitId)
      if (!circuit) {
        return {
          inputs: [{ x: 0, y: 0 }],
          outputs: [{ x: 90, y: 0 }]
        }
      }
      
      // Analyze circuit to find inputs and outputs
      const inputs = []
      const outputs = []
      
      circuit.components.forEach(component => {
        if (component.type === 'input') {
          inputs.push({
            id: component.id,
            label: component.props?.label || 'IN',
            bits: component.props?.bits || 1,
            rotation: component.props?.rotation || 0
          })
        } else if (component.type === 'output') {
          outputs.push({
            id: component.id,
            label: component.props?.label || 'OUT',
            bits: component.props?.bits || 1,
            rotation: component.props?.rotation || 0
          })
        }
      })
      
      // Calculate grid-aligned dimensions
      const maxPorts = Math.max(inputs.length, outputs.length, 1)
      const minHeight = 4 * GRID_SIZE // 2 above + 2 below
      const heightForPorts = maxPorts * 2 * GRID_SIZE // 2 grid units per port
      const height = Math.max(minHeight, heightForPorts)
      const width = 6 * GRID_SIZE // 90px
      
      // Calculate connection positions
      const inputConnections = inputs.length === 0 ? 
        [{ x: 0, y: Math.round(height / 2 / GRID_SIZE) * GRID_SIZE }] :
        inputs.map((input, index) => {
          const topMargin = GRID_SIZE
          const availableHeight = height - 2 * topMargin
          const spacing = availableHeight / (inputs.length - 1)
          
          let y
          if (inputs.length === 1) {
            y = height / 2
          } else {
            y = topMargin + index * spacing
          }
          
          // Snap to nearest grid vertex
          y = Math.round(y / GRID_SIZE) * GRID_SIZE
          
          // Move connection points to different edges based on rotation
          const rotation = input.rotation || 0
          let connectionPoint = { x: 0, y }
          
          if (rotation === 90) {
            // Input rotated 90°: connection point moves to top edge
            connectionPoint = { x: width / 2, y: 0 }
          } else if (rotation === 180) {
            // Input rotated 180°: connection point moves to right edge  
            connectionPoint = { x: width, y: y }
          } else if (rotation === 270) {
            // Input rotated 270°: connection point moves to bottom edge
            connectionPoint = { x: width / 2, y: height }
          }
          // 0° rotation stays at left edge (default)
          
          return connectionPoint
        })
      
      const outputConnections = outputs.length === 0 ? 
        [{ x: width, y: Math.round(height / 2 / GRID_SIZE) * GRID_SIZE }] :
        outputs.map((output, index) => {
          const topMargin = GRID_SIZE
          const availableHeight = height - 2 * topMargin
          const spacing = availableHeight / (outputs.length - 1)
          
          let y
          if (outputs.length === 1) {
            y = height / 2
          } else {
            y = topMargin + index * spacing
          }
          
          // Snap to nearest grid vertex
          y = Math.round(y / GRID_SIZE) * GRID_SIZE
          
          // Move connection points to different edges based on rotation
          const rotation = output.rotation || 0
          let connectionPoint = { x: width, y }
          
          if (rotation === 90) {
            // Output rotated 90°: connection point moves to bottom edge
            connectionPoint = { x: width / 2, y: height }
          } else if (rotation === 180) {
            // Output rotated 180°: connection point moves to left edge
            connectionPoint = { x: 0, y: y }
          } else if (rotation === 270) {
            // Output rotated 270°: connection point moves to top edge
            connectionPoint = { x: width / 2, y: 0 }
          }
          // 0° rotation stays at right edge (default)
          
          return connectionPoint
        })
      
      return {
        inputs: inputConnections,
        outputs: outputConnections
      }
    }
  }
  
  // Future components can be added here:
  // 'not-gate': { ... },
  // 'xor-gate': { ... },
  // 'wire': { ... }
}

// Helper function to get component categories
export function getComponentCategories() {
  const categories = new Set()
  Object.values(componentRegistry).forEach(config => {
    if (config.category) {
      categories.add(config.category)
    }
  })
  return Array.from(categories)
}

// Helper function to get components by category
export function getComponentsByCategory(category) {
  return Object.entries(componentRegistry)
    .filter(([_, config]) => config.category === category)
    .reduce((acc, [type, config]) => {
      acc[type] = config
      return acc
    }, {})
}