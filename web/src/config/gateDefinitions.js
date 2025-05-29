// Gate definitions for all logic gates
// Each definition includes visual properties and code generation logic

export const gateDefinitions = {
  'and': {
    label: 'AND Gate',
    logicClass: 'And',
    pythonModule: 'logic',
    // SVG path generator for AND gate shape (MIL-STD-806B)
    getSvgPath: (h, padding) => {
      // Rectangle left half + semicircle right half
      return `M 0 ${-padding} L 60 ${-padding} A 30 30 0 0 1 60 ${h + padding} L 0 ${h + padding} L 0 ${-padding} Z`
    }
  },
  
  'or': {
    label: 'OR Gate',
    logicClass: 'Or',
    pythonModule: 'logic',
    // SVG path generator for OR gate shape (MIL-STD-806B)
    getSvgPath: (h, padding) => {
      // Curved input side, pointed output
      return `
        M 0 ${-padding}
        Q 15 ${-padding}, 15 ${-padding}
        Q 60 ${h/2 - 20}, 90 ${h/2}
        Q 60 ${h/2 + 20}, 15 ${h + padding}
        Q 15 ${h + padding}, 0 ${h + padding}
        Q 10 ${h/2}, 0 ${-padding}
        Z
      `
    }
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
    getSvgPath: (h, padding) => {
      // OR gate shape with bubble at output
      return `
        M 0 ${-padding}
        Q 15 ${-padding}, 15 ${-padding}
        Q 60 ${h/2 - 20}, 90 ${h/2}
        Q 60 ${h/2 + 20}, 15 ${h + padding}
        Q 15 ${h + padding}, 0 ${h + padding}
        Q 10 ${h/2}, 0 ${-padding}
        Z
        M 90 ${h/2}
        A 5 5 0 1 1 80 ${h/2}
        A 5 5 0 1 1 90 ${h/2}
      `
    },
    outputOffset: 10 // Account for the bubble
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
  
  // Add label parameter if specified
  if (props.label && props.label !== definition.label) {
    params.push(`label="${props.label}"`)
  }
  
  const paramsStr = params.length > 0 ? params.join(', ') : ''
  return `${varName} = ${definition.pythonModule}.${definition.logicClass}(${paramsStr})`
}