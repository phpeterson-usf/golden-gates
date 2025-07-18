import { defineAsyncComponent } from 'vue'
import { GRID_SIZE } from './constants'
import { getGateDefinition } from '../config/gateDefinitions'

// Shared functions for standard gate bounds and connections
function standardGateBounds(props) {
  const numInputs = props?.numInputs || 2
  const totalHeight = numInputs === 1 ? 2 : (numInputs - 1) * 2 // In grid units
  const padding = 10 // Still in pixels for visual bounds

  // All gates use fixed width of 3 grid units
  return {
    x: 0,
    y: -padding,
    width: GRID_SIZE * 3, // 45px (still in pixels for visual bounds)
    height: totalHeight * GRID_SIZE + 2 * padding // Convert to pixels
  }
}

function standardGateCenter(props) {
  const numInputs = props?.numInputs || 2
  const totalHeight = numInputs === 1 ? 2 : (numInputs - 1) * 2 // In grid units

  // All gates centered at 1.5 grid units horizontally
  return {
    x: GRID_SIZE * 1.5, // 22.5px (center of 45px width) - still in pixels for visual center
    y: (totalHeight * GRID_SIZE) / 2 // Convert to pixels
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
      const x = isInverted ? pos.x - 1 : pos.x // Move left 1 grid unit for inverted inputs
      inputs.push({ name: String(i), x, y: pos.y })
    })
  } else {
    // Default: All gates have inputs on alternating grid vertices
    // For inverted inputs, connection point is moved left to accommodate inversion circle
    for (let i = 0; i < numInputs; i++) {
      const isInverted = invertedInputs.includes(i)
      const x = isInverted ? -1 : 0 // Move connection point left 1 grid unit for inverted inputs
      inputs.push({ name: String(i), x, y: i * 2 }) // 2 grid units spacing
    }
  }

  // Get output offset (convert from pixels to grid units)
  const outputOffsetPixels = definition?.outputOffset || 0
  const outputOffset = outputOffsetPixels / GRID_SIZE

  // Calculate output Y position based on number of inputs
  let outputY
  if (numInputs === 1) {
    outputY = 1 // 1 grid unit - centered for single input
  } else if (numInputs === 2) {
    outputY = 1 // 1 grid unit - between inputs at 0 and 2
  } else {
    // For more inputs, output is at center of total height
    const totalHeight = (numInputs - 1) * 2 // 2 grid units spacing
    outputY = totalHeight / 2
  }

  // All gates output at 3 grid units horizontally
  return {
    inputs,
    outputs: [
      { name: '0', x: 3 - outputOffset, y: outputY } // 3 grid units right minus any offset
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
      numInputs: definition.defaultNumInputs || 2, // Use gate-specific default if provided
      bits: 1,
      label: '',
      rotation: 0,
      invertedInputs: []
    },
    dimensions: {
      width: definition.dimensions?.width || GRID_SIZE * 3, // Use custom width if defined
      height: definition.dimensions?.height || GRID_SIZE * 3 // Use custom height if defined
    },
    // Dynamic bounds based on numInputs
    getBounds: definition.getBounds || standardGateBounds,
    // Dynamic center based on numInputs
    getCenter: definition.getCenter || standardGateCenter,
    // Dynamic connections based on numInputs
    getConnections: props => standardGateConnections({ ...props, gateType }),
    // Static bounds for default 2-input gate
    bounds: definition.bounds || {
      x: 0,
      y: -10,
      width: GRID_SIZE * 3, // 45px
      height: GRID_SIZE * 2 + 20 // 50px (30px gate + 20px padding)
    },
    // Static center for default 2-input gate
    center: definition.center || {
      x: GRID_SIZE * 1.5, // 22.5px
      y: GRID_SIZE // 15px
    },
    // Static connections for default gate
    connections:
      definition.defaultNumInputs === 1
        ? {
            // Single input for NOT gate
            inputs: [
              { name: '0', x: 0, y: 1 } // 1 grid unit - centered
            ],
            outputs: [
              { name: '0', x: 3 - (definition.outputOffset || 0) / GRID_SIZE, y: 1 } // 3 grid units right, 1 down
            ]
          }
        : {
            // Default 2-input connections
            inputs: [
              { name: '0', x: 0, y: 0 },
              { name: '1', x: 0, y: 2 } // 2 grid units down
            ],
            outputs: [
              { name: '0', x: 3 - (definition.outputOffset || 0) / GRID_SIZE, y: 1 } // 3 grid units right, 1 down
            ]
          }
  }
}

// Note: I/O components (Input, Output) still use their original structure
// since they have unique behaviors and don't benefit from the same abstraction as gates
