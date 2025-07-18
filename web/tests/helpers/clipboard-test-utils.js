/**
 * Clipboard-specific test utilities and helpers
 */

import { vi } from 'vitest'
import { ref } from 'vue'

/**
 * Creates a mock clipboard controller with configurable behavior
 */
export function createMockClipboardController(options = {}) {
  const {
    hasData = false,
    copySuccess = true,
    pasteData = null,
    stats = { components: 0, wires: 0, junctions: 0 }
  } = options

  return {
    hasClipboardData: ref(hasData),
    copyToClipboard: vi.fn().mockImplementation(() => {
      if (copySuccess) {
        return { version: '1.0', elements: { components: [], wires: [], junctions: [] } }
      } else {
        throw new Error('Copy failed')
      }
    }),
    cutToClipboard: vi.fn().mockImplementation(() => {
      if (copySuccess) {
        return { version: '1.0', elements: { components: [], wires: [], junctions: [] } }
      } else {
        throw new Error('Cut failed')
      }
    }),
    pasteFromClipboard: vi.fn().mockReturnValue(pasteData),
    clearClipboard: vi.fn(),
    getClipboardDataForOS: vi.fn().mockReturnValue('{"test": "data"}'),
    setClipboardDataFromOS: vi.fn().mockReturnValue(true),
    getClipboardStats: vi.fn().mockReturnValue(stats),
    serializeElements: vi.fn().mockReturnValue({
      version: '1.0',
      elements: { components: [], wires: [], junctions: [] }
    }),
    deserializeElements: vi.fn().mockReturnValue({
      components: [],
      wires: [],
      junctions: [],
      idMappings: { components: new Map(), wires: new Map() }
    }),
    calculateBounds: vi.fn().mockReturnValue({
      minX: 0,
      minY: 0,
      maxX: 10,
      maxY: 10
    }),
    generateUniqueId: vi.fn().mockImplementation(type => `${type}_test_${Date.now()}`),
    generateUniqueWireId: vi.fn().mockImplementation(() => `wire_test_${Date.now()}`),
    isCutOperation: vi.fn().mockReturnValue(false)
  }
}

/**
 * Creates a mock undo controller with configurable behavior
 */
export function createMockUndoController(options = {}) {
  const { canUndo = false, canRedo = false, undoStackSize = 0, redoStackSize = 0 } = options

  return {
    canUndo: ref(canUndo),
    canRedo: ref(canRedo),
    undoStackSize: ref(undoStackSize),
    redoStackSize: ref(redoStackSize),
    executeCommand: vi.fn(),
    undo: vi.fn().mockReturnValue(true),
    redo: vi.fn().mockReturnValue(true),
    clearHistory: vi.fn(),
    startCommandGroup: vi.fn(),
    endCommandGroup: vi.fn(),
    getUndoStackInfo: vi.fn().mockReturnValue({
      undoCount: undoStackSize,
      redoCount: redoStackSize,
      maxLevels: 50,
      recentCommands: []
    }),
    // Command classes
    AddComponentCommand: vi.fn(),
    RemoveComponentCommand: vi.fn(),
    UpdateComponentCommand: vi.fn(),
    MoveComponentCommand: vi.fn(),
    PasteCommand: vi.fn()
  }
}

/**
 * Creates a mock circuit manager for testing
 */
export function createMockCircuitManager(options = {}) {
  const { components = [], wires = [], junctions = [] } = options

  return {
    activeCircuit: ref({
      id: 'test-circuit',
      name: 'Test Circuit',
      components: [...components],
      wires: [...wires],
      wireJunctions: [...junctions],
      properties: { name: 'Test Circuit' }
    }),
    addComponent: vi.fn(),
    removeComponent: vi.fn(),
    updateComponent: vi.fn(),
    allCircuits: ref(new Map()),
    createCircuit: vi.fn(),
    switchToTab: vi.fn()
  }
}

/**
 * Creates a mock selection controller for testing
 */
export function createMockSelectionController(options = {}) {
  const { selectedComponents = new Set(), selectedWires = new Set(), isSelecting = false } = options

  return {
    selectedComponents: ref(selectedComponents),
    selectedWires: ref(selectedWires),
    isSelecting: ref(isSelecting),
    selectionRect: ref(null),
    justFinishedSelecting: ref(false),
    clearSelection: vi.fn(),
    selectComponent: vi.fn(),
    selectWire: vi.fn(),
    deleteSelected: vi.fn(),
    startSelection: vi.fn(),
    updateSelectionEnd: vi.fn(),
    endSelection: vi.fn(),
    checkAndClearJustFinished: vi.fn().mockReturnValue(false)
  }
}

