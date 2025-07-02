// Gate definitions for all logic gates
// Each definition includes visual properties and code generation logic

import { GRID_SIZE } from '../utils/constants'

export const gateDefinitions = {
  'and': {
    label: 'AND Gate',
    logicClass: 'And',
    pythonModule: 'logic',
    // SVG path generator for AND gate shape (MIL-STD-806B)
    getSvgPath: (h, padding) => {
      // Fixed-size AND gate: rectangle left half + semicircle right half
      // Width: 3 grid units, Height: 2 grid units
      const radius = GRID_SIZE  // Half of the height for the semicircle
      return `M 0 ${-padding} L ${GRID_SIZE * 2} ${-padding} A ${radius} ${radius} 0 0 1 ${GRID_SIZE * 2} ${h + padding} L 0 ${h + padding} L 0 ${-padding} Z`
    },
    outputOffset: -10  // Move output 10px to the right to align with stroke
  },
  
  'or': {
    label: 'OR Gate',
    logicClass: 'Or',
    pythonModule: 'logic',
    // SVG path generator for OR gate shape (MIL-STD-806B)
    getSvgPath: (h, padding) => {
      // Fixed-size OR gate: curved input side, pointed output
      // Width: 4 grid units, Height: 2 grid units
      const centerY = h / 2
      return `
        M 0 ${-padding}
        Q 12 ${-padding}, 12 ${-padding}
        Q ${GRID_SIZE * 3} ${centerY - GRID_SIZE}, ${GRID_SIZE * 4} ${centerY}
        Q ${GRID_SIZE * 3} ${centerY + GRID_SIZE}, 12 ${h + padding}
        Q 12 ${h + padding}, 0 ${h + padding}
        Q 10 ${centerY}, 0 ${-padding}
        Z
      `
    },
    outputOffset: -GRID_SIZE  // Move output one grid unit to the right (60px total) to match the gate's point
  },
  
  // Future gates can be added here
  'xor': {
    label: 'XOR Gate',
    logicClass: 'Xor',
    pythonModule: 'logic',
    getSvgPath: (h, padding) => {
      // XOR gate with double curved input lines
      return `
        M 0 ${-padding}
        Q 15 ${-padding}, 15 ${-padding}
        Q 60 ${h/2 - 20}, 90 ${h/2}
        Q 60 ${h/2 + 20}, 15 ${h + padding}
        Q 15 ${h + padding}, 0 ${h + padding}
        Q 10 ${h/2}, 0 ${-padding}
        Z
        M -10 ${-padding}
        Q -5 ${h/2}, -10 ${h + padding}
      `
    }
  },
  
  'nand': {
    label: 'NAND Gate',
    logicClass: 'Nand',
    pythonModule: 'logic',
    getSvgPath: (h, padding) => {
      // AND gate shape with bubble at output
      return `
        M 0 ${-padding} 
        L 60 ${-padding} 
        A 30 30 0 0 1 60 ${h + padding} 
        L 0 ${h + padding} 
        L 0 ${-padding} 
        Z
        M 90 ${h/2}
        A 5 5 0 1 1 80 ${h/2}
        A 5 5 0 1 1 90 ${h/2}
      `
    },
    outputOffset: 10 // Account for the bubble
  },
  
  'nor': {
    label: 'NOR Gate',
    logicClass: 'Nor',
    pythonModule: 'logic',
    // SVG path generator for NOR gate shape (MIL-STD-806B)
    getSvgPath: (h, padding) => {
      // Fixed-size NOR gate: OR gate shape with negation circle at output
      // Width: 4 grid units (60px) for OR shape + 1 grid unit (15px) for negation circle = 75px total
      const centerY = h / 2
      return `
        M 0 ${-padding}
        Q 12 ${-padding}, 12 ${-padding}
        Q ${GRID_SIZE * 3} ${centerY - GRID_SIZE}, ${GRID_SIZE * 4} ${centerY}
        Q ${GRID_SIZE * 3} ${centerY + GRID_SIZE}, 12 ${h + padding}
        Q 12 ${h + padding}, 0 ${h + padding}
        Q 10 ${centerY}, 0 ${-padding}
        Z
        M ${GRID_SIZE * 5} ${centerY}
        A 5 5 0 1 1 ${GRID_SIZE * 4} ${centerY}
        A 5 5 0 1 1 ${GRID_SIZE * 5} ${centerY}
      `
    },
    outputOffset: -GRID_SIZE * 2  // Move output to 5 grid units (75px) to align with right edge of negation circle
  }
}

// Helper function to get a gate definition
export function getGateDefinition(gateType) {
  return gateDefinitions[gateType] || null
}

// Helper function to generate Python code for a gate
export function generateGateCode(gateType, varName, props) {
  const definition = gateDefinitions[gateType]
  if (!definition) return null
  
  const params = []
  
  // Add num_inputs parameter if not default
  if (props.numInputs && props.numInputs !== 2) {
    params.push(`num_inputs=${props.numInputs}`)
  }
  
  // Add bits parameter if specified and not default
  if (props.bits && props.bits !== 1) {
    params.push(`bits=${props.bits}`)
  }
  
  // Add inverted_inputs parameter if specified and not empty
  if (props.invertedInputs && props.invertedInputs.length > 0) {
    params.push(`inverted_inputs=[${props.invertedInputs.join(', ')}]`)
  }
  
  // Add label parameter if specified
  if (props.label && props.label !== definition.label) {
    params.push(`label="${props.label}"`)
  }
  
  const paramsStr = params.length > 0 ? params.join(', ') : ''
  return `${varName} = ${definition.pythonModule}.${definition.logicClass}(${paramsStr})`
}