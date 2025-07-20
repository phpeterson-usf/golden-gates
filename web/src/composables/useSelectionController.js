import { ref, computed } from 'vue'
import { componentRegistry } from '../utils/componentRegistry'
import { GRID_SIZE } from '../utils/constants'

export function useSelectionController(
  components,
  wires,
  onWiresDeleted = null,
  onComponentsDeleted = null,
  onWireDelete = null
) {
  // Selection state
  const selectedComponents = ref(new Set())
  const selectedWires = ref(new Set())

  // Rubber-band selection state
  const isSelecting = ref(false)
  const selectionStart = ref(null)
  const selectionEnd = ref(null)
  const justFinishedSelecting = ref(false)
  const isMultiSelectMode = ref(false)
  const selectionSnapshot = ref(null)

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
    isMultiSelectMode.value = !clearExisting

    if (clearExisting) {
      selectedComponents.value.clear()
      selectedWires.value.clear()
      selectionSnapshot.value = null
    } else {
      // In multi-select mode, capture current selection as snapshot
      selectionSnapshot.value = {
        components: new Set(selectedComponents.value),
        wires: new Set(selectedWires.value)
      }
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

    // Clean up selection state
    selectionStart.value = null
    selectionEnd.value = null
    isMultiSelectMode.value = false
    selectionSnapshot.value = null
  }

  // Update which components/wires are selected based on selection rectangle
  function updateSelection() {
    if (!selectionRect.value) return

    const rect = selectionRect.value

    // Don't update if the rectangle is too small
    if (rect.width < 5 && rect.height < 5) return

    // Find components currently within the selection rectangle
    const componentsInRect = new Set()
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
      // Convert component position from grid units to pixels, then add pixel-based center offset
      const checkX = comp.x * GRID_SIZE + center.x
      const checkY = comp.y * GRID_SIZE + center.y

      // Check if the component's visual center is within the selection rectangle
      if (
        checkX >= rect.x &&
        checkX <= rect.x + rect.width &&
        checkY >= rect.y &&
        checkY <= rect.y + rect.height
      ) {
        componentsInRect.add(comp.id)
      }
    })

    // Find wires currently within the selection rectangle
    const wiresInRect = new Set()
    wires.value.forEach((wire, index) => {
      const firstPoint = wire.points[0]
      const lastPoint = wire.points[wire.points.length - 1]

      // Calculate the visual center (midpoint) of the wire
      const centerX = (firstPoint.x + lastPoint.x) / 2
      const centerY = (firstPoint.y + lastPoint.y) / 2

      // Convert wire center from grid units to pixels for comparison with selection rectangle
      const centerPixels = { x: centerX * GRID_SIZE, y: centerY * GRID_SIZE }

      // Check if the wire's visual center is within the selection rectangle
      if (
        centerPixels.x >= rect.x &&
        centerPixels.x <= rect.x + rect.width &&
        centerPixels.y >= rect.y &&
        centerPixels.y <= rect.y + rect.height
      ) {
        wiresInRect.add(index)
      }
    })

    if (isMultiSelectMode.value && selectionSnapshot.value) {
      // Multi-select mode: combine previous selection with current rectangle selection
      const newSelectedComponents = new Set(selectionSnapshot.value.components)
      const newSelectedWires = new Set(selectionSnapshot.value.wires)

      // Add items that are in the current rectangle
      componentsInRect.forEach(id => newSelectedComponents.add(id))
      wiresInRect.forEach(index => newSelectedWires.add(index))

      selectedComponents.value = newSelectedComponents
      selectedWires.value = newSelectedWires
    } else {
      // Single-select mode: selection is exactly what's in the rectangle
      selectedComponents.value = componentsInRect
      selectedWires.value = wiresInRect
    }
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
    // Delete selected components via callback
    if (onComponentsDeleted && selectedComponents.value.size > 0) {
      const componentIdsToDelete = Array.from(selectedComponents.value)
      onComponentsDeleted(componentIdsToDelete)
    }

    // Delete selected wires (in reverse order to maintain indices)
    const wireIndicesToDelete = Array.from(selectedWires.value).sort((a, b) => b - a)

    if (wireIndicesToDelete.length > 0) {
      // Get wire IDs before deletion if callback provided
      const deletedWireIds = onWiresDeleted
        ? wireIndicesToDelete.map(index => wires.value[index]?.id).filter(id => id)
        : []

      // Delete wires via callback if provided
      if (onWireDelete) {
        wireIndicesToDelete.forEach(index => {
          onWireDelete(index)
        })
      }

      // Call the callback to handle junction cleanup
      if (onWiresDeleted) {
        onWiresDeleted(wireIndicesToDelete, deletedWireIds)
      }
    }

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
