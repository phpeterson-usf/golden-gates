// Configuration for component properties shown in the inspector
// Each entry defines the properties available for a component type

export const componentPropertySchema = {
  // Input node properties
  'input': {
    title: 'Input Properties',
    icon: 'pi pi-circle',
    properties: [
      {
        name: 'label',
        type: 'text',
        label: 'Label',
        default: 'IN'
      },
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
      {
        name: 'bits',
        type: 'number',
        label: 'Bits',
        default: 1,
        min: 1,
        max: 32,
        showButtons: true
      }
    ]
  },
  
  // Output node properties
  'output': {
    title: 'Output Properties',
    icon: 'pi pi-circle-fill',
    properties: [
      {
        name: 'label',
        type: 'text',
        label: 'Label',
        default: 'OUT'
      },
      {
        name: 'bits',
        type: 'number',
        label: 'Bits',
        default: 1,
        min: 1,
        max: 32,
        showButtons: true
      },
      {
        name: 'base',
        type: 'base-selector',
        label: 'Base',
        default: 10
      }
    ]
  },
  
  // AND gate properties
  'and-gate': {
    title: 'AND Gate Properties',
    icon: 'pi pi-sitemap',
    properties: [
      {
        name: 'label',
        type: 'text',
        label: 'Label',
        default: 'AND'
      },
      {
        name: 'numInputs',
        type: 'number',
        label: 'Number of Inputs',
        default: 2,
        min: 2,
        max: 8,
        showButtons: true
      }
    ]
  },
  
  // OR gate properties
  'or-gate': {
    title: 'OR Gate Properties',
    icon: 'pi pi-sitemap',
    properties: [
      {
        name: 'label',
        type: 'text',
        label: 'Label',
        default: 'OR'
      },
      {
        name: 'numInputs',
        type: 'number',
        label: 'Number of Inputs',
        default: 2,
        min: 2,
        max: 8,
        showButtons: true
      },
      {
        name: 'bits',
        type: 'number',
        label: 'Bits',
        default: 1,
        min: 1,
        max: 32,
        showButtons: true
      }
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