import { ref, computed } from 'vue'
import { componentRegistry } from '../utils/componentRegistry'

/**
 * Canvas Interactions - UI interaction logic for circuit canvas
 * Provides controller layer functionality for canvas user interactions
 */
export function useCanvasInteractions(circuitManager, canvasOperations, wireManagement, selection, dragAndDrop) {
  const { getMousePos, snapToGrid, gridSize } = canvasOperations
  const { clearSelection, selectComponent, deleteSelected, checkAndClearJustFinished } = selection
  const { startWireDrawing, completeWire, addWireWaypoint, cancelWireDrawing, drawingWire } = wireManagement
  const { isDragging, updateDrag, endDrag } = dragAndDrop
  const { activeCircuit, addComponent } = circuitManager
  
  // Track last component position for intelligent placement
  const lastComponentPosition = ref({ x: 100, y: 100 })
  
  // Junction mode tracking for Alt key feedback
  const isJunctionMode = ref(false)
  const junctionPreview = ref(null)
  const connectionPreview = ref(null)
  
  // Store the last hovered wire for re-evaluation when mode changes
  let lastHoveredWireIndex = null
  
  /**
   * Handle canvas click events
   */
  function handleCanvasClick(event) {
    // Ignore clicks if we just finished selecting
    if (checkAndClearJustFinished()) {
      return
    }
    
    const target = event.target
    
    // Check if we clicked on a connection point
    if (target.classList.contains('connection-point')) {
      const componentId = target.dataset.componentId
      const portIndex = parseInt(target.dataset.port)
      const portType = target.dataset.type // 'input' or 'output'
      const pos = getMousePos(event)
      
      if (!drawingWire.value) {
        // Clear selection when starting to draw a wire
        clearSelection()
        // Start drawing a wire
        startWireDrawing(componentId, portIndex, portType, pos)
      } else {
        // Complete the wire if clicking on a compatible connection
        completeWire(componentId, portIndex, portType)
      }
      return
    }
    
    // If drawing a wire and clicked elsewhere, add a waypoint
    if (drawingWire.value) {
      const pos = getMousePos(event)
      addWireWaypoint(pos)
      return
    }
    
    // Otherwise, clicking on canvas deselects all
    if (target === event.currentTarget) {
      clearSelection()
    }
  }
  
  /**
   * Handle canvas mouse down events
   */
  function handleCanvasMouseDown(event) {
    // Only start selection on the canvas itself, not on components
    if (event.target === event.currentTarget && !drawingWire.value) {
      const pos = getMousePos(event)
      const clearExisting = !event.shiftKey && !event.metaKey && !event.ctrlKey
      selection.startSelection(pos, clearExisting)
      event.preventDefault()
    }
  }
  
  /**
   * Handle mouse move events
   */
  function handleMouseMove(event) {
    // Always update current mouse position for wire preview
    const pos = getMousePos(event)
    wireManagement.currentMousePos.value = pos
    
    // Track which wire is being hovered for junction mode
    const target = event.target
    if (target && target.classList.contains('wire-segment')) {
      const wireElement = target.closest('[data-wire-index]')
      if (wireElement) {
        lastHoveredWireIndex = parseInt(wireElement.dataset.wireIndex)
      }
    } else {
      lastHoveredWireIndex = null
    }
    
    // Handle junction preview when Alt is held
    if (isJunctionMode.value) {
      updateJunctionPreview(event, pos)
      connectionPreview.value = null // Clear connection preview in junction mode
    } else {
      junctionPreview.value = null
      
      // Handle connection preview when drawing a wire
      if (drawingWire.value) {
        updateConnectionPreview(event, pos)
      } else {
        connectionPreview.value = null
      }
    }
    
    // Handle rubber-band selection
    if (selection.isSelecting.value) {
      selection.updateSelectionEnd(pos)
      return
    }
    
    // Handle dragging
    if (isDragging()) {
      updateDrag(pos)
    }
  }
  
  /**
   * Handle mouse up events
   */
  function handleMouseUp() {
    // End dragging
    if (isDragging()) {
      const wasComponentDrag = !dragAndDrop.dragging.value?.isWireDrag
      endDrag(snapToGrid)
      
      // Update last component position if we were dragging components
      if (wasComponentDrag && selection.selectedComponents.value.size > 0) {
        // Use the position of any selected component as the new reference
        const selectedId = Array.from(selection.selectedComponents.value)[0]
        const selectedComponent = activeCircuit.value?.components.find(c => c.id === selectedId)
        if (selectedComponent) {
          lastComponentPosition.value = { x: selectedComponent.x, y: selectedComponent.y }
        }
      }
    }
    
    // End rubber-band selection
    if (selection.isSelecting.value) {
      selection.endSelection()
    }
  }
  
  /**
   * Handle key down events
   */
  function handleKeyDown(event) {
    // Handle Alt key for junction mode
    if (event.altKey && !isJunctionMode.value) {
      isJunctionMode.value = true
      updatePreviewsOnModeChange()
    }
    
    // Check if an input field is focused
    const activeElement = document.activeElement
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true' ||
      activeElement.classList.contains('p-inputtext') ||
      activeElement.classList.contains('p-inputnumber-input')
    )
    
    // Delete selected components and wires (only if not typing in an input)
    if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputFocused) {
      deleteSelected()
    }
    
    // Cancel wire drawing with Escape
    if (event.key === 'Escape' && drawingWire.value) {
      cancelWireDrawing()
    }
  }
  
  /**
   * Handle key up events
   */
  function handleKeyUp(event) {
    // Handle Alt key for junction mode
    if (!event.altKey && isJunctionMode.value) {
      isJunctionMode.value = false
      updatePreviewsOnModeChange()
    }
  }
  
  /**
   * Update junction preview
   */
  function updateJunctionPreview(event, mousePos) {
    // Check if hovering over a wire
    const target = event.target
    if (target && target.classList.contains('wire-segment')) {
      // Find which wire is being hovered
      const wireElement = target.closest('[data-wire-index]')
      if (wireElement) {
        const wireIndex = parseInt(wireElement.dataset.wireIndex)
        const junctionPos = wireManagement.findClosestGridPointOnWire(wireIndex, mousePos)
        if (junctionPos) {
          junctionPreview.value = junctionPos
          return
        }
      }
    }
    
    // If not hovering over a wire, clear preview
    junctionPreview.value = null
  }
  
  /**
   * Update connection preview
   */
  function updateConnectionPreview(event, mousePos) {
    // Check if hovering over a connection point
    const target = event.target
    if (target && target.classList.contains('connection-point')) {
      const componentId = target.dataset.componentId
      const portIndex = parseInt(target.dataset.port)
      const portType = target.dataset.type
      
      // Check if this is a valid connection (different port type than what we started with)
      if (wireManagement.startConnection.value && wireManagement.startConnection.value.portType !== portType) {
        // Find the component to get the connection position
        const component = activeCircuit.value?.components.find(c => c.id === componentId)
        if (component) {
          const config = componentRegistry[component.type]
          let connections
          if (config.getConnections) {
            connections = config.getConnections(component.props)
          } else {
            connections = config.connections
          }
          
          const connectionPoint = portType === 'output' ? 
            connections.outputs?.[portIndex] : 
            connections.inputs?.[portIndex]
            
          if (connectionPoint) {
            connectionPreview.value = {
              x: component.x + connectionPoint.x,
              y: component.y + connectionPoint.y
            }
            return
          }
        }
      }
    }
    
    // If not hovering over a valid connection point, clear preview
    connectionPreview.value = null
  }
  
  /**
   * Update previews when junction mode changes while mouse is stationary
   */
  function updatePreviewsOnModeChange() {
    if (wireManagement.currentMousePos.value) {
      if (isJunctionMode.value && lastHoveredWireIndex !== null) {
        // Show junction preview for the last hovered wire
        const junctionPos = wireManagement.findClosestGridPointOnWire(lastHoveredWireIndex, wireManagement.currentMousePos.value)
        if (junctionPos) {
          junctionPreview.value = junctionPos
        }
        connectionPreview.value = null
      } else {
        junctionPreview.value = null
        connectionPreview.value = null
      }
    }
  }
  
  /**
   * Handle wire click events
   */
  function handleWireClick(index, event) {
    // If we're drawing a wire and Alt is held, complete it with a junction
    if (drawingWire.value && event.altKey) {
      const pos = getMousePos(event)
      const junctionPos = wireManagement.findClosestGridPointOnWire(index, pos)
      
      if (junctionPos) {
        // Complete the wire at this junction
        wireManagement.completeWireAtJunction(index, junctionPos)
      }
    } 
    // If not drawing and Alt is held, start from junction
    else if (!drawingWire.value && event.altKey) {
      const pos = getMousePos(event)
      const junctionPos = wireManagement.findClosestGridPointOnWire(index, pos)
      
      if (junctionPos) {
        // Start drawing a new wire from this junction
        wireManagement.startWireFromJunction(index, junctionPos)
      }
    } else {
      // Normal selection behavior with Command/Ctrl for multi-select
      const isMultiSelect = event.metaKey || event.ctrlKey
      selection.selectWire(index, isMultiSelect)
    }
    // Stop propagation to prevent canvas click handler
    event.stopPropagation()
  }
  
  /**
   * Handle wire mouse down events
   */
  function handleWireMouseDown(wireIndex, event) {
    // Only start drag if the wire is selected
    if (!selection.selectedWires.value.has(wireIndex)) return
    
    event.stopPropagation()
    
    // Get mouse position
    const pos = getMousePos(event)
    const wire = activeCircuit.value?.wires[wireIndex]
    if (!wire || wire.points.length === 0) return
    
    dragAndDrop.startWireDrag(wireIndex, {
      id: `wire_drag_${wireIndex}`,
      offsetX: pos.x - wire.points[0].x,
      offsetY: pos.y - wire.points[0].y
    })
  }
  
  /**
   * Add component at smart position
   */
  function addComponentAtSmartPosition(type, customProps = {}) {
    // Ensure we have a current circuit to add components to
    if (!activeCircuit.value) {
      console.warn('No current circuit available for component insertion')
      return null
    }
    
    // Use last component position with offset (5 grid units down)
    const x = lastComponentPosition.value.x
    const y = lastComponentPosition.value.y + (gridSize.value * 5)
    const snapped = snapToGrid({ x, y })
    
    // Get component configuration
    const config = componentRegistry[type]
    if (!config) return null
    
    // Count existing components of this type to generate unique ID
    const existingOfType = activeCircuit.value.components.filter(c => c.type === type).length
    const id = `${type}_${existingOfType + 1}`
    
    // Create new component
    const newComponent = {
      id,
      type,
      x: snapped.x,
      y: snapped.y,
      props: { ...config.defaultProps, ...customProps }
    }
    
    // Handle special component types with onCreate
    if (config.onCreate) {
      if (type === 'input') {
        const inputCount = activeCircuit.value.components.filter(c => c.type === 'input').length
        config.onCreate(newComponent, inputCount)
      } else if (type === 'output') {
        const outputCount = activeCircuit.value.components.filter(c => c.type === 'output').length
        config.onCreate(newComponent, outputCount)
      }
    }
    
    // Add to current circuit
    addComponent(newComponent)
    
    // Update last component position
    lastComponentPosition.value = { x: snapped.x, y: snapped.y }
    
    // Clear existing selection and select the new component
    clearSelection()
    selectComponent(newComponent.id)
    
    return newComponent
  }
  
  return {
    // State
    lastComponentPosition,
    isJunctionMode,
    junctionPreview,
    connectionPreview,
    
    // Event handlers
    handleCanvasClick,
    handleCanvasMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    handleKeyUp,
    handleWireClick,
    handleWireMouseDown,
    
    // Component operations
    addComponentAtSmartPosition
  }
}