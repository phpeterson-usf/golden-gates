import { ref } from 'vue'
import { componentRegistry } from '../utils/componentRegistry'

export function useCircuitData() {
  // Component management
  const components = ref([])
  const nextId = ref(1)
  const componentCounters = ref({
    'input': 0,
    'output': 0,
    'and-gate': 0
  })
  const inputCounter = ref(0)
  const outputCounter = ref(0)

  // Add a new component
  function addComponent(type, x, y) {
    const config = componentRegistry[type]
    if (!config) return null
    
    // Increment the counter for this component type
    if (!(type in componentCounters.value)) {
      componentCounters.value[type] = 0
    }
    const typeIndex = ++componentCounters.value[type]
    
    const id = `${type}_${typeIndex}`
    const component = {
      id,
      type,
      x,
      y,
      props: { ...config.defaultProps }
    }
    
    // Special handling for certain component types
    if (config.onCreate) {
      if (type === 'input') {
        config.onCreate(component, inputCounter.value++)
      } else if (type === 'output') {
        config.onCreate(component, outputCounter.value++)
      }
    }
    
    components.value.push(component)
    return component
  }

  // Remove a component
  function removeComponent(componentId) {
    const index = components.value.findIndex(c => c.id === componentId)
    if (index !== -1) {
      components.value.splice(index, 1)
    }
  }

  // Clear all components
  function clearCircuit() {
    components.value = []
    nextId.value = 1
    inputCounter.value = 0
    outputCounter.value = 0
    componentCounters.value = {
      'input': 0,
      'output': 0,
      'and-gate': 0
    }
  }

  // Generate circuit data for Python execution
  function getCircuitData(componentRefs) {
    const componentCode = []
    const componentRefMap = {}
    
    // Get refs to all component instances
    components.value.forEach(comp => {
      // In Vue 3 with v-for, refs might be stored as arrays
      const componentInstance = componentRefs[comp.id]?.[0] || componentRefs[comp.id]
      if (componentInstance && typeof componentInstance.generate === 'function') {
        const generated = componentInstance.generate()
        componentCode.push(generated.code)
        componentRefMap[comp.id] = generated.varName
      }
    })
    
    return {
      components: components.value,
      componentRefs: componentRefMap,
      code: componentCode
    }
  }

  // Get component by ID
  function getComponent(componentId) {
    return components.value.find(c => c.id === componentId)
  }

  // Update component position
  function updateComponentPosition(componentId, x, y) {
    const component = getComponent(componentId)
    if (component) {
      component.x = x
      component.y = y
    }
  }

  return {
    // State
    components,
    nextId,
    componentCounters,
    inputCounter,
    outputCounter,
    
    // Methods
    addComponent,
    removeComponent,
    clearCircuit,
    getCircuitData,
    getComponent,
    updateComponentPosition
  }
}