/**
 * Creates a mock canvas controller for testing
 */
export function createMockCanvasController(options = {}) {
  const {
    clipboardController = createMockClipboardController(),
    undoController = createMockUndoController()
  } = options

  return {
    clipboardController,
    undoController,
    copySelected: vi.fn().mockResolvedValue(true),
    cutSelected: vi.fn().mockResolvedValue(true),
    pasteFromClipboard: vi.fn().mockResolvedValue(true),
    duplicateSelected: vi.fn().mockReturnValue(true),
    handleKeyDown: vi.fn(),
    handleKeyUp: vi.fn(),
    canUndo: undoController.canUndo,
    canRedo: undoController.canRedo,
    undo: undoController.undo,
    redo: undoController.redo
  }
}

/**
 * Creates a mock browser clipboard API
 */
export function createMockBrowserClipboard(options = {}) {
  const {
    writeTextSuccess = true,
    readTextSuccess = true,
    readTextData = '{"test": "data"}',
    execCommandSuccess = true
  } = options

  const mockClipboard = {
    writeText: writeTextSuccess
      ? vi.fn().mockResolvedValue()
      : vi.fn().mockRejectedValue(new Error('Write failed')),
    readText: readTextSuccess
      ? vi.fn().mockResolvedValue(readTextData)
      : vi.fn().mockRejectedValue(new Error('Read failed'))
  }

  const mockExecCommand = vi.fn().mockReturnValue(execCommandSuccess)
  const mockQueryCommandSupported = vi.fn().mockReturnValue(true)

  return {
    mockClipboard,
    mockExecCommand,
    mockQueryCommandSupported,
    install: () => {
      global.navigator.clipboard = mockClipboard
      global.document.execCommand = mockExecCommand
      global.document.queryCommandSupported = mockQueryCommandSupported
    },
    uninstall: () => {
      delete global.navigator.clipboard
      delete global.document.execCommand
      delete global.document.queryCommandSupported
    }
  }
}

/**
 * Creates a keyboard event for testing
 */
export function createKeyboardEvent(key, options = {}) {
  const {
    ctrlKey = false,
    metaKey = false,
    shiftKey = false,
    altKey = false,
    bubbles = true,
    cancelable = true
  } = options

  return new KeyboardEvent('keydown', {
    key,
    ctrlKey,
    metaKey,
    shiftKey,
    altKey,
    bubbles,
    cancelable
  })
}

/**
 * Creates a clipboard test scenario with setup and teardown
 */
export function createClipboardTestScenario(name, setup = {}) {
  const {
    components = [],
    wires = [],
    junctions = [],
    selectedComponents = new Set(),
    selectedWires = new Set(),
    clipboardData = null,
    undoStackSize = 0
  } = setup

  return {
    name,
    circuitManager: createMockCircuitManager({ components, wires, junctions }),
    selection: createMockSelectionController({ selectedComponents, selectedWires }),
    clipboardController: createMockClipboardController({
      hasData: !!clipboardData,
      pasteData: clipboardData
    }),
    undoController: createMockUndoController({ undoStackSize }),
    browserClipboard: createMockBrowserClipboard(),
    setup: function () {
      this.browserClipboard.install()
    },
    teardown: function () {
      this.browserClipboard.uninstall()
      vi.clearAllMocks()
    }
  }
}

/**
 * Simulates a complete clipboard workflow
 */
