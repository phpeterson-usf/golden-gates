import { defineAsyncComponent } from 'vue'
import { GRID_SIZE } from './constants'
import { getGateDefinition } from '../config/gateDefinitions'

// Shared functions for standard gate bounds and connections
function standardGateBounds(props) {
  const numInputs = props?.numInputs || 2
  const totalHeight = numInputs === 1 ? GRID_SIZE * 2 : (numInputs - 1) * GRID_SIZE * 2
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
  const totalHeight = numInputs === 1 ? GRID_SIZE * 2 : (numInputs - 1) * GRID_SIZE * 2
  
  // All gates centered at 1.5 grid units horizontally
  return {
    x: GRID_SIZE * 1.5,  // 22.5px (center of 45px width)
    y: totalHeight / 2
  }
}

function standardGateConnections(props) {
  const numInputs = props?.numInputs || 2
  const invertedInputs = props?.invertedInputs || []
  const gateType = props?.gateType
  const definition = gateType ? getGateDefinition(gateType) : null
  const inputs = []
  
  // Check if gate has custom input positions
  if (definition && definition.getInputPositions) {
    const positions = definition.getInputPositions(numInputs)
    positions.forEach((pos, i) => {
      const isInverted = invertedInputs.includes(i)
      const x = isInverted ? pos.x - 15 : pos.x
      inputs.push({ name: String(i), x, y: pos.y })
    })
  } else {
    // Default: All gates have inputs on alternating grid vertices
    // For inverted inputs, connection point is moved left to accommodate inversion circle
    for (let i = 0; i < numInputs; i++) {
      const isInverted = invertedInputs.includes(i)
      const x = isInverted ? -15 : 0  // Move connection point left for inverted inputs
      inputs.push({ name: String(i), x, y: i * GRID_SIZE * 2 })
    }
  }
  
  // Get output offset
  const outputOffset = definition?.outputOffset || 0
  
  // Calculate output Y position based on number of inputs
  let outputY
  if (numInputs === 1) {
    outputY = GRID_SIZE  // 15px - centered for single input
  } else if (numInputs === 2) {
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
      numInputs: definition.defaultNumInputs || 2,  // Use gate-specific default if provided
      bits: 1,
      label: '',
      rotation: 0
    },
    dimensions: {
      width: definition.dimensions?.width || GRID_SIZE * 3,  // Use custom width if defined
      height: definition.dimensions?.height || GRID_SIZE * 3  // Use custom height if defined
    },
    // Dynamic bounds based on numInputs
    getBounds: definition.getBounds || standardGateBounds,
    // Dynamic center based on numInputs
    getCenter: definition.getCenter || standardGateCenter,
    // Dynamic connections based on numInputs
    getConnections: (props) => standardGateConnections({ ...props, gateType }),
    // Static bounds for default 2-input gate
    bounds: definition.bounds || {
      x: 0,
      y: -10,
      width: GRID_SIZE * 3,  // 45px
      height: GRID_SIZE * 2 + 20  // 50px (30px gate + 20px padding)
    },
    // Static center for default 2-input gate
    center: definition.center || {
      x: GRID_SIZE * 1.5,  // 22.5px
      y: GRID_SIZE         // 15px
    },
    // Static connections for default gate
    connections: definition.defaultNumInputs === 1 ? {
      // Single input for NOT gate
      inputs: [
        { name: '0', x: 0, y: GRID_SIZE }  // 15px - centered
      ],
      outputs: [
        { name: '0', x: GRID_SIZE * 3 - (definition.outputOffset || 0), y: GRID_SIZE }  // 45px, 15px
      ]
    } : {
      // Default 2-input connections
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