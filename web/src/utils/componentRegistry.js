import { defineAsyncComponent } from 'vue'
import { GRID_SIZE } from './constants'
import { createGateRegistryEntry } from './componentFactory'
import { gateDefinitions } from '../config/gateDefinitions'

// Registry of all available circuit components
export const componentRegistry = {
  // Logic gates - generated from gateDefinitions
  'and-gate': createGateRegistryEntry('and', gateDefinitions.and),
  'or-gate': createGateRegistryEntry('or', gateDefinitions.or),
  
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