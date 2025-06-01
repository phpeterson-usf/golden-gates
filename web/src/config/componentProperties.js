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
  }
}

export const componentPropertySchema = {
  // Input node properties
  'input': {
    title: 'Input Properties',
    icon: 'pi pi-circle',
    properties: [
      { ...commonProperties.label, default: 'IN' },
      {
        name: 'value',
        type: 'number',
        label: 'Value',
        default: 0,
        min: 0,
        maxFormula: (props) => Math.pow(2, props.bits || 1) - 1,
        showButtons: true
      },
      {
        name: 'base',
        type: 'number',
        label: 'Base',
        default: 10,
        hidden: true  // Hidden from inspector, managed internally
      },
      commonProperties.bits,
      commonProperties.rotation
    ]
  },
  
  // Output node properties
  'output': {
    title: 'Output Properties',
    icon: 'pi pi-circle-fill',
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
  
  // AND gate properties
  'and-gate': {
    title: 'AND Gate Properties',
    icon: 'pi pi-sitemap',
    properties: [
      { ...commonProperties.label, default: 'AND' },
      {
        name: 'numInputs',
        type: 'number',
        label: 'Number of Inputs',
        default: 2,
        min: 2,
        max: 8,
        showButtons: true
      },
      commonProperties.rotation
    ]
  },
  
  // OR gate properties
  'or-gate': {
    title: 'OR Gate Properties',
    icon: 'pi pi-sitemap',
    properties: [
      { ...commonProperties.label, default: 'OR' },
      {
        name: 'numInputs',
        type: 'number',
        label: 'Number of Inputs',
        default: 2,
        min: 2,
        max: 8,
        showButtons: true
      },
      commonProperties.bits,
      commonProperties.rotation
    ]
  }
}

// Helper function to get properties for a component type
export function getComponentProperties(type) {
  return componentPropertySchema[type] || null
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
    const max = propDef.maxFormula ? propDef.maxFormula(allProps) : (propDef.max || Infinity)
    return value >= min && value <= max
  }
  
  return true
}