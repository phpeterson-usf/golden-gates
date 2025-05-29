import { defineAsyncComponent } from 'vue'
import { GRID_SIZE } from './constants'

// Registry of all available circuit components
export const componentRegistry = {
  'and-gate': {
    component: defineAsyncComponent(() => import('../components/AndGate.vue')),
    label: 'Add Gate',
    icon: 'pi pi-plus',
    category: 'gates',
    defaultProps: {
      numInputs: 2
    },
    dimensions: {
      width: 90,
      height: 90
    },
    // Dynamic bounds based on numInputs
    getBounds: (props) => {
      const numInputs = props?.numInputs || 2
      const gateHeight = (numInputs - 1) * GRID_SIZE
      const padding = 15
      return {
        x: 0,
        y: -padding,
        width: 90,
        height: gateHeight + (2 * padding)
      }
    },
    // Dynamic center based on numInputs
    getCenter: (props) => {
      const numInputs = props?.numInputs || 2
      const gateHeight = (numInputs - 1) * GRID_SIZE
      return {
        x: 45,
        y: gateHeight / 2
      }
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: 0,
      y: -15,
      width: 90,
      height: 90
    },
    // Visual center relative to the component's x,y position
    center: {
      x: 45,
      y: 30
    },
    // Dynamic connections based on numInputs
    getConnections: (props) => {
      const numInputs = props?.numInputs || 2
      const gateHeight = (numInputs - 1) * GRID_SIZE
      const inputs = []
      for (let i = 0; i < numInputs; i++) {
        inputs.push({ name: String(i), x: 0, y: i * GRID_SIZE })
      }
      return {
        inputs,
        outputs: [
          { name: '0', x: 90, y: gateHeight / 2 }
        ]
      }
    },
    connections: {
      inputs: [
        { name: '0', x: 0, y: 0 },
        { name: '1', x: 0, y: 60 }
      ],
      outputs: [
        { name: '0', x: 90, y: 30 }
      ]
    }
  },
  
  'input': {
    component: defineAsyncComponent(() => import('../components/InputNode.vue')),
    label: 'Add Input',
    icon: 'pi pi-circle',
    category: 'io',
    defaultProps: {
      value: 0,
      bits: 1,
      gridSize: GRID_SIZE
    },
    dimensions: {
      width: GRID_SIZE,
      height: GRID_SIZE
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: 0,
      y: -15,
      width: GRID_SIZE,
      height: GRID_SIZE
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
      gridSize: GRID_SIZE
    },
    dimensions: {
      width: GRID_SIZE,
      height: GRID_SIZE
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: 0,
      y: -15,
      width: GRID_SIZE,
      height: GRID_SIZE
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
  }
  
  // Future components can be added here:
  // 'or-gate': { ... },
  // 'not-gate': { ... },
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