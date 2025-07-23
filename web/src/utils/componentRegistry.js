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

  input: {
    component: defineAsyncComponent(() => import('../components/InputNode.vue')),
    label: 'Add Input',
    icon: 'pi pi-circle',
    category: 'io',
    defaultProps: {
      value: 0,
      base: 10,
      bits: 1,
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE,
      height: GRID_SIZE
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: -10, // Extended left to accommodate longer values
      y: -30, // Extended up to include value text
      width: GRID_SIZE + 20, // Extra width for value display
      height: 45 // Height to include value text above
    },
    // Visual center relative to the component's x,y position
    center: {
      x: GRID_SIZE / 2,
      y: 0
    },
    connections: {
      outputs: [
        { name: '0', x: 1, y: 0 } // 1 grid unit right, 0 units down
      ]
    },
    // Special handling for input nodes
    onCreate: (instance, index) => {
      instance.props.label = String.fromCharCode(65 + index) // A, B, C, etc.
    }
  },

  output: {
    component: defineAsyncComponent(() => import('../components/OutputNode.vue')),
    label: 'Add Output',
    icon: 'pi pi-circle-fill',
    category: 'io',
    defaultProps: {
      value: 0,
      bits: 1,
      base: 10,
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE,
      height: GRID_SIZE
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: -10, // Extended left to accommodate longer values
      y: -30, // Extended up to include value text
      width: GRID_SIZE + 20, // Extra width for value display
      height: 45 // Height to include value text above
    },
    // Visual center relative to the component's x,y position
    center: {
      x: GRID_SIZE / 2,
      y: 0
    },
    connections: {
      inputs: [
        { name: '0', x: 0, y: 0 } // At component origin (already in grid units)
      ]
    },
    // Special handling for output nodes
    onCreate: (instance, index) => {
      instance.props.label = String.fromCharCode(82 + index) // R, S, T, etc.
    }
  },

  constant: {
    component: defineAsyncComponent(() => import('../components/ConstantNode.vue')),
    label: 'Add Constant',
    icon: 'pi pi-stop-circle',
    category: 'io',
    defaultProps: {
      value: 0,
      base: 10,
      bits: 1,
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE,
      height: GRID_SIZE
    },
    // Visual bounds relative to the component's x,y position
    bounds: {
      x: -10, // Extended left to accommodate longer values
      y: -30, // Extended up to include value text
      width: GRID_SIZE + 20, // Extra width for value display
      height: 45 // Height to include value text above
    },
    // Visual center relative to the component's x,y position
    center: {
      x: GRID_SIZE / 2,
      y: 0
    },
    connections: {
      outputs: [
        { name: '0', x: 1, y: 0 } // 1 grid unit right, 0 units down
      ]
    },
    // Special handling for constant nodes
    onCreate: (instance, index) => {
      instance.props.label = `C${index}` // C0, C1, C2, etc.
    }
  },

  splitter: {
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
    getConnections: props => {
      const ranges = props.ranges || []
      const outputCount = ranges.length
      const minHeight = 4 // Minimum height in grid units
      const totalHeight = Math.max(minHeight, outputCount + 1) // More spacing in grid units

      // Single input on the left, centered
      const inputs = [
        {
          name: '0',
          x: 0,
          y: Math.round(totalHeight / 2) // In grid units
        }
      ]

      // Multiple outputs on the right, evenly spaced with proper margins
      const outputs = ranges.map((_, index) => {
        let y
        if (outputCount === 1) {
          y = totalHeight / 2
        } else {
          // Add top and bottom margins, distribute the rest evenly
          const topMargin = 1 // 1 grid unit margin
          const bottomMargin = 1 // 1 grid unit margin
          const availableHeight = totalHeight - topMargin - bottomMargin
          const spacing = availableHeight / (outputCount - 1)
          y = topMargin + index * spacing
        }
        // Snap to grid
        y = Math.round(y)
        return {
          name: index.toString(),
          x: 2, // 2 grid units right
          y
        }
      })

      return { inputs, outputs }
    },
    getPythonProps: props => ({
      label: props.label,
      bits: props.inputBits,
      merges: (props.ranges || []).map(r => [r.start, r.end])
    }),
    getDimensions: props => {
      const outputCount = (props.ranges || []).length
      const minHeight = 4 * GRID_SIZE // Increased minimum height
      const height = Math.max(minHeight, (outputCount + 1) * GRID_SIZE) // More spacing
      return {
        width: 2 * GRID_SIZE,
        height: height
      }
    }
  },

  merger: {
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
    getConnections: props => {
      const ranges = props.ranges || []
      const inputCount = ranges.length
      const minHeight = 4 // Minimum height in grid units
      const totalHeight = Math.max(minHeight, inputCount + 1) // More spacing in grid units

      // Multiple inputs on the left, evenly spaced with proper margins
      const inputs = ranges.map((_, index) => {
        let y
        if (inputCount === 1) {
          y = totalHeight / 2
        } else {
          // Add top and bottom margins, distribute the rest evenly
          const topMargin = 1 // 1 grid unit margin
          const bottomMargin = 1 // 1 grid unit margin
          const availableHeight = totalHeight - topMargin - bottomMargin
          const spacing = availableHeight / (inputCount - 1)
          y = topMargin + index * spacing
        }
        // Snap to grid
        y = Math.round(y)
        return {
          name: index.toString(),
          x: 0,
          y
        }
      })

      // Single output on the right, centered
      const outputs = [
        {
          name: '0',
          x: 2, // 2 grid units right
          y: Math.round(totalHeight / 2) // In grid units
        }
      ]

      return { inputs, outputs }
    },
    getPythonProps: props => ({
      label: props.label,
      bits: props.outputBits,
      merges: (props.ranges || []).map(r => [r.start, r.end])
    }),
    getDimensions: props => {
      const inputCount = (props.ranges || []).length
      const minHeight = 4 * GRID_SIZE // Increased minimum height
      const height = Math.max(minHeight, (inputCount + 1) * GRID_SIZE) // More spacing
      return {
        width: 2 * GRID_SIZE,
        height: height
      }
    }
  },

  multiplexer: {
    component: defineAsyncComponent(() => import('../components/MultiplexerNode.vue')),
    label: 'Multiplexer',
    icon: 'pi pi-share-alt',
    category: 'components',
    defaultProps: {
      numInputs: 4,
      bits: 1,
      label: '',
      selectorPosition: 'bottom',
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE * 2,
      height: GRID_SIZE * 3
    },
    // Dynamic connections based on numInputs
    getConnections: props => {
      const numInputs = props.numInputs || 4

      // Calculate height same as Vue component
      const inputSpacing = 2 // 2 grid units between inputs
      const baseHeight = (numInputs - 1) * inputSpacing
      const minHeight = 4 // Minimum height in grid units
      const totalHeight = Math.max(baseHeight + 2, minHeight) // Add 1 grid unit margin top/bottom

      // Input connections on the left - match Vue component getInputY method
      const inputs = []
      const margin = 1 // 1 grid unit margin from top
      for (let i = 0; i < numInputs; i++) {
        inputs.push({
          name: i.toString(),
          x: 0,
          y: margin + i * inputSpacing
        })
      }

      // Selector input (special port named 'sel')
      inputs.push({
        name: 'sel',
        x: 1, // Center of 2-unit wide component
        y: props.selectorPosition === 'top' ? 0 : totalHeight
      })

      // Single output on the right
      const outputs = [
        {
          name: '0',
          x: 2,
          y: Math.round(totalHeight / 2)
        }
      ]

      return { inputs, outputs }
    },
    getDimensions: props => {
      const numInputs = props.numInputs || 4

      // Calculate height same as Vue component and getConnections
      const inputSpacing = 2 // 2 grid units between inputs
      const baseHeight = (numInputs - 1) * inputSpacing
      const minHeight = 4 // Minimum height in grid units
      const totalHeight = Math.max(baseHeight + 2, minHeight) // Add 1 grid unit margin top/bottom

      return {
        width: 2 * GRID_SIZE,
        height: totalHeight * GRID_SIZE
      }
    },
    // Special handling for multiplexer creation
    onCreate: (instance, index) => {
      instance.props.label = instance.props.label || `MUX${index}`
    }
  },

  decoder: {
    component: defineAsyncComponent(() => import('../components/Decoder.vue')),
    label: 'Decoder',
    icon: 'pi pi-sitemap',
    category: 'components',
    requiresNamedPorts: true,
    defaultProps: {
      numOutputs: 4,
      label: 'DEC',
      rotation: 0
    },
    getConnections: props => {
      const numOutputs = props.numOutputs || 4

      // Single selector input at top center
      const inputs = [
        {
          name: 'sel',
          x: 2, // Center of 4-unit wide component
          y: 0
        }
      ]

      // Output connections on the right - match Vue component getOutputY method
      const outputs = []
      const firstOutputY = 1 // First output at 1 grid unit from top
      for (let i = 0; i < numOutputs; i++) {
        outputs.push({
          name: i.toString(),
          x: 4,
          y: firstOutputY + i * 2 // 2 grid units between outputs
        })
      }

      return { inputs, outputs }
    },
    getDimensions: props => {
      const numOutputs = props.numOutputs || 4
      const outputSpacing = 2
      const baseHeight = (numOutputs - 1) * outputSpacing
      const totalHeight = Math.max(baseHeight + 2, 4)

      return {
        width: GRID_SIZE * 4,
        height: GRID_SIZE * totalHeight
      }
    },
    // Special handling for decoder creation
    onCreate: (instance, index) => {
      instance.props.label = instance.props.label || `DEC${index}`
    }
  },

  register: {
    component: defineAsyncComponent(() => import('../components/Register.vue')),
    label: 'Register',
    icon: 'pi pi-stop',
    category: 'memory',
    requiresNamedPorts: true,
    defaultProps: {
      bits: 1,
      label: 'REG',
      rotation: 0
    },
    dimensions: {
      width: GRID_SIZE * 4,
      height: GRID_SIZE * 6
    },
    connections: {
      inputs: [
        { name: 'D', x: 0, y: 1 },    // Data input (top)
        { name: 'CLK', x: 0, y: 3 },  // Clock input (middle)
        { name: 'en', x: 0, y: 5 }    // Enable input (bottom)
      ],
      outputs: [
        { name: 'Q', x: 4, y: 3 }     // Output (right, center)
      ]
    },
    onCreate: (instance, index) => {
      instance.props.label = `REG${index}`
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
          outputs: [{ x: 6, y: 0 }] // Default width of 6 grid units
        }
      }

      const circuit = circuitManager.getCircuit(props.circuitId)
      if (!circuit) {
        return {
          inputs: [{ x: 0, y: 0 }],
          outputs: [{ x: 6, y: 0 }] // 6 grid units wide
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
      const minHeight = 4 // 2 above + 2 below (in grid units)
      const heightForPorts = maxPorts * 2 // 2 grid units per port
      const height = Math.max(minHeight, heightForPorts)
      const width = 6 // 6 grid units wide

      // Calculate connection positions
      const inputConnections =
        inputs.length === 0
          ? [{ x: 0, y: Math.round(height / 2) }]
          : inputs.map((input, index) => {
              let y
              if (inputs.length === 1) {
                // Single input at center
                y = height / 2
              } else {
                // Multiple inputs: use consistent 2 grid unit spacing
                const topMargin = 1 // 1 grid unit from top
                const inputSpacing = 2 // 2 grid units per input
                y = topMargin + index * inputSpacing
              }

              // Snap to nearest grid vertex
              y = Math.round(y)

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

      const outputConnections =
        outputs.length === 0
          ? [{ x: width, y: Math.round(height / 2) }]
          : outputs.map((output, index) => {
              let y
              if (outputs.length === 1) {
                // Single output at center
                y = height / 2
              } else {
                // Multiple outputs: use consistent 2 grid unit spacing
                const topMargin = 1 // 1 grid unit from top
                const outputSpacing = 2 // 2 grid units per output
                y = topMargin + index * outputSpacing
              }

              // Snap to nearest grid vertex
              y = Math.round(y)

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
