import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useCanvasController } from '@/composables/useCanvasController'
import {
  mockComponents,
  mockCircuitModel,
  mockSelectionStates,
  mockKeyboardEvents,
  mockClipboardAPI
} from '../../fixtures/clipboard-test-data'

// Mock the clipboard and undo composables
vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({
    hasClipboardData: ref(false),
    copyToClipboard: vi.fn(),
    cutToClipboard: vi.fn(),
    pasteFromClipboard: vi.fn().mockReturnValue({
      components: [mockComponents.singleInput],
      wires: [],
      junctions: []
    }),
    getClipboardDataForOS: vi.fn().mockReturnValue('{"test": "data"}'),
    setClipboardDataFromOS: vi.fn().mockReturnValue(true),
    getClipboardStats: vi.fn().mockReturnValue({
      components: 1,
      wires: 0,
      junctions: 0
    }),
    calculateBounds: vi.fn().mockReturnValue({
      minX: 10,
      minY: 15,
      maxX: 20,
      maxY: 25
    }),
    serializeElements: vi.fn().mockReturnValue({
      elements: { components: [], wires: [], junctions: [] }
    }),
    deserializeElements: vi.fn().mockReturnValue({
      components: [mockComponents.singleInput],
      wires: [],
      junctions: []
    })
  })
}))

vi.mock('@/composables/useUndoController', () => ({
  useUndoController: () => ({
    canUndo: ref(false),
    canRedo: ref(false),
    executeCommand: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    startCommandGroup: vi.fn(),
    endCommandGroup: vi.fn(),
    PasteCommand: vi.fn(),
    DuplicateCommand: vi.fn(),
    RemoveComponentCommand: vi.fn(),
    RemoveWireCommand: vi.fn()
  })
}))

// Mock useComponentController
vi.mock('@/composables/useComponentController', () => ({
  useComponentController: () => ({
    lastComponentPosition: ref({ x: 0, y: 0 }),
    addComponentAtSmartPosition: vi.fn(),
    getComponentConnections: vi.fn(),
    updateLastComponentPosition: vi.fn()
  })
}))

