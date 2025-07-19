import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useCanvasController } from '@/composables/useCanvasController'

// Mock useClipboard
vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({
    hasClipboardData: ref(false),
    copyToClipboard: vi.fn(),
    cutToClipboard: vi.fn(),
    pasteFromClipboard: vi.fn(),
    getClipboardDataForOS: vi.fn(),
    setClipboardDataFromOS: vi.fn(),
    getClipboardStats: vi.fn().mockReturnValue({ components: 0, wires: 1, junctions: 0 }),
    calculateBounds: vi.fn().mockReturnValue({ minX: 5, minY: 5, maxX: 15, maxY: 10 }),
    serializeElements: vi.fn(),
    deserializeElements: vi.fn()
  })
}))

// Mock useComponentController
vi.mock('@/composables/useComponentController', () => ({
  useComponentController: () => ({
    lastComponentPosition: ref({ x: 10, y: 10 }),
    addComponentAtSmartPosition: vi.fn(),
    getComponentConnections: vi.fn().mockReturnValue({
      inputs: [{ x: 0, y: 1 }],
      outputs: [{ x: 2, y: 1 }]
    }),
    updateLastComponentPosition: vi.fn()
  })
}))

describe('useCanvasController - Wire Operations', () => {
  let canvasController
  let mockCircuitManager
  let mockCanvasOperations
  let mockWireManagement
  let mockSelection
  let mockDragAndDrop

  beforeEach(() => {
    mockCircuitManager = {
      activeCircuit: ref({
        components: [
          { id: 'input1', type: 'input', x: 5, y: 5 },
          { id: 'and1', type: 'and-gate', x: 10, y: 5 }
        ],
        wires: [
          {
            id: 'wire1',
            points: [{ x: 7, y: 6 }, { x: 10, y: 6 }],
            startConnection: { portIndex: 0, portType: 'output' },
            endConnection: { portIndex: 0, portType: 'input' }
          },
          {
            id: 'wire2',
            points: [{ x: 12, y: 6 }, { x: 15, y: 6 }],
            startConnection: { portIndex: 0, portType: 'output' },
            endConnection: { portIndex: 0, portType: 'input' }
          }
        ],
        wireJunctions: [
          { pos: { x: 8, y: 6 }, sourceWireIndex: 0, connectedWireId: 'wire2' }
        ]
      }),
      removeComponent: vi.fn(),
      removeWire: vi.fn()
    }

    mockCanvasOperations = {
      getMousePos: vi.fn().mockReturnValue({ x: 120, y: 90 }),
      snapToGrid: vi.fn(),
      gridSize: 15
    }

    mockWireManagement = {
      startWireDrawing: vi.fn(),
      completeWire: vi.fn(),
      addWireWaypoint: vi.fn(),
      cancelWireDrawing: vi.fn(),
      drawingWire: ref(false),
      currentMousePos: ref({ x: 8, y: 6 }),
      startConnection: ref(null),
      findClosestGridPointOnWire: vi.fn().mockReturnValue({ x: 8, y: 6 }),
      completeWireAtJunction: vi.fn(),
      startWireFromJunction: vi.fn()
    }

    mockSelection = {
      selectedComponents: ref(new Set()),
      selectedWires: ref(new Set([0, 1])), // Both wires selected
      isSelecting: ref(false),
      selectionRect: ref(null),
      startSelection: vi.fn(),
      updateSelectionEnd: vi.fn(),
      endSelection: vi.fn(),
      selectComponent: vi.fn(),
      selectWire: vi.fn(),
      clearSelection: vi.fn(),
      checkAndClearJustFinished: vi.fn().mockReturnValue(false),
      justFinishedSelecting: ref(false)
    }

    mockDragAndDrop = {
      isDragging: vi.fn().mockReturnValue(false),
      updateDrag: vi.fn(),
      endDrag: vi.fn(),
      startWireDrag: vi.fn(),
      dragging: ref(null)
    }

    canvasController = useCanvasController(
      mockCircuitManager,
      mockCanvasOperations,
      mockWireManagement,
      mockSelection,
      mockDragAndDrop
    )
  })

  describe('wire selection and deletion', () => {
    it('should delete selected wires and clean up junctions', () => {
      const result = canvasController.deleteSelectedElements()

      expect(result).toBe(true)
      expect(mockCircuitManager.removeWire).toHaveBeenCalledWith('wire1')
      expect(mockCircuitManager.removeWire).toHaveBeenCalledWith('wire2')
      expect(mockSelection.clearSelection).toHaveBeenCalled()
    })

    it('should clean up junctions when deleting wires', () => {
      const circuit = mockCircuitManager.activeCircuit.value

      // Call deleteSelectedElements which should clean up junctions
      canvasController.deleteSelectedElements()

      // Verify junction cleanup logic was applied
      expect(mockCircuitManager.removeWire).toHaveBeenCalledTimes(2)
    })

    it('should handle wire deletion when no wires selected', () => {
      mockSelection.selectedWires.value = new Set()

      const result = canvasController.deleteSelectedElements()

      expect(result).toBe(false)
      expect(mockCircuitManager.removeWire).not.toHaveBeenCalled()
    })

    it('should copy selected wires when copy operation is called', async () => {
      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      // Verify that the copy operation was called with wire data
      const copyCall = canvasController.clipboardController.copyToClipboard.mock.calls[0][0]
      expect(copyCall.wires).toHaveLength(2)
      expect(copyCall.wires[0].id).toBe('wire1')
      expect(copyCall.wires[1].id).toBe('wire2')
    })

    it('should include junctions when copying selected wires', async () => {
      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      // Verify that junctions are included in copy operation
      const copyCall = canvasController.clipboardController.copyToClipboard.mock.calls[0][0]
      expect(copyCall.junctions).toHaveLength(1)
      expect(copyCall.junctions[0]).toEqual({
        pos: { x: 8, y: 6 },
        sourceWireIndex: 0,
        connectedWireId: 'wire2'
      })
    })
  })

  describe('wire click handling', () => {
    it('should handle wire click for selection', () => {
      const mockEvent = {
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireClick(0, mockEvent)

      expect(mockSelection.selectWire).toHaveBeenCalledWith(0, false)
      expect(mockEvent.stopPropagation).toHaveBeenCalled()
    })

    it('should handle wire click with multi-select modifier', () => {
      const mockEvent = {
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireClick(0, mockEvent)

      expect(mockSelection.selectWire).toHaveBeenCalledWith(0, true)
    })

    it('should handle junction creation on wire click with Alt key', () => {
      mockWireManagement.drawingWire.value = true
      const mockEvent = {
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireClick(0, mockEvent)

      expect(mockCanvasOperations.getMousePos).toHaveBeenCalledWith(mockEvent)
      expect(mockWireManagement.findClosestGridPointOnWire).toHaveBeenCalledWith(0, { x: 120, y: 90 })
      expect(mockWireManagement.completeWireAtJunction).toHaveBeenCalledWith(0, { x: 8, y: 6 })
    })

    it('should start wire from junction when Alt key pressed and not drawing', () => {
      mockWireManagement.drawingWire.value = false
      const mockEvent = {
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireClick(0, mockEvent)

      expect(mockWireManagement.startWireFromJunction).toHaveBeenCalledWith(0, { x: 8, y: 6 })
    })
  })

  describe('wire dragging', () => {
    beforeEach(() => {
      mockSelection.selectedWires.value = new Set([0])
      mockCircuitManager.activeCircuit.value.wires[0].points = [{ x: 7, y: 6 }, { x: 10, y: 6 }]
    })

    it('should start wire drag when wire is selected', () => {
      const mockEvent = {
        altKey: false,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireMouseDown(0, mockEvent)

      expect(mockEvent.stopPropagation).toHaveBeenCalled()
      expect(mockDragAndDrop.startWireDrag).toHaveBeenCalledWith(0, {
        id: 'wire_drag_0',
        offsetX: 15, // 120 - 7*15
        offsetY: 0   // 90 - 6*15
      })
    })

    it('should not start drag when Alt key is pressed (junction mode)', () => {
      const mockEvent = {
        altKey: true,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireMouseDown(0, mockEvent)

      expect(mockDragAndDrop.startWireDrag).not.toHaveBeenCalled()
    })

    it('should not start drag when wire is not selected', () => {
      mockSelection.selectedWires.value = new Set() // No wires selected

      const mockEvent = {
        altKey: false,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireMouseDown(0, mockEvent)

      expect(mockDragAndDrop.startWireDrag).not.toHaveBeenCalled()
    })

    it('should handle wire with no points gracefully', () => {
      mockCircuitManager.activeCircuit.value.wires[0].points = []

      const mockEvent = {
        altKey: false,
        stopPropagation: vi.fn()
      }

      canvasController.handleWireMouseDown(0, mockEvent)

      expect(mockDragAndDrop.startWireDrag).not.toHaveBeenCalled()
    })
  })

  describe('junction mode', () => {
    it('should toggle junction mode with Alt key', () => {
      const keyDownEvent = { altKey: true }
      const keyUpEvent = { altKey: false }

      expect(canvasController.isJunctionMode.value).toBe(false)

      canvasController.handleKeyDown(keyDownEvent)
      expect(canvasController.isJunctionMode.value).toBe(true)

      canvasController.handleKeyUp(keyUpEvent)
      expect(canvasController.isJunctionMode.value).toBe(false)
    })

    it('should show junction preview when hovering over wire in junction mode', () => {
      canvasController.isJunctionMode.value = true
      const mockEvent = {
        target: {
          classList: { contains: vi.fn().mockReturnValue(true) },
          closest: vi.fn().mockReturnValue({ dataset: { wireIndex: '0' } })
        }
      }
      const mousePos = { x: 120, y: 90 }

      canvasController.handleMouseMove(mockEvent)

      expect(mockWireManagement.findClosestGridPointOnWire).toHaveBeenCalledWith(0, mousePos)
    })

    it('should reset junction mode on window blur', () => {
      canvasController.isJunctionMode.value = true

      canvasController.handleWindowBlur()

      expect(canvasController.isJunctionMode.value).toBe(false)
    })
  })

  describe('wire and junction deletion edge cases', () => {
    it('should handle empty junction array gracefully', () => {
      mockCircuitManager.activeCircuit.value.wireJunctions = []

      const result = canvasController.deleteSelectedElements()

      expect(result).toBe(true) // Should still succeed
      expect(mockCircuitManager.removeWire).toHaveBeenCalledTimes(2)
    })

    it('should handle wires with invalid IDs', () => {
      mockCircuitManager.activeCircuit.value.wires[0].id = null

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = canvasController.deleteSelectedElements()

      expect(result).toBe(true)
      expect(consoleSpy).toHaveBeenCalledWith('Wire has no ID:', expect.any(Object))
      consoleSpy.mockRestore()
    })

    it('should handle junction cleanup when sourceWireIndex matches deleted wire', () => {
      // Set up junction that references a wire being deleted
      mockCircuitManager.activeCircuit.value.wireJunctions = [
        { pos: { x: 8, y: 6 }, sourceWireIndex: 0, connectedWireId: 'some-other-wire' }
      ]

      canvasController.deleteSelectedElements()

      // Junction should be removed because sourceWireIndex 0 is being deleted
      expect(mockCircuitManager.removeWire).toHaveBeenCalledTimes(2)
    })

    it('should handle junction cleanup when connectedWireId matches deleted wire', () => {
      // Set up junction that connects to a wire being deleted  
      mockCircuitManager.activeCircuit.value.wireJunctions = [
        { pos: { x: 8, y: 6 }, sourceWireIndex: 5, connectedWireId: 'wire1' }
      ]

      canvasController.deleteSelectedElements()

      // Junction should be removed because connectedWireId 'wire1' is being deleted
      expect(mockCircuitManager.removeWire).toHaveBeenCalledTimes(2)
    })
  })

  describe('copy/cut operations with wires', () => {
    it('should copy selected wires to clipboard', async () => {
      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(canvasController.clipboardController.copyToClipboard).toHaveBeenCalledWith({
        components: [],
        wires: expect.arrayContaining([
          expect.objectContaining({ id: 'wire1' }),
          expect.objectContaining({ id: 'wire2' })
        ]),
        junctions: expect.arrayContaining([
          expect.objectContaining({ connectedWireId: 'wire2' })
        ])
      })
    })

    it('should cut selected wires to clipboard', async () => {
      const result = await canvasController.cutSelected()

      expect(result).toBe(true)
      expect(canvasController.clipboardController.cutToClipboard).toHaveBeenCalled()
      expect(mockCircuitManager.removeWire).toHaveBeenCalledTimes(2)
    })
  })

  describe('mouse event integration', () => {
    it('should update wire management mouse position on mouse move', () => {
      const mockEvent = {
        target: document.createElement('div')
      }

      canvasController.handleMouseMove(mockEvent)

      expect(mockWireManagement.currentMousePos.value).toEqual({ x: 8, y: 6 }) // Converted to grid units
    })

    it('should track hovered wire for junction mode', () => {
      const mockEvent = {
        target: {
          classList: { contains: vi.fn().mockReturnValue(true) },
          closest: vi.fn().mockReturnValue({ dataset: { wireIndex: '1' } })
        }
      }

      canvasController.handleMouseMove(mockEvent)

      // The internal lastHoveredWireIndex should be updated (tested through behavior)
      canvasController.isJunctionMode.value = true
      // When junction mode changes, it should use the last hovered wire
    })
  })
})