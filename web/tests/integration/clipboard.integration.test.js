import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useCanvasController } from '@/composables/useCanvasController'
import { useCircuitModel } from '@/composables/useCircuitModel'
import { useClipboard } from '@/composables/useClipboard'

describe('Clipboard Integration Tests', () => {
  let circuitModel
  let canvasController
  let activeCircuit

  beforeEach(() => {
    // Create real circuit model
    circuitModel = useCircuitModel()
    activeCircuit = circuitModel.activeCircuit

    // Create minimal mocks for canvas operations
    const mockCanvasOperations = {
      getMousePos: () => ({ x: 100, y: 200 }),
      snapToGrid: (pos) => ({ x: Math.round(pos.x / 15) * 15, y: Math.round(pos.y / 15) * 15 }),
      gridSize: 15
    }

    // Create minimal mocks for other dependencies
    const mockWireManagement = {
      startWireDrawing: () => {},
      completeWire: () => {},
      addWireWaypoint: () => {},
      cancelWireDrawing: () => {},
      drawingWire: ref(false),
      currentMousePos: ref({ x: 0, y: 0 }),
      startConnection: ref(null),
      findClosestGridPointOnWire: () => null,
      completeWireAtJunction: () => {},
      startWireFromJunction: () => {}
    }

    const mockSelection = {
      selectedComponents: ref(new Set()),
      selectedWires: ref(new Set()),
      isSelecting: ref(false),
      selectionRect: ref(null),
      startSelection: () => {},
      updateSelectionEnd: () => {},
      endSelection: () => {},
      selectComponent: (id) => mockSelection.selectedComponents.value.add(id),
      selectWire: (index) => mockSelection.selectedWires.value.add(index),
      clearSelection: () => {
        mockSelection.selectedComponents.value.clear()
        mockSelection.selectedWires.value.clear()
      },
      checkAndClearJustFinished: () => false,
      justFinishedSelecting: ref(false)
    }

    const mockDragAndDrop = {
      isDragging: () => false,
      updateDrag: () => {},
      endDrag: () => {},
      startWireDrag: () => {},
      dragging: ref(null)
    }

    // Create canvas controller with real dependencies
    canvasController = useCanvasController(
      circuitModel,
      mockCanvasOperations,
      mockWireManagement,
      mockSelection,
      mockDragAndDrop
    )

    // Select some components for testing
    const testComponent = {
      id: 'test_input_1',
      type: 'input',
      x: 10,
      y: 10,
      props: { label: 'A', bits: 1 }
    }
    circuitModel.addComponent(testComponent)
    mockSelection.selectComponent(testComponent.id)
  })

  describe('Copy and Paste', () => {
    it('should copy and paste a component', async () => {
      // Copy the selected component
      const copyResult = await canvasController.copySelected()
      expect(copyResult).toBe(true)

      // Clear selection to simulate user clicking elsewhere
      canvasController.selection.clearSelection()

      // Paste the component
      const pasteResult = await canvasController.pasteFromClipboard()
      expect(pasteResult).toBe(true)

      // Verify the circuit now has 2 components
      expect(activeCircuit.value.components.length).toBe(2)
      
      // Verify the pasted component has different ID but same properties
      const pastedComponent = activeCircuit.value.components[1]
      expect(pastedComponent.id).not.toBe('test_input_1')
      expect(pastedComponent.type).toBe('input')
      expect(pastedComponent.props.label).toBe('A')
      expect(pastedComponent.props.bits).toBe(1)
    })

    it('should paste at offset position', async () => {
      // Copy the selected component
      await canvasController.copySelected()

      // Paste the component
      await canvasController.pasteFromClipboard()

      // Verify the pasted component is offset from original
      const originalComponent = activeCircuit.value.components[0]
      const pastedComponent = activeCircuit.value.components[1]
      
      expect(pastedComponent.x).toBeGreaterThan(originalComponent.x)
      expect(pastedComponent.y).toBeGreaterThan(originalComponent.y)
    })
  })

  describe('Cut and Paste', () => {
    it('should cut and paste a component', async () => {
      const originalId = activeCircuit.value.components[0].id

      // Cut the selected component
      const cutResult = await canvasController.cutSelected()
      expect(cutResult).toBe(true)

      // Verify the component is removed
      expect(activeCircuit.value.components.length).toBe(0)

      // Paste the component
      const pasteResult = await canvasController.pasteFromClipboard()
      expect(pasteResult).toBe(true)

      // Verify the circuit has 1 component with new ID
      expect(activeCircuit.value.components.length).toBe(1)
      expect(activeCircuit.value.components[0].id).not.toBe(originalId)
    })
  })

  describe('Duplicate', () => {
    it('should duplicate a component', () => {
      // Duplicate the selected component
      const duplicateResult = canvasController.duplicateSelected()
      expect(duplicateResult).toBe(true)

      // Verify the circuit now has 2 components
      expect(activeCircuit.value.components.length).toBe(2)
      
      // Verify the duplicated component has different ID but same properties
      const originalComponent = activeCircuit.value.components[0]
      const duplicatedComponent = activeCircuit.value.components[1]
      
      expect(duplicatedComponent.id).not.toBe(originalComponent.id)
      expect(duplicatedComponent.type).toBe(originalComponent.type)
      expect(duplicatedComponent.props.label).toBe(originalComponent.props.label)
      expect(duplicatedComponent.props.bits).toBe(originalComponent.props.bits)
    })

    it('should duplicate at offset position', () => {
      // Duplicate the selected component
      canvasController.duplicateSelected()

      // Verify the duplicated component is offset from original
      const originalComponent = activeCircuit.value.components[0]
      const duplicatedComponent = activeCircuit.value.components[1]
      
      expect(duplicatedComponent.x).toBeGreaterThan(originalComponent.x)
      expect(duplicatedComponent.y).toBeGreaterThan(originalComponent.y)
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle copy/paste with wires', async () => {
      // Add another component and a wire
      const outputComponent = {
        id: 'test_output_1',
        type: 'output',
        x: 30,
        y: 10,
        props: { label: 'R', bits: 1 }
      }
      circuitModel.addComponent(outputComponent)
      
      const wire = {
        id: 'wire_1',
        points: [{ x: 15, y: 10 }, { x: 30, y: 10 }],
        startConnection: { componentId: 'test_input_1', port: '0' },
        endConnection: { componentId: 'test_output_1', port: '0' }
      }
      circuitModel.addWire(wire)

      // Select both components and the wire
      canvasController.selection.selectComponent('test_input_1')
      canvasController.selection.selectComponent('test_output_1')
      canvasController.selection.selectedWires.value.add(0)

      // Copy selection
      await canvasController.copySelected()

      // Paste
      await canvasController.pasteFromClipboard()

      // Verify we have 4 components and 2 wires
      expect(activeCircuit.value.components.length).toBe(4)
      expect(activeCircuit.value.wires.length).toBe(2)

      // Verify the pasted wire connects the pasted components
      const pastedWire = activeCircuit.value.wires[1]
      expect(pastedWire.startConnection.componentId).not.toBe('test_input_1')
      expect(pastedWire.endConnection.componentId).not.toBe('test_output_1')
    })

    it('should handle multiple paste operations', async () => {
      // Copy the selected component
      await canvasController.copySelected()

      // Paste multiple times
      await canvasController.pasteFromClipboard()
      
      // Wait to avoid debounce
      await new Promise(resolve => setTimeout(resolve, 150))
      
      await canvasController.pasteFromClipboard()

      // Verify we have 3 components total
      expect(activeCircuit.value.components.length).toBe(3)
    })
  })

  describe('Error Cases', () => {
    it('should handle paste with no clipboard data', async () => {
      // Don't copy anything first
      const result = await canvasController.pasteFromClipboard()
      
      expect(result).toBe(false)
      expect(activeCircuit.value.components.length).toBe(1) // Original component only
    })

    it('should handle duplicate with no selection', () => {
      // Clear selection
      canvasController.selection.clearSelection()

      const result = canvasController.duplicateSelected()
      
      expect(result).toBe(false)
      expect(activeCircuit.value.components.length).toBe(1) // Original component only
    })
  })
})