export function simulateClipboardWorkflow(scenario, workflow) {
  const { circuitManager, selection, clipboardController, undoController } = scenario

  const workflows = {
    'copy-paste': async () => {
      // Select elements
      const selectedElements = {
        components: circuitManager.activeCircuit.value.components.filter(c =>
          selection.selectedComponents.value.has(c.id)
        ),
        wires: [],
        junctions: []
      }

      // Copy
      clipboardController.copyToClipboard(selectedElements)

      // Paste
      const pastePosition = { x: 10, y: 10 }
      const pastedElements = clipboardController.pasteFromClipboard(pastePosition)

      // Add to circuit
      const pasteCommand = new undoController.PasteCommand(circuitManager, pastedElements)
      undoController.executeCommand(pasteCommand)

      return { pastedElements, pasteCommand }
    },

    'cut-paste': async () => {
      // Select elements
      const selectedElements = {
        components: circuitManager.activeCircuit.value.components.filter(c =>
          selection.selectedComponents.value.has(c.id)
        ),
        wires: [],
        junctions: []
      }

      // Cut (copy + remove)
      undoController.startCommandGroup('Cut operation')
      clipboardController.cutToClipboard(selectedElements)

      selectedElements.components.forEach(component => {
        const removeCommand = new undoController.RemoveComponentCommand(
          circuitManager,
          component.id
        )
        undoController.executeCommand(removeCommand)
      })

      undoController.endCommandGroup()

      // Paste
      const pastePosition = { x: 20, y: 20 }
      const pastedElements = clipboardController.pasteFromClipboard(pastePosition)

      const pasteCommand = new undoController.PasteCommand(circuitManager, pastedElements)
      undoController.executeCommand(pasteCommand)

      return { pastedElements, pasteCommand }
    },

    duplicate: () => {
      // Select elements
      const selectedElements = {
        components: circuitManager.activeCircuit.value.components.filter(c =>
          selection.selectedComponents.value.has(c.id)
        ),
        wires: [],
        junctions: []
      }

      // Duplicate
      const serialized = clipboardController.serializeElements(selectedElements)
      const duplicatePosition = { x: 0, y: 15 }
      const duplicatedElements = clipboardController.deserializeElements(
        serialized,
        duplicatePosition
      )

      const duplicateCommand = new undoController.PasteCommand(circuitManager, duplicatedElements)
      undoController.executeCommand(duplicateCommand)

      return { duplicatedElements, duplicateCommand }
    }
  }

  return workflows[workflow]()
}

/**
 * Validates clipboard operation results
 */
export function validateClipboardOperation(result, expectations) {
  const {
    expectComponentCount,
    expectWireCount,
    expectJunctionCount,
    expectUndoStackSize,
    expectNewIds = true,
    expectPositionOffset = null
  } = expectations

  if (expectComponentCount !== undefined) {
    expect(result.components || result.pastedElements?.components || []).toHaveLength(
      expectComponentCount
    )
  }

  if (expectWireCount !== undefined) {
    expect(result.wires || result.pastedElements?.wires || []).toHaveLength(expectWireCount)
  }

  if (expectJunctionCount !== undefined) {
    expect(result.junctions || result.pastedElements?.junctions || []).toHaveLength(
      expectJunctionCount
    )
  }

  if (expectUndoStackSize !== undefined) {
    expect(result.undoController?.undoStackSize.value).toBe(expectUndoStackSize)
  }

  if (expectNewIds && result.components) {
    result.components.forEach(component => {
      expect(component.id).toMatch(/^[a-zA-Z-]+_\d+_[a-z0-9]+$/)
    })
  }

  if (expectPositionOffset && result.components) {
    result.components.forEach(component => {
      expect(component.x).toBe(expectPositionOffset.x)
      expect(component.y).toBe(expectPositionOffset.y)
    })
  }
}

/**
 * Performance testing helper for clipboard operations
 */
export function measureClipboardPerformance(operation, iterations = 100) {
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    operation()
  }

  const endTime = performance.now()
  const totalTime = endTime - startTime
  const averageTime = totalTime / iterations

  return {
    totalTime,
    averageTime,
    operations: iterations
  }
}

/**
 * Memory usage testing helper
 */
export function measureMemoryUsage(operation) {
  const before = performance.memory?.usedJSHeapSize || 0
  operation()
  const after = performance.memory?.usedJSHeapSize || 0

  return {
    before,
    after,
    delta: after - before
  }
}

/**
 * Accessibility testing helper for clipboard operations
 */
export function validateAccessibility(element, options = {}) {
  const {
    expectAriaLabel = false,
    expectKeyboardSupport = false,
    expectFocusManagement = false
  } = options

  if (expectAriaLabel) {
    expect(element.getAttribute('aria-label')).toBeTruthy()
  }

  if (expectKeyboardSupport) {
    expect(element.tabIndex).toBeGreaterThanOrEqual(0)
  }

  if (expectFocusManagement) {
    expect(element.focus).toBeDefined()
  }
}

// Export all utilities
export default {
  createMockClipboardController,
  createMockUndoController,
  createMockCircuitManager,
  createMockSelectionController,
  createMockCanvasController,
  createMockBrowserClipboard,
  createKeyboardEvent,
  createClipboardTestScenario,
  simulateClipboardWorkflow,
  validateClipboardOperation,
  measureClipboardPerformance,
  measureMemoryUsage,
  validateAccessibility
}
