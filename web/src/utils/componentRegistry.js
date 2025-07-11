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
            bits: component.props?.bits || 1
          })
        } else if (component.type === 'output') {
          outputs.push({
            id: component.id,
            label: component.props?.label || 'OUT',
            bits: component.props?.bits || 1
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
          
          return { x: 0, y }
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
          
          return { x: width, y }
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