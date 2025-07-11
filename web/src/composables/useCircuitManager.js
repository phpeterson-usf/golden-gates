import { ref, computed } from 'vue'

/**
 * Circuit Manager - Centralized state management for all circuits
 * Provides a clean MVC model layer for circuit data and operations
 */
export function useCircuitManager() {
  // Core data structure - all circuits in a flat Map for easy management
  const allCircuits = ref(new Map())
  
  // Available circuit components (circuits that have been saved as components)
  const availableComponents = ref(new Map())
  
  // Open tabs and active tab for tab-based navigation
  const openTabs = ref([])
  const activeTabId = ref(null)
  
  // Navigation history for breadcrumbs (when navigating into subcircuits)
  const navigationHistory = ref([])
  
  // Counter for generating unique circuit IDs
  const nextCircuitId = ref(1)
  
  // Initialize with a default circuit
  const initializeDefaultCircuit = () => {
    if (allCircuits.value.size === 0) {
      const defaultCircuit = {
        id: 'circuit_1',
        name: 'Circuit 1',
        label: 'Circuit 1',
        components: [],
        wires: [],
        wireJunctions: [],
        properties: {
          name: 'Circuit 1',
          label: 'Circuit 1'
        }
      }
      allCircuits.value.set('circuit_1', defaultCircuit)
      openTabs.value.push({ id: 'circuit_1' })
      activeTabId.value = 'circuit_1'
      nextCircuitId.value = 2
    }
  }
  
  // Initialize on creation
  initializeDefaultCircuit()
  
  // Computed: Get current active circuit (based on active tab)
  const activeCircuit = computed(() => {
    return allCircuits.value.get(activeTabId.value)
  })
  
  // Computed: Get all circuits as array
  const circuitsArray = computed(() => {
    return Array.from(allCircuits.value.values())
  })
  
  // Computed: Get available circuit components as array
  const availableComponentsArray = computed(() => {
    return Array.from(availableComponents.value.values())
  })
  
  // Computed: Get open tabs with circuit info
  const tabs = computed(() => {
    return openTabs.value.map(tab => {
      const circuit = allCircuits.value.get(tab.id)
      return {
        id: tab.id,
        name: circuit?.name || 'Untitled',
        label: circuit?.label || circuit?.name || 'Untitled'
      }
    })
  })
  
  // Computed: Get breadcrumbs for navigation
  const breadcrumbs = computed(() => {
    return navigationHistory.value.map(circuitId => {
      const circuit = allCircuits.value.get(circuitId)
      return {
        id: circuitId,
        name: circuit?.name || 'Unknown',
        isMain: circuit?.isMain || false
      }
    })
  })
  
  // Create a new circuit
  function createCircuit(name, options = {}) {
    const id = options.id || `circuit_${nextCircuitId.value++}`
    const circuit = {
      id,
      name: name || `Circuit ${nextCircuitId.value - 1}`,
      label: options.label || name || `Circuit ${nextCircuitId.value - 1}`,
      components: [],
      wires: [],
      wireJunctions: [],
      // Circuit properties that appear in inspector
      properties: {
        name: name || `Circuit ${nextCircuitId.value - 1}`,
        label: options.label || name || `Circuit ${nextCircuitId.value - 1}`,
        // Interface definition for when used as a component
        interface: {
          inputs: options.interface?.inputs || [],
          outputs: options.interface?.outputs || []
        }
      },
      ...options
    }
    
    allCircuits.value.set(id, circuit)
    openTab(id) // Automatically open new circuits in tabs
    return circuit
  }
  
  // Tab management
  function openTab(circuitId) {
    const circuit = allCircuits.value.get(circuitId)
    if (!circuit) return false
    
    // Check if tab is already open
    if (!openTabs.value.find(tab => tab.id === circuitId)) {
      openTabs.value.push({ id: circuitId })
    }
    
    // Set as active tab
    activeTabId.value = circuitId
    return true
  }
  
  function closeTab(circuitId) {
    const index = openTabs.value.findIndex(tab => tab.id === circuitId)
    if (index === -1) return false
    
    openTabs.value.splice(index, 1)
    
    // If closing active tab, switch to another tab
    if (activeTabId.value === circuitId) {
      if (openTabs.value.length > 0) {
        // Switch to previous tab or first available
        const newIndex = Math.max(0, index - 1)
        activeTabId.value = openTabs.value[newIndex]?.id || null
      } else {
        activeTabId.value = null
      }
    }
    
    return true
  }
  
  function switchToTab(circuitId) {
    const circuit = allCircuits.value.get(circuitId)
    if (!circuit) return false
    
    activeTabId.value = circuitId
    return true
  }
  
  // Navigate to a circuit
  function navigateToCircuit(circuitId) {
    const circuit = allCircuits.value.get(circuitId)
    if (!circuit) {
      console.warn(`Circuit ${circuitId} not found`)
      return false
    }
    
    activeTabId.value = circuitId
    
    // Update navigation history
    const currentIndex = navigationHistory.value.indexOf(circuitId)
    if (currentIndex !== -1) {
      // If circuit is already in history, trim to that point
      navigationHistory.value = navigationHistory.value.slice(0, currentIndex + 1)
    } else {
      // Add to history
      navigationHistory.value.push(circuitId)
    }
    
    return true
  }
  
  // Navigate to parent circuit (go back)
  function navigateBack() {
    if (navigationHistory.value.length > 1) {
      navigationHistory.value.pop()
      const parentId = navigationHistory.value[navigationHistory.value.length - 1]
      activeTabId.value = parentId
      return true
    }
    return false
  }
  
  // Navigate to main circuit
  function navigateToMain() {
    return navigateToCircuit('main')
  }
  
  // Get circuit by ID
  function getCircuit(circuitId) {
    return allCircuits.value.get(circuitId)
  }
  
  // Get circuit by name
  function getCircuitByName(name) {
    return circuitsArray.value.find(circuit => circuit.name === name)
  }
  
  // Rename a circuit
  function renameCircuit(circuitId, newName) {
    const circuit = allCircuits.value.get(circuitId)
    if (circuit && !circuit.isMain) {
      circuit.name = newName
      return true
    }
    return false
  }
  
  // Delete a circuit
  function deleteCircuit(circuitId) {
    if (circuitId === 'main') {
      console.warn('Cannot delete main circuit')
      return false
    }
    
    const circuit = allCircuits.value.get(circuitId)
    if (!circuit) return false
    
    // TODO: Check if circuit is being used as a component elsewhere
    // For now, just delete it
    allCircuits.value.delete(circuitId)
    
    // If we're currently viewing the deleted circuit, close its tab
    if (activeTabId.value === circuitId) {
      closeTab(circuitId)
    }
    
    return true
  }
  
  // Add a component to a circuit
  function addComponentToCircuit(circuitId, component) {
    const circuit = allCircuits.value.get(circuitId)
    if (circuit) {
      circuit.components.push(component)
      return true
    }
    return false
  }
  
  // Add a component to the current circuit
  function addComponent(component) {
    return addComponentToCircuit(activeTabId.value, component)
  }
  
  // Remove a component from a circuit
  function removeComponentFromCircuit(circuitId, componentId) {
    const circuit = allCircuits.value.get(circuitId)
    if (circuit) {
      const index = circuit.components.findIndex(comp => comp.id === componentId)
      if (index !== -1) {
        circuit.components.splice(index, 1)
        return true
      }
    }
    return false
  }
  
  // Remove a component from the current circuit
  function removeComponent(componentId) {
    return removeComponentFromCircuit(activeTabId.value, componentId)
  }
  
  // Update a component in a circuit
  function updateComponentInCircuit(circuitId, updatedComponent) {
    const circuit = allCircuits.value.get(circuitId)
    if (circuit) {
      const index = circuit.components.findIndex(comp => comp.id === updatedComponent.id)
      if (index !== -1) {
        circuit.components[index] = updatedComponent
        return true
      }
    }
    return false
  }
  
  // Update a component in the current circuit
  function updateComponent(updatedComponent) {
    return updateComponentInCircuit(activeTabId.value, updatedComponent)
  }
  
  // Clear a circuit
  function clearCircuit(circuitId) {
    const circuit = allCircuits.value.get(circuitId)
    if (circuit) {
      circuit.components = []
      circuit.wires = []
      circuit.wireJunctions = []
      return true
    }
    return false
  }
  
  // Clear the current circuit
  function clearCurrentCircuit() {
    return clearCircuit(activeTabId.value)
  }
  
  // Check if a circuit can be used as a component in another circuit
  // (prevents circular references)
  function canUseCircuitAsComponent(circuitId, targetCircuitId) {
    if (circuitId === targetCircuitId) return false
    
    // TODO: Implement full circular reference detection
    // For now, simple check
    return true
  }
  
  // Save a circuit as a reusable component
  function saveCircuitAsComponent(circuitId) {
    const circuit = allCircuits.value.get(circuitId)
    if (!circuit) {
      console.warn(`Circuit ${circuitId} not found`)
      return false
    }
    
    // Analyze circuit to detect inputs and outputs
    const circuitInterface = analyzeCircuitInterface(circuit)
    
    // Create component definition
    const componentDef = {
      id: circuit.id,
      name: circuit.name,
      label: circuit.label || circuit.name,
      type: 'circuit-component',
      interface: circuitInterface,
      circuitId: circuit.id,
      created: new Date().toISOString()
    }
    
    // Save to available components
    availableComponents.value.set(circuit.id, componentDef)
    
    return true
  }
  
  // Analyze circuit to detect input and output interfaces
  function analyzeCircuitInterface(circuit) {
    const inputs = []
    const outputs = []
    
    // Find all input and output components in the circuit
    circuit.components.forEach(component => {
      if (component.type === 'input') {
        inputs.push({
          id: component.id,
          label: component.props?.label || 'IN',
          bits: component.props?.bits || 1
        })
      } else if (component.type === 'output') {
        outputs.push({
          id: component.id,
          label: component.props?.label || 'OUT',
          bits: component.props?.bits || 1
        })
      }
    })
    
    return { inputs, outputs }
  }
  
  // Get a circuit component definition
  function getCircuitComponent(componentId) {
    return availableComponents.value.get(componentId)
  }
  
  // Remove a circuit component
  function removeCircuitComponent(componentId) {
    return availableComponents.value.delete(componentId)
  }
  
  // Create a schematic component that references another circuit
  function createSchematicComponent(circuitId, props = {}) {
    const referencedCircuit = allCircuits.value.get(circuitId)
    if (!referencedCircuit) {
      console.warn(`Circuit ${circuitId} not found`)
      return null
    }
    
    return {
      id: `schematic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'schematic-component',
      x: props.x || 0,
      y: props.y || 0,
      props: {
        circuitId,
        label: props.label || referencedCircuit.label || referencedCircuit.name,
        ...props
      }
    }
  }
  
  // Export current state for saving
  function exportState() {
    return {
      circuits: Object.fromEntries(allCircuits.value),
      availableComponents: Object.fromEntries(availableComponents.value),
      activeTabId: activeTabId.value,
      openTabs: openTabs.value,
      navigationHistory: navigationHistory.value,
      nextCircuitId: nextCircuitId.value
    }
  }
  
  // Import state from saved data
  function importState(state) {
    allCircuits.value = new Map(Object.entries(state.circuits))
    availableComponents.value = new Map(Object.entries(state.availableComponents || {}))
    activeTabId.value = state.activeTabId || null
    openTabs.value = state.openTabs || []
    navigationHistory.value = state.navigationHistory || []
    nextCircuitId.value = state.nextCircuitId || 1
  }
  
  return {
    // State (renamed for consistency)
    allCircuits,
    availableComponents,
    openTabs,
    activeTabId,
    navigationHistory,
    
    // Computed (renamed for clarity)
    activeCircuit,
    circuitsArray,
    availableComponentsArray,
    tabs,
    breadcrumbs,
    
    // Circuit management
    createCircuit,
    getCircuit,
    getCircuitByName,
    renameCircuit,
    deleteCircuit,
    
    // Tab management
    openTab,
    closeTab,
    switchToTab,
    
    // Navigation (for subcircuit drilling)
    navigateToCircuit,
    navigateBack,
    
    // Component management
    addComponent,
    addComponentToCircuit,
    removeComponent,
    removeComponentFromCircuit,
    updateComponent,
    updateComponentInCircuit,
    
    // Circuit operations
    clearCircuit,
    clearCurrentCircuit,
    
    // Circuit components
    saveCircuitAsComponent,
    getCircuitComponent,
    removeCircuitComponent,
    
    // Schematic components
    canUseCircuitAsComponent,
    createSchematicComponent,
    
    // Import/Export
    exportState,
    importState
  }
}