import { defineAsyncComponent } from 'vue'
import { GRID_SIZE } from './constants'
import { getGateDefinition } from '../config/gateDefinitions'

// Shared functions for standard gate bounds and connections
function standardGateBounds(props) {
  const numInputs = props?.numInputs || 2
  const totalHeight = (numInputs - 1) * GRID_SIZE * 2
  const padding = 10
  
  // All gates use fixed width of 3 grid units
  return {
    x: 0,
    y: -padding,
    width: GRID_SIZE * 3,  // 45px
    height: totalHeight + (2 * padding)
  }
}

function standardGateCenter(props) {
  const numInputs = props?.numInputs || 2
  const totalHeight = (numInputs - 1) * GRID_SIZE * 2
  
  // All gates centered at 1.5 grid units horizontally
  return {
    x: GRID_SIZE * 1.5,  // 22.5px (center of 45px width)
    y: totalHeight / 2
  }
}

function standardGateConnections(props) {
  const numInputs = props?.numInputs || 2
  const inputs = []
  
  // All gates have inputs on alternating grid vertices
  for (let i = 0; i < numInputs; i++) {
    inputs.push({ name: String(i), x: 0, y: i * GRID_SIZE * 2 })
  }
  
  // Get gate definition to check for output offset
  const gateType = props?.gateType
  const definition = gateType ? getGateDefinition(gateType) : null
  const outputOffset = definition?.outputOffset || 0
  
  // Calculate output Y position based on number of inputs
  let outputY
  if (numInputs === 2) {
    outputY = GRID_SIZE  // 15px - between inputs at 0 and 30
  } else {
    // For more inputs, output is at center of total height
    const totalHeight = (numInputs - 1) * GRID_SIZE * 2
    outputY = totalHeight / 2
  }
  
  // All gates output at 3 grid units horizontally
  return {
    inputs,
    outputs: [
      { name: '0', x: GRID_SIZE * 3 - outputOffset, y: outputY }
    ]
  }
}

// Factory function to create gate registry entries
export function createGateRegistryEntry(gateType, definition) {
  return {
    component: defineAsyncComponent(() => import('../components/LogicGate.vue')),
    label: definition.label,
    icon: 'pi pi-fw pi-sitemap',
    category: 'gates',
    defaultProps: {
      gateType,
      numInputs: 2,
      bits: 1,
      label: '',
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE * 3,  // 60px
      height: GRID_SIZE * 3  // 60px for default 2-input gate space
    },
    // Dynamic bounds based on numInputs
    getBounds: standardGateBounds,
    // Dynamic center based on numInputs
    getCenter: standardGateCenter,
    // Dynamic connections based on numInputs
    getConnections: (props) => standardGateConnections({ ...props, gateType }),
    // Static bounds for default 2-input gate
    bounds: {
      x: 0,
      y: -10,
      width: GRID_SIZE * 3,  // 45px
      height: GRID_SIZE * 2 + 20  // 50px (30px gate + 20px padding)
    },
    // Static center for default 2-input gate
    center: {
      x: GRID_SIZE * 1.5,  // 22.5px
      y: GRID_SIZE         // 15px
    },
    // Static connections for default 2-input gate
    connections: {
      inputs: [
        { name: '0', x: 0, y: 0 },
        { name: '1', x: 0, y: GRID_SIZE * 2 }  // 30px
      ],
      outputs: [
        { name: '0', x: GRID_SIZE * 3 - (definition.outputOffset || 0), y: GRID_SIZE }  // 45px, 15px
      ]
    }
  }
}

// Note: I/O components (Input, Output) still use their original structure
// since they have unique behaviors and don't benefit from the same abstraction as gates