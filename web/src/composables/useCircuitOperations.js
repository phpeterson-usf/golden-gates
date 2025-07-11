import { ref } from 'vue'
import { useFileOperations } from './useFileOperations'
import { usePyodide } from './usePyodide'
import { writeAllCircuitComponentsToPyodideMemfs, configurePythonImportPathForMemfs, executePythonProgramInPyodide } from './usePyodideMemfs'

/**
 * Circuit Operations - Business logic for circuit management
 * Provides controller layer functionality for circuit operations
 */
export function useCircuitOperations(circuitManager) {
  const { saveCircuit: saveCircuitFile, openCircuit: openCircuitFile, parseAndValidateJSON } = useFileOperations()
  const { initialize: initializePyodide, runPython, isLoading: isPyodideLoading, isReady: isPyodideReady, error: pyodideError, pyodide } = usePyodide()
  
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
              type: 'error',
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
    
    try {
      // Initialize Pyodide if not already initialized
      if (!isPyodideReady.value) {
        console.log('Initializing Pyodide...')
        await initializePyodide()
      }
      
      // Get the actual Pyodide instance (not the reactive wrapper)
      const pyodideInstance = pyodide.value
      
      // Step 1: Write all saved circuit components as Python modules to MEMFS
      console.log('Writing circuit components to Pyodide MEMFS...')
      await writeAllCircuitComponentsToPyodideMemfs(circuitManager, pyodideInstance)
      
      // Step 2: Configure Python import path for MEMFS (optional - MEMFS might already be in path)
      try {
        configurePythonImportPathForMemfs(pyodideInstance)
      } catch (e) {
        console.warn('Could not configure Python import path, continuing anyway:', e)
      }
      
      // Step 3: Generate GGL program for the current circuit
      const mainCircuitGglProgram = generateGglProgramForCurrentCircuit(canvasRef)
      
      if (!mainCircuitGglProgram || mainCircuitGglProgram.trim() === '') {
        console.log('No components in circuit')
        return
      }
      
      console.log('Generated hierarchical GGL program:')
      console.log(mainCircuitGglProgram)
      
      // Step 4: Set up callback for Python to update Vue components
      setupPythonVueUpdateCallback(canvasRef)
      
      // Step 5: Execute the complete hierarchical circuit program
      await executePythonProgramInPyodide(mainCircuitGglProgram, pyodideInstance)
      
      console.log('Hierarchical circuit simulation completed successfully')
      
    } catch (err) {
      console.error('Hierarchical circuit simulation error:', err)
      // TODO: Show error to user with more specific error handling
    } finally {
      isRunning.value = false
    }
  }
  
  /**
   * Generate GGL program for the current circuit (with hierarchical support)
   */
  function generateGglProgramForCurrentCircuit(canvasRef) {
    const components = canvasRef?.components || []
    const wires = canvasRef?.wires || []
    const wireJunctions = canvasRef?.wireJunctions || []
    const componentRefs = canvasRef?.componentRefs || {}
    const componentInstances = canvasRef?.componentInstances || {}
    
    return canvasRef?.getCircuitData() || ''
  }
  
  /**
   * Set up the callback for Python to update Vue components
   */
  function setupPythonVueUpdateCallback(canvasRef) {
    window.__vueUpdateCallback = (componentId, value) => {
      console.log(`Output ${componentId} updated to ${value}`)
      // Update the component in the canvas
      if (canvasRef) {
        const component = canvasRef.components.find(c => c.id === componentId)
        if (component && component.type === 'output') {
          // Create a new component object to ensure Vue detects the change
          const updatedComponent = {
            ...component,
            props: {
              ...component.props,
              value: value
            }
          }
          canvasRef.updateComponent(updatedComponent)
        }
      }
    }
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
    console.log('Stopping simulation...')
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
      
      await saveCircuitFile(components, wires, wireJunctions)
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
      const hasExistingCircuit = canvasRef?.components?.length > 0 || 
                                canvasRef?.wires?.length > 0
      
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
    
    console.log('Circuit loaded successfully')
  }
  
  /**
   * Handle drag and drop of circuit files
   */
  async function handleDroppedFile(canvasRef, file) {
    try {
      const fileContent = await file.text()
      const circuitData = parseAndValidateJSON(fileContent)
      
      // Check if current circuit has any components
      const hasExistingCircuit = canvasRef?.components?.length > 0 || 
                                canvasRef?.wires?.length > 0
      
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
  function showConfirmation({ title, message, type = 'warning', acceptLabel, showCancel, onAccept, onReject }) {
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