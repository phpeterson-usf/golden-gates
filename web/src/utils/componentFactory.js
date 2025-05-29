import { defineAsyncComponent } from 'vue'
import { GRID_SIZE } from './constants'
import { getGateDefinition } from '../config/gateDefinitions'

// Shared functions for standard gate bounds and connections
function standardGateBounds(props) {
  const numInputs = props?.numInputs || 2
  const gateHeight = (numInputs - 1) * GRID_SIZE
  const padding = 15
  return {
    x: 0,
    y: -padding,
    width: 90,
    height: gateHeight + (2 * padding)
  }
}

function standardGateCenter(props) {
  const numInputs = props?.numInputs || 2
  const gateHeight = (numInputs - 1) * GRID_SIZE
  return {
    x: 45,
    y: gateHeight / 2
  }
}

function standardGateConnections(props) {
  const numInputs = props?.numInputs || 2
  const gateHeight = (numInputs - 1) * GRID_SIZE
  const inputs = []
  for (let i = 0; i < numInputs; i++) {
    inputs.push({ name: String(i), x: 0, y: i * GRID_SIZE })
  }
  
  // Get gate definition to check for output offset
  const gateType = props?.gateType
  const definition = gateType ? getGateDefinition(gateType) : null
  const outputX = 90 - (definition?.outputOffset || 0)
  
  return {
    inputs,
    outputs: [
      { name: '0', x: outputX, y: gateHeight / 2 }
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
      label: ''
    },
    dimensions: {
      width: 90,
      height: 90
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
      y: -15,
      width: 90,
      height: 90
    },
    // Static center for default 2-input gate
    center: {
      x: 45,
      y: 30
    },
    // Static connections for default 2-input gate
    connections: {
      inputs: [
        { name: '0', x: 0, y: 0 },
        { name: '1', x: 0, y: 60 }
      ],
      outputs: [
        { name: '0', x: 90 - (definition.outputOffset || 0), y: 30 }
      ]
    }
  }
}

// Note: I/O components (Input, Output) still use their original structure
// since they have unique behaviors and don't benefit from the same abstraction as gates