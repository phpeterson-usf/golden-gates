import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFileService } from './useFileService'
import { usePythonEngine } from './usePythonEngine'

/**
 * Circuit Operations - Business logic for circuit management
 * Provides controller layer functionality for circuit operations
 */
export function useAppController(circuitManager) {
  const { t } = useI18n()
  const {
    saveCircuit: saveCircuitFile,
    openCircuit: openCircuitFile,
    parseAndValidateJSON
  } = useFileService()
  const {
    initialize: initializePyodide,
    runPython,
    isLoading: isPyodideLoading,
    isReady: isPyodideReady,
    error: pyodideError,
    pyodide,
    executeHierarchicalCircuit
  } = usePythonEngine()

  // Simulation state
  const isRunning = ref(false)

  // Confirmation dialog state
  const showConfirmDialog = ref(false)
  const confirmDialog = ref({
    title: '',
    message: '',
    type: 'warning',
    acceptCallback: null,
    rejectCallback: null
  })

  /**
   * Create a new circuit with auto-generated name
   */
  function createNewCircuit() {
    const circuitCount = circuitManager.allCircuits.value.size + 1
    circuitManager.createCircuit(`Circuit${circuitCount}`)
  }

  /**
   * Handle inspector actions (like Save Component button)
   */
  function handleInspectorAction(actionData) {
    const { action, circuit, component } = actionData

    switch (action) {
      case 'saveAsComponent':
        if (circuit) {
          const success = circuitManager.saveCircuitAsComponent(circuit.id)
          if (success) {
            showConfirmation({
              title: 'Component Saved',
              message: `"${circuit.name}" has been saved as a reusable component and is now available in the Insert menu.`,
              type: 'info',
              acceptLabel: 'OK',
              showCancel: false,
              onAccept: () => {}
            })
          } else {
            showConfirmation({
              title: 'Error',
              message: 'Failed to save circuit as component. Please try again.',
              type: 'danger',
              showCancel: false,
              onAccept: () => {}
            })
          }
        }
        break
      default:
        console.warn(`Unknown action: ${action}`)
    }
  }

  /**
   * Run simulation on the current circuit with support for hierarchical circuits
   */
  async function runCircuitSimulationWithHierarchy(canvasRef) {
    isRunning.value = true

    // Clear any existing error notifications when starting a new simulation
    if (canvasRef?.clearAllNotifications) {
      canvasRef.clearAllNotifications()
    }

    // Clear component error states from previous Pyodide errors
    if (canvasRef?.components) {
      canvasRef.components.forEach(component => {
        if (component.props?.hasError || component.props?.hasWarning) {
          const clearedComponent = {
            ...component,
            props: {
              ...component.props,
              hasError: false,
              hasWarning: false,
              errorMessageId: '',
              errorDetails: {}
            }
          }
          canvasRef.updateComponent(clearedComponent)
        }
      })
    }

    try {
      // Initialize Pyodide if not already initialized
      if (!isPyodideReady.value) {
        await initializePyodide()
      }

      // Generate GGL program for the current circuit
      const mainCircuitGglProgram = generateGglProgramForCurrentCircuit(canvasRef)

      if (!mainCircuitGglProgram || mainCircuitGglProgram.trim() === '') {
        return
      }

      // Log the generated GGL program for debugging and verification
      console.log('\n=== Main Circuit GGL Program ===')
      console.log(mainCircuitGglProgram)
      console.log('=== End of Main Circuit ===\n')

      // Set up callback for Python to update Vue components
      setupPythonVueUpdateCallback(canvasRef)

      // Execute the complete hierarchical circuit program
      await executeHierarchicalCircuit(circuitManager, mainCircuitGglProgram)
    } catch (err) {
      console.error('Hierarchical circuit simulation error:', err)

      // Check if we have structured error data from Python
      const structuredErrorData = window.__vueStructuredErrorData
      if (structuredErrorData) {
        // Handle circuit component error with structured data
        handleCircuitComponentError(canvasRef, structuredErrorData)
        // Clear the structured error data
        window.__vueStructuredErrorData = null
      } else {
        // Non-CircuitError exception - show generic error
        if (canvasRef?.showErrorNotification) {
          canvasRef.showErrorNotification(`Simulation error: ${err.message}`)
        }
      }
    } finally {
      isRunning.value = false
    }
  }

  /**
   * Generate GGL program for the current circuit (with hierarchical support)
   */
  function generateGglProgramForCurrentCircuit(canvasRef) {
    if (!canvasRef) {
      console.error('No canvas reference provided to generateGglProgramForCurrentCircuit')
      return ''
    }

    if (typeof canvasRef.getCircuitData !== 'function') {
      console.error('Canvas reference does not have getCircuitData method')
      return ''
    }

    return canvasRef.getCircuitData()
  }

  /**
   * Set up the callback for Python to update Vue components
   */
  function setupPythonVueUpdateCallback(canvasRef) {
    // Callback for structured error data from Python
    window.__vueStructuredErrorCallback = errorJson => {
      try {
        // Parse JSON string to avoid Pyodide proxy issues
        window.__vueStructuredErrorData = JSON.parse(errorJson)
      } catch (e) {
        console.error('Failed to parse structured error data:', e)
        window.__vueStructuredErrorData = null
      }
    }

    window.__vueUpdateCallback = (eventType, componentId, value) => {
      if (!canvasRef) {
        console.error('No canvasRef available')
        return
      }

      // First, try to find the component in the main circuit
      const component = canvasRef.components.find(c => c.id === componentId)

      if (component) {
        // This is a top-level component - handle normally
        switch (eventType) {
          case 'value':
            handleValueUpdate(canvasRef, component, value)
            break
          case 'step':
            handleStepUpdate(canvasRef, component, value)
            break
          case 'error':
            handleErrorUpdate(canvasRef, component, value)
            break
          default:
            console.warn(`Unknown event type: ${eventType}`)
        }
      } else {
        // Check if it's a wire ID
        const wireIdPattern = /^wire_\d+$/
        if (wireIdPattern.test(componentId) && eventType === 'step') {
          handleWireStepUpdate(canvasRef, componentId, value)
        } else {
          // Handle nested component callbacks that don't have parent mapping yet
          // TODO: When we implement per-instance subcircuit views, route these callbacks
          // to the appropriate instance view instead of logging
          if (eventType === 'error') {
            // Keep error messages visible as they're important for debugging
            console.log(`Nested component error: ${componentId} = ${value} (no parent mapped)`)
          }
          // Suppress value and step updates to reduce console clutter - the values are 
          // still being calculated correctly, just no UI destination yet
        }
      }
    }

    // Handle legacy callback format for backward compatibility
    window.__vueUpdateCallbackLegacy = (componentId, value) => {
      window.__vueUpdateCallback('value', componentId, value)
    }
  }

  /**
   * Handle value update events
   */
  function handleValueUpdate(canvasRef, component, value) {
    if (component.type === 'output') {
      // Create a new component object with updated timestamp to force animation
      const updatedComponent = {
        ...component,
        props: {
          ...component.props,
          value: value,
          lastUpdate: Date.now()
        }
      }
      canvasRef.updateComponent(updatedComponent)
    }
  }

  /**
   * Handle step highlighting events
   */
  function handleStepUpdate(canvasRef, component, stepData) {
    // For now, treat stepData as a boolean for active/inactive
    // Future: could be an object with { active: true, style: 'processing', duration: 500 }
    const isActive = typeof stepData === 'boolean' ? stepData : stepData.active

    const updatedComponent = {
      ...component,
      props: {
        ...component.props,
        stepActive: isActive,
        stepStyle: stepData.style || 'processing',
        stepDuration: stepData.duration || 500
      }
    }
    canvasRef.updateComponent(updatedComponent)

    // Auto-clear step highlighting after duration
    if (isActive) {
      const duration = stepData.duration || 500
      setTimeout(() => {
        const latestComponent = canvasRef.components.find(c => c.id === component.id)
        if (latestComponent) {
          const clearedComponent = {
            ...latestComponent,
            props: {
              ...latestComponent.props,
              stepActive: false
            }
          }
          canvasRef.updateComponent(clearedComponent)
        }
      }, duration)
    }
  }

  /**
   * Handle wire step update events
   */
  function handleWireStepUpdate(canvasRef, wireId, stepData) {
    const activeCircuit = canvasRef?.circuitManager?.activeCircuit?.value
    if (!activeCircuit?.wires) return

    const wireIndex = activeCircuit.wires.findIndex(w => w.id === wireId)
    if (wireIndex === -1) return

    // Convert Pyodide Proxy and extract data
    const jsStepData = stepData.toJs?.() || stepData

    // Update wire state directly
    activeCircuit.wires.splice(wireIndex, 1, {
      ...activeCircuit.wires[wireIndex],
      stepActive: jsStepData.active,
      stepStyle: jsStepData.style || 'processing'
    })
  }

  /**
   * Handle CircuitComponentError exceptions from Python
   */
  function handleCircuitComponentError(canvasRef, errorData) {
    if (!canvasRef) {
      console.error('No canvasRef available')
      return
    }

    // If we have circuit context, navigate to that circuit to show the error in context
    if (errorData.circuit_name) {
      // Find the circuit by name
      const targetCircuit = circuitManager.circuitsArray.value.find(
        c => c.name === errorData.circuit_name
      )
      if (targetCircuit && targetCircuit.id !== circuitManager.activeTabId.value) {
        circuitManager.navigateToCircuit(targetCircuit.id)
        // Give the UI a moment to switch circuits, then handle error with the now-active circuit
        setTimeout(() => {
          handleErrorInTargetCircuit(canvasRef, errorData)
        }, 200) // Single attempt with reasonable delay
        return
      }
    }

    // Handle error in current context (either no circuit name or already in target circuit)
    handleErrorInTargetCircuit(canvasRef, errorData)
  }

  function handleErrorInTargetCircuit(canvasRef, errorData) {
    // Find the component that has the error - try canvasRef first, fall back to active circuit data
    let component = null
    let componentsSource = null

    // First try canvasRef (normal case or if still valid after navigation)
    if (canvasRef?.components) {
      componentsSource = canvasRef.components

      // Try to find by component ID
      if (errorData.component_id) {
        component = componentsSource.find(c => c.id === errorData.component_id)
      }
    }

    // If not found in canvasRef, try active circuit data (post-navigation case)
    if (!component && circuitManager?.activeCircuit?.value?.components) {
      componentsSource = circuitManager.activeCircuit.value.components

      // Try to find by component ID
      if (errorData.component_id) {
        component = componentsSource.find(c => c.id === errorData.component_id)
      }
    }

    if (!component) {
      console.warn(`Component not found: ${errorData.component_id || 'no component_id'}`)

      // Show notification even if component not found (subcircuit error case)
      if (canvasRef?.showErrorNotification) {
        const circuitContext = errorData.circuit_name
          ? ` in circuit "${errorData.circuit_name}"`
          : ''
        const componentDescription = `${errorData.component_type}${circuitContext}`

        // Build template variables from error data for i18n
        const templateVars = {
          inputName: errorData.port_name || 'unknown',
          outputName: errorData.port_name || 'unknown',
          ...errorData // Include all additional fields (expectedBits, actualBits, etc.)
        }

        const errorMessage = t(`simulation.errors.${errorData.error_code}`, templateVars)
        canvasRef.showErrorNotification(`Error in ${componentDescription}: ${errorMessage}`)
      }
      return
    }

    // Create error details from all structured error data
    const errorDetails = {
      portName: errorData.port_name,
      connectedComponentId: errorData.connected_component_id,
      // Include any additional fields (expectedBits, actualBits, etc.)
      ...Object.fromEntries(
        Object.entries(errorData).filter(
          ([key]) =>
            ![
              'component_id',
              'component_type',
              'error_code',
              'severity',
              'port_name',
              'connected_component_id',
              'circuit_name'
            ].includes(key)
        )
      )
    }

    // Update component to show error state
    const updatedComponent = {
      ...component,
      props: {
        ...component.props,
        hasError: errorData.severity === 'error',
        hasWarning: errorData.severity === 'warning',
        errorMessageId: errorData.error_code,
        errorDetails: errorDetails
      }
    }

    // Use circuitManager.updateComponent if canvasRef is stale (post-navigation)
    if (canvasRef?.updateComponent) {
      canvasRef.updateComponent(updatedComponent)
    } else if (circuitManager?.updateComponent) {
      circuitManager.updateComponent(updatedComponent)
    }

    // Show global error notification - try canvasRef first, fall back to console if stale
    const componentLabel = component.props?.label || component.label
    const circuitContext = errorData.circuit_name ? ` in circuit "${errorData.circuit_name}"` : ''
    const componentDescription = componentLabel
      ? `${errorData.component_type} "${componentLabel}"${circuitContext}`
      : `${errorData.component_type}${circuitContext}`

    // Build template variables from error data
    const templateVars = {
      inputName: errorData.port_name || 'unknown',
      outputName: errorData.port_name || 'unknown',
      ...errorData // Include all additional fields (expectedBits, actualBits, etc.)
    }

    const errorMessage = t(`simulation.errors.${errorData.error_code}`, templateVars)

    if (canvasRef?.showErrorNotification) {
      canvasRef.showErrorNotification(`Error in ${componentDescription}: ${errorMessage}`)
    } else {
      // Fallback when canvasRef is stale - at least log the error
      console.error(`Error in ${componentDescription}: ${errorMessage}`)
    }
  }

  /**
   * Handle error events
   */
  function handleErrorUpdate(canvasRef, component, errorData) {
    // For now, treat errorData as a simple error message string
    // Future: could be an object with { severity: 'error', messageId: 'INPUT_NOT_CONNECTED', details: {} }
    const isError = typeof errorData === 'string' || errorData.severity === 'error'

    const updatedComponent = {
      ...component,
      props: {
        ...component.props,
        hasError: isError,
        hasWarning: errorData.severity === 'warning',
        errorMessageId: errorData.messageId || errorData,
        errorDetails: errorData.details || {}
      }
    }
    canvasRef.updateComponent(updatedComponent)

    // Show global error notification using the same system as front-end errors
    if (isError && canvasRef?.showErrorNotification) {
      const componentLabel = component.props?.label || component.label || 'unlabeled'
      const errorMessage =
        typeof errorData === 'string'
          ? errorData
          : errorData.message || `Error in ${component.type} "${componentLabel}"`

      canvasRef.showErrorNotification(
        `Error in ${component.type} "${componentLabel}": ${errorMessage}`
      )
    }

    console.error(`Component ${component.id} error:`, errorData)
  }

  /**
   * Legacy simulation function for backwards compatibility
   */
  async function runSimulation(canvasRef) {
    return await runCircuitSimulationWithHierarchy(canvasRef)
  }

  /**
   * Stop simulation
   */
  function stopSimulation() {
    isRunning.value = false
    // TODO: Implement actual stop logic if needed
  }

  /**
   * Save current circuit to file
   */
  async function saveCircuit(canvasRef) {
    try {
      const components = canvasRef?.components || []
      const wires = canvasRef?.wires || []
      const wireJunctions = canvasRef?.wireJunctions || []

      // Get circuit metadata from the current active circuit
      const activeCircuit = circuitManager.activeCircuit.value
      const circuitMetadata = activeCircuit
        ? {
            name: activeCircuit.name,
            label: activeCircuit.label,
            // Only include interface from properties, not duplicate name/label
            interface: activeCircuit.properties?.interface
          }
        : {}

      // Collect ALL available schematic component definitions (not just used ones)
      // This ensures that components saved with "Save as Component" are preserved
      const allSchematicComponents = {}

      // Include all components from availableComponents Map
      for (const [circuitId, componentDef] of circuitManager.availableComponents.value) {
        if (componentDef && componentDef.type === 'circuit-component') {
          // Get the full circuit definition
          const circuit = circuitManager.getCircuit(circuitId)
          if (circuit) {
            allSchematicComponents[circuitId] = {
              definition: componentDef,
              circuit: circuit
            }
          }
        }
      }

      await saveCircuitFile(
        components,
        wires,
        wireJunctions,
        circuitMetadata,
        allSchematicComponents,
        circuitManager.exportState().nextCircuitId
      )

      // Mark the active circuit as saved (no unsaved changes)
      if (activeCircuit) {
        circuitManager.markCircuitAsSaved(activeCircuit.id)
      }
    } catch (error) {
      console.error('Error saving circuit:', error)
      alert('Error saving circuit: ' + error.message)
    }
  }

  /**
   * Open circuit from file
   */
  async function openCircuit(canvasRef) {
    try {
      const fileContent = await openCircuitFile()
      if (!fileContent) return

      const circuitData = parseAndValidateJSON(fileContent)

      // Check if current circuit has any components
      const hasExistingCircuit = canvasRef?.components?.length > 0 || canvasRef?.wires?.length > 0

      if (hasExistingCircuit) {
        showConfirmation({
          title: 'Replace Circuit?',
          message: 'This will replace your current circuit. Are you sure you want to continue?',
          type: 'warning',
          onAccept: () => loadCircuitData(canvasRef, circuitData)
        })
      } else {
        loadCircuitData(canvasRef, circuitData)
      }
    } catch (error) {
      console.error('Error opening circuit:', error)
      alert('Error opening circuit: ' + error.message)
    }
  }

  /**
   * Load circuit data into canvas
   */
  function loadCircuitData(canvasRef, circuitData) {
    if (!canvasRef) return
    
    // Set loading state to prevent undo saves during loading
    if (canvasRef.setLoadingState) {
      canvasRef.setLoadingState(true)
    }

    // Clear existing circuit canvas
    canvasRef.clearCircuit()

    // For v1.1+ format, restore schematic component definitions first
    if (
      circuitData.schematicComponents &&
      Object.keys(circuitData.schematicComponents).length > 0
    ) {
      Object.entries(circuitData.schematicComponents).forEach(([circuitId, data]) => {
        try {
          // Restore the circuit definition
          if (data.circuit) {
            // Always restore circuit data (overwrite existing if needed)
            const circuit = {
              ...data.circuit,
              id: circuitId
            }
            circuitManager.allCircuits.value.set(circuitId, circuit)
          }

          // Restore the component definition
          if (data.definition) {
            circuitManager.availableComponents.value.set(circuitId, data.definition)
          }
        } catch (error) {
          console.warn(`Failed to restore schematic component ${circuitId}:`, error)
        }
      })
    }

    // Restore nextCircuitId to prevent ID collisions
    if (circuitData.nextCircuitId) {
      // Get current state, update nextCircuitId, and restore it
      const currentState = circuitManager.exportState()
      currentState.nextCircuitId = Math.max(currentState.nextCircuitId, circuitData.nextCircuitId)
      circuitManager.importState(currentState)
    }

    // Ensure we're loading into the correct circuit context
    // Create a new circuit or use the active circuit appropriately
    let targetCircuit = circuitManager.activeCircuit.value

    // If the loaded circuit has a different name than the active circuit,
    // we should create a new circuit or rename the active circuit
    if (targetCircuit && circuitData.name && circuitData.name !== targetCircuit.name) {
      // Check if any of the schematic components reference the current active circuit
      const hasConflict = circuitData.components?.some(component => {
        if (component.type === 'schematic-component') {
          const circuitId = component.props?.circuitId || component.circuitId
          return circuitId === targetCircuit.id
        }
        return false
      })

      if (hasConflict) {
        // Create a new circuit for the loaded data to avoid conflicts
        const newCircuitName = circuitData.name || `Circuit${Date.now()}`
        targetCircuit = circuitManager.createCircuit(newCircuitName, {
          label: circuitData.label || newCircuitName
        })
      }
    }

    // Apply circuit properties to the target circuit
    if (targetCircuit) {
      if (circuitData.name) {
        targetCircuit.name = circuitData.name
      }
      if (circuitData.label) {
        targetCircuit.label = circuitData.label
      }
      if (circuitData.interface) {
        targetCircuit.properties = targetCircuit.properties || {}
        targetCircuit.properties.interface = circuitData.interface
      }
    }

    // Load components
    if (circuitData.components) {
      circuitData.components.forEach(component => {
        canvasRef.loadComponent(component)
      })
    }

    // Load wires
    if (circuitData.wires) {
      circuitData.wires.forEach(wire => {
        canvasRef.addWire(wire)
      })
    }

    // Load wire junctions
    if (circuitData.wireJunctions) {
      circuitData.wireJunctions.forEach(junction => {
        canvasRef.addWireJunction(junction)
      })
    }
    
    // Reset loading state
    if (canvasRef.setLoadingState) {
      canvasRef.setLoadingState(false)
    }
    
  }

  /**
   * Handle drag and drop of circuit files
   */
  async function handleDroppedFile(canvasRef, file) {
    try {
      const fileContent = await file.text()
      const circuitData = parseAndValidateJSON(fileContent)

      // Check if current circuit has any components
      const hasExistingCircuit = canvasRef?.components?.length > 0 || canvasRef?.wires?.length > 0

      if (hasExistingCircuit) {
        showConfirmation({
          title: 'Replace Circuit?',
          message: 'This will replace your current circuit. Are you sure you want to continue?',
          type: 'warning',
          onAccept: () => {
            // Complete replacement: clear all schematic components to prevent ID conflicts
            circuitManager.availableComponents.value.clear()

            // Also clear any other circuits that might have conflicting IDs
            // Keep only the currently active circuit, but clear its contents
            const activeCircuitId = circuitManager.activeTabId.value
            if (activeCircuitId) {
              const activeCircuit = circuitManager.getCircuit(activeCircuitId)
              if (activeCircuit) {
                // Clear all other circuits except the active one
                for (const [circuitId] of circuitManager.allCircuits.value) {
                  if (circuitId !== activeCircuitId) {
                    circuitManager.allCircuits.value.delete(circuitId)
                  }
                }
              }
            }

            loadCircuitData(canvasRef, circuitData)
          }
        })
      } else {
        // Complete replacement even when no existing circuit
        circuitManager.availableComponents.value.clear()

        const activeCircuitId = circuitManager.activeTabId.value
        if (activeCircuitId) {
          const activeCircuit = circuitManager.getCircuit(activeCircuitId)
          if (activeCircuit) {
            for (const [circuitId] of circuitManager.allCircuits.value) {
              if (circuitId !== activeCircuitId) {
                circuitManager.allCircuits.value.delete(circuitId)
              }
            }
          }
        }

        loadCircuitData(canvasRef, circuitData)
      }
    } catch (error) {
      console.error('Error loading dropped file:', error)
      alert('Error loading circuit: ' + error.message)
    }
  }

  /**
   * Show confirmation dialog
   */
  function showConfirmation({
    title,
    message,
    type = 'warning',
    acceptLabel,
    showCancel,
    onAccept,
    onReject
  }) {
    confirmDialog.value = {
      title,
      message,
      type,
      acceptLabel,
      showCancel,
      acceptCallback: onAccept || (() => {}),
      rejectCallback: onReject || (() => {})
    }
    showConfirmDialog.value = true
  }

  /**
   * Check if there's unsaved work
   */
  function hasUnsavedWork(canvasRef) {
    // Check if there are any components or wires in the circuit
    // components and wires are direct reactive properties, not computed refs
    const components = canvasRef?.components || []
    const wires = canvasRef?.wires || []
    return components.length > 0 || wires.length > 0
  }

  /**
   * Handle inspector action events
   */
  function handleInspectorAction(event) {
    const { action, circuit } = event

    switch (action) {
      case 'saveAsComponent':
        if (circuit) {
          const success = circuitManager.saveCircuitAsComponent(circuit.id)
          if (success) {
            console.log(`Circuit ${circuit.name} saved as component`)
          }
        }
        break

      case 'deleteComponent':
        if (circuit) {
          // Check if this circuit is saved as a component
          const isComponent = Array.from(circuitManager.availableComponents.value.values()).some(
            comp => comp.circuitId === circuit.id
          )

          if (isComponent) {
            // Show confirmation dialog
            showConfirmation({
              title: 'Delete Component',
              message: `Are you sure you want to delete the component "${circuit.name || circuit.label}"? This will remove it from the available components list.`,
              type: 'warning',
              acceptLabel: 'Delete',
              showCancel: true,
              onAccept: () => {
                // Delete the component
                circuitManager.removeCircuitComponent(circuit.id)
                console.log(`Component ${circuit.name} deleted`)
              }
            })
          } else {
            console.warn('This circuit is not saved as a component')
          }
        }
        break

      default:
        console.warn('Unknown inspector action:', action)
    }
  }

  return {
    // Simulation state
    isRunning,
    isPyodideLoading,
    isPyodideReady,
    pyodideError,
    pyodide,

    // Confirmation dialog
    showConfirmDialog,
    confirmDialog,

    // Circuit operations
    createNewCircuit,
    runSimulation,
    runCircuitSimulationWithHierarchy,
    stopSimulation,
    saveCircuit,
    openCircuit,
    loadCircuitData,
    handleDroppedFile,
    handleInspectorAction,

    // Utility functions
    showConfirmation,
    hasUnsavedWork
  }
}
