// Configuration for component properties shown in the inspector
// Each entry defines the properties available for a component type

// Common property definitions that can be reused across components
const commonProperties = {
  label: {
    name: 'label',
    type: 'text',
    label: 'Label'
  },
  bits: {
    name: 'bits',
    type: 'number',
    label: 'Bits',
    default: 1,
    min: 1,
    max: 32,
    showButtons: true
  },
  rotation: {
    name: 'rotation',
    type: 'rotation-selector',
    label: 'Rotation',
    default: 0
  },
  numInputs: {
    name: 'numInputs',
    type: 'number',
    label: 'Number of Inputs',
    default: 2,
    min: 2,
    max: 8,
    showButtons: true
  },
  invertedInputs: {
    name: 'invertedInputs',
    type: 'inverted-inputs-selector',
    label: 'Inverted Inputs',
    default: []
  }
}

export const componentPropertySchema = {
  // Input node properties
  input: {
    title: 'Input Properties',
    properties: [
      { ...commonProperties.label, default: 'IN' },
      {
        name: 'base',
        type: 'number',
        label: 'Base',
        default: 10,
        hidden: true // Hidden from inspector, managed internally
      },
      commonProperties.bits,
      {
        name: 'value',
        type: 'number',
        label: 'Value',
        default: 0,
        min: 0,
        maxFormula: props => Math.pow(2, props.bits || 1) - 1,
        showButtons: true
      },
      commonProperties.rotation
    ]
  },

  // Output node properties
  output: {
    title: 'Output Properties',
    properties: [
      { ...commonProperties.label, default: 'OUT' },
      commonProperties.bits,
      {
        name: 'base',
        type: 'base-selector',
        label: 'Base',
        default: 10
      },
      commonProperties.rotation
    ]
  },

  // Constant node properties
  constant: {
    title: 'Constant Properties',
    properties: [
      { ...commonProperties.label, default: 'CONST' },
      {
        name: 'base',
        type: 'base-selector',
        label: 'Base',
        default: 10
      },
      commonProperties.bits,
      {
        name: 'value',
        type: 'number',
        label: 'Value',
        default: 0,
        min: 0,
        maxFormula: props => Math.pow(2, props.bits || 1) - 1,
        showButtons: true
      },
      commonProperties.rotation
    ]
  },

  // Clock node properties
  clock: {
    title: 'Clock Properties',
    properties: [
      { ...commonProperties.label, default: 'CLK' },
      {
        name: 'frequency',
        type: 'number',
        label: 'Frequency (Hz)',
        default: 1,
        min: 1,
        max: 1000,
        step: 1,
        showButtons: true
      },
      commonProperties.rotation
    ]
  },

  // AND gate properties
  'and-gate': {
    title: 'AND Gate Properties',
    properties: [
      { ...commonProperties.label, default: 'AND' },
      commonProperties.numInputs,
      commonProperties.invertedInputs,
      commonProperties.bits,
      commonProperties.rotation
    ]
  },

  // OR gate properties
  'or-gate': {
    title: 'OR Gate Properties',
    properties: [
      { ...commonProperties.label, default: 'OR' },
      commonProperties.numInputs,
      commonProperties.invertedInputs,
      commonProperties.bits,
      commonProperties.rotation
    ]
  },

  // XOR gate properties
  'xor-gate': {
    title: 'XOR Gate Properties',
    properties: [
      { ...commonProperties.label, default: 'XOR' },
      commonProperties.numInputs,
      commonProperties.invertedInputs,
      commonProperties.bits,
      commonProperties.rotation
    ]
  },

  // NOT gate properties
  'not-gate': {
    title: 'NOT Gate Properties',
    properties: [
      { ...commonProperties.label, default: 'NOT' },
      commonProperties.bits,
      commonProperties.rotation
    ]
  },

  // NAND gate properties
  'nand-gate': {
    title: 'NAND Gate Properties',
    properties: [
      { ...commonProperties.label, default: 'NAND' },
      commonProperties.numInputs,
      commonProperties.invertedInputs,
      commonProperties.bits,
      commonProperties.rotation
    ]
  },

  // NOR gate properties
  'nor-gate': {
    title: 'NOR Gate Properties',
    properties: [
      { ...commonProperties.label, default: 'NOR' },
      commonProperties.numInputs,
      commonProperties.invertedInputs,
      commonProperties.bits,
      commonProperties.rotation
    ]
  },

  // XNOR gate properties
  'xnor-gate': {
    title: 'XNOR Gate Properties',
    properties: [
      { ...commonProperties.label, default: 'XNOR' },
      commonProperties.numInputs,
      commonProperties.invertedInputs,
      commonProperties.bits,
      commonProperties.rotation
    ]
  },

  // Splitter properties
  splitter: {
    title: 'Splitter Properties',
    properties: [
      {
        name: 'inputBits',
        type: 'number',
        label: 'Bits in',
        default: 8,
        min: 1,
        max: 64,
        showButtons: true
      },
      {
        name: 'ranges',
        type: 'bit-range-table',
        label: 'Outputs'
      },
      commonProperties.rotation
    ]
  },

  // Merger properties
  merger: {
    title: 'Merger Properties',
    properties: [
      {
        name: 'outputBits',
        type: 'number',
        label: 'Bits out',
        default: 8,
        min: 1,
        max: 64,
        showButtons: true
      },
      {
        name: 'ranges',
        type: 'bit-range-table',
        label: 'Inputs'
      },
      commonProperties.rotation
    ]
  },

  // Multiplexer properties
  multiplexer: {
    title: 'Multiplexer Properties',
    properties: [
      { ...commonProperties.label, default: 'MUX' },
      {
        name: 'numInputs',
        type: 'number',
        label: 'Number of Inputs',
        default: 4,
        min: 2,
        max: 8,
        showButtons: true
      },
      commonProperties.bits,
      {
        name: 'selectorPosition',
        type: 'dropdown',
        label: 'Selector Position',
        default: 'bottom',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Bottom', value: 'bottom' }
        ]
      },
      commonProperties.rotation
    ]
  },

  // Decoder properties
  decoder: {
    title: 'Decoder Properties',
    properties: [
      { ...commonProperties.label, default: 'DEC' },
      {
        name: 'numOutputs',
        type: 'number',
        label: 'Number of Outputs',
        default: 4,
        min: 2,
        max: 16,
        step: 1,
        reactive: true
      },
      {
        name: 'selectorPosition',
        type: 'dropdown',
        label: 'Selector Position',
        default: 'bottom',
        options: [
          { label: 'Top', value: 'top' },
          { label: 'Bottom', value: 'bottom' }
        ],
        reactive: true
      },
      commonProperties.rotation
    ]
  },

  // Priority Encoder properties
  priorityEncoder: {
    title: 'Priority Encoder Properties',
    properties: [
      { ...commonProperties.label, default: 'PE' },
      {
        name: 'numInputs',
        type: 'number',
        label: 'Number of Inputs',
        default: 4,
        min: 2,
        max: 16,
        step: 1,
        reactive: true
      },
      commonProperties.rotation
    ]
  },

  // Register properties
  register: {
    title: 'Register Properties',
    properties: [
      { ...commonProperties.label, default: 'REG' },
      commonProperties.bits
    ]
  },

  // Adder properties
  adder: {
    title: 'Adder Properties',
    properties: [
      { ...commonProperties.label, default: '+' },
      { ...commonProperties.bits, default: 8 },
      commonProperties.rotation
    ]
  },

  // Subtract properties
  subtract: {
    title: 'Subtract Properties',
    properties: [
      { ...commonProperties.label, default: '-' },
      { ...commonProperties.bits, default: 8 },
      commonProperties.rotation
    ]
  },

  // Multiply properties
  multiply: {
    title: 'Multiply Properties',
    properties: [
      { ...commonProperties.label, default: '×' },
      { ...commonProperties.bits, default: 8 },
      commonProperties.rotation
    ]
  },
  // ROM properties
  rom: {
    title: 'ROM Properties',
    properties: [
      { ...commonProperties.label, default: 'ROM' },
      {
        name: 'addressBits',
        type: 'number',
        label: 'Address Bits',
        default: 4,
        min: 1,
        max: 16,
        showButtons: true
      },
      {
        name: 'dataBits',
        type: 'number',
        label: 'Data Bits',
        default: 8,
        min: 1,
        max: 32,
        showButtons: true
      },
      {
        name: 'data',
        type: 'memory-data-table',
        label: 'Memory Contents'
      }
    ]
  },

  // Circuit properties
  circuit: {
    title: 'Circuit Properties',
    properties: [
      {
        name: 'name',
        label: 'Circuit Name',
        type: 'text',
        required: true,
        help: 'Upper, lower, digit, underscore'
      },
      {
        name: 'label',
        label: 'Display Label',
        type: 'text',
        help: 'Label shown when used as a component'
      }
    ],
    actions: [
      {
        name: 'saveAsComponent',
        label: 'Save as Component',
        type: 'button',
        help: 'Save this circuit as a reusable component'
      }
    ]
  }
}

// Helper function to get properties for a component type
export function getComponentProperties(type) {
  return componentPropertySchema[type] || null
}

// Helper function to get circuit properties
export function getCircuitProperties() {
  return componentPropertySchema['circuit']
}

// Helper function to get default props for a component type
export function getDefaultProps(type) {
  const schema = componentPropertySchema[type]
  if (!schema) return {}

  const defaults = {}
  schema.properties.forEach(prop => {
    defaults[prop.name] = prop.default
  })
  return defaults
}

// Helper function to validate a property value
export function validatePropertyValue(type, propName, value, allProps) {
  const schema = componentPropertySchema[type]
  if (!schema) return true

  const propDef = schema.properties.find(p => p.name === propName)
  if (!propDef) return true

  if (propDef.type === 'number') {
    const min = propDef.min || -Infinity
    const max = propDef.maxFormula ? propDef.maxFormula(allProps) : propDef.max || Infinity
    return value >= min && value <= max
  }

  return true
}