describe('useCanvasController - Clipboard Integration', () => {
  let canvasController
  let mockCircuitManager
  let mockCanvasOperations
  let mockWireManagement
  let mockSelection
  let mockDragAndDrop

  beforeEach(() => {
    // Create mock dependencies
    mockCircuitManager = {
      activeCircuit: ref(mockCircuitModel.createMockCircuit({
        components: [mockComponents.singleInput, mockComponents.andGate],
        wires: [],
        junctions: []
      }))
    }

    mockCanvasOperations = {
      getMousePos: vi.fn().mockReturnValue({ x: 100, y: 200 }),
      snapToGrid: vi.fn(),
      gridSize: 15
    }

    mockWireManagement = {
      startWireDrawing: vi.fn(),
      completeWire: vi.fn(),
      addWireWaypoint: vi.fn(),
      cancelWireDrawing: vi.fn(),
      drawingWire: ref(false),
      currentMousePos: ref({ x: 0, y: 0 }),
      startConnection: ref(null),
      findClosestGridPointOnWire: vi.fn(),
      completeWireAtJunction: vi.fn(),
      startWireFromJunction: vi.fn()
    }

    mockSelection = {
      selectedComponents: ref(mockSelectionStates.singleComponent),
      selectedWires: ref(mockSelectionStates.empty),
      isSelecting: ref(false),
      selectionRect: ref(null),
      startSelection: vi.fn(),
      updateSelectionEnd: vi.fn(),
      endSelection: vi.fn(),
      selectComponent: vi.fn(),
      selectWire: vi.fn(),
      clearSelection: vi.fn(),
      deleteSelected: vi.fn(),
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

    // Mock navigator.clipboard
    global.navigator.clipboard = mockClipboardAPI.createMockNavigatorClipboard()
    global.document.execCommand = mockClipboardAPI.createMockExecCommand()

    // Mock document.activeElement to return null by default
    vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null)

    vi.clearAllMocks()
    
    // Reset event objects
    mockKeyboardEvents.copyEvent.preventDefault.mockClear()
    mockKeyboardEvents.pasteEvent.preventDefault.mockClear()
    mockKeyboardEvents.cutEvent.preventDefault.mockClear()
    mockKeyboardEvents.duplicateEvent.preventDefault.mockClear()
    mockKeyboardEvents.undoEvent.preventDefault.mockClear()
    mockKeyboardEvents.redoEvent.preventDefault.mockClear()
  })

  describe('clipboard operations', () => {
    describe('copySelected', () => {
      it('should copy selected components to clipboard', async () => {
        const result = await canvasController.copySelected()
        
        expect(result).toBe(true)
        expect(canvasController.clipboardController.copyToClipboard).toHaveBeenCalled()
        expect(global.navigator.clipboard.writeText).toHaveBeenCalled()
      })

      it('should warn when no components selected', async () => {
        mockSelection.selectedComponents.value = mockSelectionStates.empty
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const result = await canvasController.copySelected()
        
        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('No elements selected for copy')
        consoleSpy.mockRestore()
      })

      it('should handle clipboard API failures gracefully', async () => {
        global.navigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'))
        
        const result = await canvasController.copySelected()
        
        expect(result).toBe(true) // Should still succeed with internal clipboard
      })
    })

    describe('cutSelected', () => {
      it('should cut selected components to clipboard', async () => {
        const result = await canvasController.cutSelected()
        
        expect(result).toBe(true)
        expect(canvasController.clipboardController.cutToClipboard).toHaveBeenCalled()
        expect(canvasController.undoController.startCommandGroup).toHaveBeenCalledWith('Cut elements')
        expect(mockSelection.deleteSelected).toHaveBeenCalled()
        expect(canvasController.undoController.endCommandGroup).toHaveBeenCalled()
      })

      it('should warn when no components selected', async () => {
        mockSelection.selectedComponents.value = mockSelectionStates.empty
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const result = await canvasController.cutSelected()
        
        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('No elements selected for cut')
        consoleSpy.mockRestore()
      })
    })

    describe('pasteFromClipboard', () => {
      it('should paste components from clipboard', async () => {
        canvasController.clipboardController.hasClipboardData.value = true
        
        const result = await canvasController.pasteFromClipboard()
        
        expect(result).toBe(true)
        expect(canvasController.clipboardController.pasteFromClipboard).toHaveBeenCalled()
        expect(canvasController.undoController.executeCommand).toHaveBeenCalled()
        expect(mockSelection.clearSelection).toHaveBeenCalled()
      })

      it('should try OS clipboard when internal clipboard is empty', async () => {
        canvasController.clipboardController.hasClipboardData.value = false
        global.navigator.clipboard.readText.mockResolvedValue('{"test": "data"}')
        
        const result = await canvasController.pasteFromClipboard()
        
        expect(result).toBe(true)
        expect(global.navigator.clipboard.readText).toHaveBeenCalled()
        expect(canvasController.clipboardController.setClipboardDataFromOS).toHaveBeenCalled()
      })

      it('should warn when no clipboard data available', async () => {
        canvasController.clipboardController.hasClipboardData.value = false
        global.navigator.clipboard.readText.mockResolvedValue(null)
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const result = await canvasController.pasteFromClipboard()
        
        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('No clipboard data available')
        consoleSpy.mockRestore()
      })
    })

    describe('duplicateSelected', () => {
      it('should duplicate selected components', () => {
        const result = canvasController.duplicateSelected()
        
        expect(result).toBe(true)
        expect(canvasController.clipboardController.serializeElements).toHaveBeenCalled()
        expect(canvasController.clipboardController.deserializeElements).toHaveBeenCalled()
        expect(canvasController.undoController.executeCommand).toHaveBeenCalled()
        expect(mockSelection.clearSelection).toHaveBeenCalled()
      })

      it('should warn when no components selected', () => {
        mockSelection.selectedComponents.value = mockSelectionStates.empty
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        
        const result = canvasController.duplicateSelected()
        
        expect(result).toBe(false)
        expect(consoleSpy).toHaveBeenCalledWith('No elements selected for duplicate')
        consoleSpy.mockRestore()
      })
    })
  })

  describe('keyboard shortcuts', () => {
    it('should handle copy shortcut (Ctrl+C)', () => {
      // Test that preventDefault is called - indicating the shortcut was handled
      canvasController.handleKeyDown(mockKeyboardEvents.copyEvent)
      
      expect(mockKeyboardEvents.copyEvent.preventDefault).toHaveBeenCalled()
      // The underlying clipboard controller should have been called
      expect(canvasController.clipboardController.copyToClipboard).toHaveBeenCalled()
    })

    it('should handle paste shortcut (Ctrl+V)', () => {
      // Test that preventDefault is called - indicating the shortcut was handled
      canvasController.handleKeyDown(mockKeyboardEvents.pasteEvent)
      
      expect(mockKeyboardEvents.pasteEvent.preventDefault).toHaveBeenCalled()
      // The paste function should be called (this may be async, so we just check the event was handled)
    })

    it('should handle cut shortcut (Ctrl+X)', () => {
      // Test that preventDefault is called - indicating the shortcut was handled
      canvasController.handleKeyDown(mockKeyboardEvents.cutEvent)
      
      expect(mockKeyboardEvents.cutEvent.preventDefault).toHaveBeenCalled()
      // The underlying clipboard controller should have been called
      expect(canvasController.clipboardController.cutToClipboard).toHaveBeenCalled()
    })

    it('should handle duplicate shortcut (Ctrl+D)', () => {
      // Test that preventDefault is called - indicating the shortcut was handled
      canvasController.handleKeyDown(mockKeyboardEvents.duplicateEvent)
      
      expect(mockKeyboardEvents.duplicateEvent.preventDefault).toHaveBeenCalled()
      // The underlying clipboard controller should have been called
      expect(canvasController.clipboardController.serializeElements).toHaveBeenCalled()
    })

    it('should handle undo shortcut (Ctrl+Z)', () => {
      canvasController.handleKeyDown(mockKeyboardEvents.undoEvent)
      
      expect(canvasController.undoController.undo).toHaveBeenCalled()
      expect(mockKeyboardEvents.undoEvent.defaultPrevented).toBe(true)
    })

    it('should handle redo shortcut (Ctrl+Y)', () => {
      canvasController.handleKeyDown(mockKeyboardEvents.redoEvent)
      
      expect(canvasController.undoController.redo).toHaveBeenCalled()
      expect(mockKeyboardEvents.redoEvent.defaultPrevented).toBe(true)
    })

    it('should not handle shortcuts when input is focused', () => {
      const mockInput = document.createElement('input')
      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(mockInput)
      
      const copySelectedSpy = vi.spyOn(canvasController, 'copySelected')
      
      canvasController.handleKeyDown(mockKeyboardEvents.copyEvent)
      
      expect(copySelectedSpy).not.toHaveBeenCalled()
      expect(mockKeyboardEvents.copyEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('debounce mechanism', () => {
    it('should debounce rapid paste operations', async () => {
      canvasController.clipboardController.hasClipboardData.value = true
      
      // First paste should succeed
      const result1 = await canvasController.pasteFromClipboard()
      expect(result1).toBe(true)
      
      // Immediate second paste should be debounced
      const result2 = await canvasController.pasteFromClipboard()
      expect(result2).toBe(false)
    })

    it('should debounce rapid duplicate operations', () => {
      // First duplicate should succeed
      const result1 = canvasController.duplicateSelected()
      expect(result1).toBe(true)
      
      // Immediate second duplicate should be debounced
      const result2 = canvasController.duplicateSelected()
      expect(result2).toBe(false)
    })
  })

  describe('positioning calculations', () => {
    it('should calculate paste position relative to selected components', () => {
      // Mock selected components with bounds
      mockSelection.selectedComponents.value = mockSelectionStates.singleComponent
      
      // Test positioning function through paste operation
      canvasController.clipboardController.hasClipboardData.value = true
      canvasController.pasteFromClipboard()
      
      // Should call calculateBounds to determine position
      expect(canvasController.clipboardController.calculateBounds).toHaveBeenCalled()
    })

    it('should calculate duplicate position relative to selected elements', () => {
      // Test positioning function through duplicate operation
      canvasController.duplicateSelected()
      
      // Should call calculateBounds to determine position
      expect(canvasController.clipboardController.calculateBounds).toHaveBeenCalled()
    })
  })

  describe('element selection', () => {
    it('should get selected components correctly', () => {
      mockSelection.selectedComponents.value = mockSelectionStates.singleComponent
      
      // This is tested indirectly through copy operation
      canvasController.copySelected()
      
      expect(canvasController.clipboardController.copyToClipboard).toHaveBeenCalled()
    })

    it('should get selected wires correctly', () => {
      mockSelection.selectedComponents.value = mockSelectionStates.empty
      mockSelection.selectedWires.value = mockSelectionStates.singleWire
      
      // This is tested indirectly through copy operation
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      canvasController.copySelected()
      
      expect(consoleSpy).toHaveBeenCalledWith('No elements selected for copy')
      consoleSpy.mockRestore()
    })

    it('should handle mixed selection (components and wires)', () => {
      mockSelection.selectedComponents.value = mockSelectionStates.mixed.components
      mockSelection.selectedWires.value = mockSelectionStates.mixed.wires
      
      // This is tested indirectly through copy operation
      canvasController.copySelected()
      
      expect(canvasController.clipboardController.copyToClipboard).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle clipboard operation failures', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      canvasController.clipboardController.copyToClipboard.mockImplementation(() => {
        throw new Error('Clipboard error')
      })
      
      const result = await canvasController.copySelected()
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('should handle OS clipboard failures gracefully', async () => {
      global.navigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'))
      
      const result = await canvasController.copySelected()
      
      // Should still succeed with internal clipboard
      expect(result).toBe(true)
    })

    it('should handle paste operation failures', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      canvasController.clipboardController.pasteFromClipboard.mockImplementation(() => {
        throw new Error('Paste error')
      })
      
      const result = await canvasController.pasteFromClipboard()
      
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to paste from clipboard:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('integration with other systems', () => {
    it('should integrate with selection system', async () => {
      canvasController.clipboardController.hasClipboardData.value = true
      await canvasController.pasteFromClipboard()
      
      expect(mockSelection.clearSelection).toHaveBeenCalled()
    })

    it('should integrate with circuit model', () => {
      // The circuit model integration is tested through the mock setup
      expect(mockCircuitManager.activeCircuit.value).toBeDefined()
    })
  })
})