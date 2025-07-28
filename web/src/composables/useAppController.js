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

      // Check if the error message contains our exception
      const isCircuitComponentError = err.message && err.message.includes('CircuitComponentError')

      if (isCircuitComponentError) {
        // Try to extract component info from the error message
        // Format: "ggl.errors.CircuitComponentError: And and-gate_1_1753544247799: inputNotConnected (port: 1)"
        const match = err.message.match(
          /CircuitComponentError: (\w+) ([^:]+): (\w+)(?:\s*\(port:\s*([^)]+)\))?/
        )
        if (match) {
          const [, componentType, componentId, errorCode, portName] = match

          const errorData = {
            component_id: componentId,
            component_type: componentType,
            error_code: errorCode,
            severity: 'error',
            port_name: portName || null,
            connected_component_id: null
          }
          handleCircuitComponentError(canvasRef, errorData)
        } else {
          // Could not parse CircuitComponentError, show generic error
          if (canvasRef?.showErrorNotification) {
            canvasRef.showErrorNotification(`Simulation error: ${err.message}`)
          }
        }
      } else {
        // Handle other types of errors
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
    window.__vueUpdateCallback = (eventType, componentId, value) => {
      console.log(`Callback: ${componentId} = ${value}`)

      if (!canvasRef) {
        console.error('No canvasRef available')
        return
      }

      const component = canvasRef.components.find(c => c.id === componentId)
      if (!component) {
        console.error(
          `Component not found: ${componentId}`,
          'Available components:',
          canvasRef.components.map(c => c.id)
        )
        return
      }

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
   * Handle CircuitComponentError exceptions from Python
   */
  function handleCircuitComponentError(canvasRef, errorData) {
    if (!canvasRef) {
      console.error('No canvasRef available')
      return
    }

    // Find the component that has the error
    const component = canvasRef.components.find(c => c.id === errorData.component_id)
    if (!component) {
      console.error(`Component not found: ${errorData.component_id}`)
      return
    }

    // Update component to show error state
    const updatedComponent = {
      ...component,
      props: {
        ...component.props,
        hasError: errorData.severity === 'error',
        hasWarning: errorData.severity === 'warning',
        errorMessageId: errorData.error_code,
        errorDetails: {
          portName: errorData.port_name,
          connectedComponentId: errorData.connected_component_id
        }
      }
    }
    canvasRef.updateComponent(updatedComponent)

    // Show global error notification
    if (canvasRef?.showErrorNotification) {
      const componentLabel = component.props?.label || component.label

      // Get localized error message
      const errorMessageKey = `simulation.errors.${errorData.error_code}`
      const errorMessage = t(errorMessageKey, {
        inputName: errorData.port_name || 'unknown'
      })

      // Format the error message with or without label
      const componentDescription = componentLabel
        ? `${errorData.component_type} "${componentLabel}"`
        : errorData.component_type

      canvasRef.showErrorNotification(`Error in ${componentDescription}: ${errorMessage}`)
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

      // Collect all schematic component definitions used in this circuit
      const usedSchematicComponents = {}
      components.forEach(component => {
        if (component.type === 'schematic-component') {
          const circuitId = component.props?.circuitId || component.circuitId
          const componentDef = circuitManager.getComponentDefinition(circuitId)
          if (componentDef) {
            // Get the full circuit definition
            const circuit = circuitManager.getCircuit(circuitId)
            if (circuit) {
              usedSchematicComponents[circuitId] = {
                definition: componentDef,
                circuit: circuit
              }
            }
          }
        }
      })

      await saveCircuitFile(
        components,
        wires,
        wireJunctions,
        circuitMetadata,
        usedSchematicComponents
      )
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

    // Clear existing circuit
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
          onAccept: () => loadCircuitData(canvasRef, circuitData)
        })
      } else {
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
   * Handle before unload event
   */
  function handleBeforeUnload(canvasRef, event) {
    if (hasUnsavedWork(canvasRef)) {
      // Modern browsers ignore custom messages for security reasons
      // They show a generic "Leave site?" dialog instead
      event.preventDefault()
      event.returnValue = '' // Chrome requires this
      return '' // Some browsers need this
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
    hasUnsavedWork,
    handleBeforeUnload
  }
}
