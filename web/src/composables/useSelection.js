import { ref, computed } from 'vue'
import { componentRegistry } from '../utils/componentRegistry'

export function useSelection(components, wires) {
  // Selection state
  const selectedComponents = ref(new Set())
  const selectedWires = ref(new Set())
  
  // Rubber-band selection state
  const isSelecting = ref(false)
  const selectionStart = ref(null)
  const selectionEnd = ref(null)
  const justFinishedSelecting = ref(false)

  // Computed selection rectangle
  const selectionRect = computed(() => {
    if (!isSelecting.value || !selectionStart.value || !selectionEnd.value) return null
    
    const x1 = Math.min(selectionStart.value.x, selectionEnd.value.x)
    const y1 = Math.min(selectionStart.value.y, selectionEnd.value.y)
    const x2 = Math.max(selectionStart.value.x, selectionEnd.value.x)
    const y2 = Math.max(selectionStart.value.y, selectionEnd.value.y)
    
    return {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1
    }
  })

  // Start rubber-band selection
  function startSelection(pos, clearExisting = true) {
    isSelecting.value = true
    selectionStart.value = pos
    selectionEnd.value = pos
    
    if (clearExisting) {
      selectedComponents.value.clear()
      selectedWires.value.clear()
    }
  }

  // Update selection during drag
  function updateSelectionEnd(pos) {
    if (!isSelecting.value) return
    selectionEnd.value = pos
    updateSelection()
  }

  // Finish selection
  function endSelection() {
    if (!isSelecting.value) return
    
    isSelecting.value = false
    justFinishedSelecting.value = true
    updateSelection()
    selectionStart.value = null
    selectionEnd.value = null
  }

  // Update which components/wires are selected based on selection rectangle
  function updateSelection() {
    if (!selectionRect.value) return
    
    const rect = selectionRect.value
    
    // Don't update if the rectangle is too small
    if (rect.width < 5 && rect.height < 5) return
    
    // Select components within the rectangle
    components.value.forEach(comp => {
      const config = componentRegistry[comp.type]
      if (!config) return
      
      // Get the visual center from the component registry
      let center
      if (config.getCenter) {
        // Use dynamic center if available
        center = config.getCenter(comp.props)
      } else {
        // Use static center
        center = config.center || { x: 0, y: 0 }
      }
      const checkX = comp.x + center.x
      const checkY = comp.y + center.y
      
      // Check if the component's visual center is within the selection rectangle
      if (checkX >= rect.x && 
          checkX <= rect.x + rect.width &&
          checkY >= rect.y && 
          checkY <= rect.y + rect.height) {
        selectedComponents.value.add(comp.id)
      }
    })
    
    // Select wires that have both endpoints within the selection rectangle
    wires.value.forEach((wire, index) => {
      const firstPoint = wire.points[0]
      const lastPoint = wire.points[wire.points.length - 1]
      
      if (firstPoint.x >= rect.x && 
          firstPoint.x <= rect.x + rect.width &&
          firstPoint.y >= rect.y && 
          firstPoint.y <= rect.y + rect.height &&
          lastPoint.x >= rect.x && 
          lastPoint.x <= rect.x + rect.width &&
          lastPoint.y >= rect.y && 
          lastPoint.y <= rect.y + rect.height) {
        selectedWires.value.add(index)
      }
    })
  }

  // Select/deselect a single component
  function selectComponent(componentId, isMultiSelect = false) {
    if (!isMultiSelect) {
      selectedComponents.value.clear()
      selectedWires.value.clear()
    }
    
    if (selectedComponents.value.has(componentId)) {
      selectedComponents.value.delete(componentId)
    } else {
      selectedComponents.value.add(componentId)
    }
  }

  // Select/deselect a single wire
  function selectWire(wireIndex, isMultiSelect = false) {
    if (!isMultiSelect) {
      selectedComponents.value.clear()
      selectedWires.value.clear()
    }
    
    if (selectedWires.value.has(wireIndex)) {
      selectedWires.value.delete(wireIndex)
    } else {
      selectedWires.value.add(wireIndex)
    }
  }

  // Clear all selections
  function clearSelection() {
    selectedComponents.value.clear()
    selectedWires.value.clear()
  }

  // Delete selected items
  function deleteSelected() {
    // Delete selected components
    components.value = components.value.filter(comp => 
      !selectedComponents.value.has(comp.id)
    )
    
    // Delete selected wires (in reverse order to maintain indices)
    const wireIndicesToDelete = Array.from(selectedWires.value).sort((a, b) => b - a)
    wireIndicesToDelete.forEach(index => {
      wires.value.splice(index, 1)
    })
    
    clearSelection()
  }

  // Check if we just finished selecting (for click handling)
  function checkAndClearJustFinished() {
    if (justFinishedSelecting.value) {
      justFinishedSelecting.value = false
      return true
    }
    return false
  }

  return {
    // State
    selectedComponents,
    selectedWires,
    isSelecting,
    selectionRect,
    justFinishedSelecting,
    
    // Methods
    startSelection,
    updateSelectionEnd,
    endSelection,
    selectComponent,
    selectWire,
    clearSelection,
    deleteSelected,
    checkAndClearJustFinished
  }
}