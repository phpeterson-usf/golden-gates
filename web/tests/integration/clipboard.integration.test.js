import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useClipboard } from '@/composables/useClipboard'
import { useUndoController } from '@/composables/useUndoController'
import { useCircuitModel } from '@/composables/useCircuitModel'
import {
  mockComponents,
  mockWires,
  mockJunctions,
  mockCircuitElements,
  testUtils
} from '../fixtures/clipboard-test-data'

describe('Clipboard Integration Workflows', () => {
  let clipboard
  let undoController
  let circuitModel
  let mockSelection

  beforeEach(() => {
    clipboard = useClipboard()
    undoController = useUndoController(50)
    
    // Create a proper circuit model mock
    circuitModel = {
      activeCircuit: ref({
        id: 'test-circuit',
        name: 'Test Circuit',
        components: [],
        wires: [],
        wireJunctions: [],
        properties: { name: 'Test Circuit' }
      }),
      createCircuit: vi.fn().mockImplementation((name) => ({
        id: `circuit-${Date.now()}`,
        name,
        components: [],
        wires: [],
        wireJunctions: [],
        properties: { name }
      })),
      activeTabId: ref('test-circuit'),
      addComponent: vi.fn((component) => {
        circuitModel.activeCircuit.value.components.push(component)
      }),
      removeComponent: vi.fn((componentId) => {
        const index = circuitModel.activeCircuit.value.components.findIndex(c => c.id === componentId)
        if (index >= 0) {
          circuitModel.activeCircuit.value.components.splice(index, 1)
        }
      })
    }
    
    // Mock selection state
    mockSelection = {
      selectedComponents: new Set(),
      selectedWires: new Set(),
      clear: function() {
        this.selectedComponents.clear()
        this.selectedWires.clear()
      }
    }

    vi.clearAllMocks()
  })

  describe('Complete Copy-Paste Workflow', () => {
    it('should perform complete copy-paste workflow', () => {
      // Setup: Create a circuit with components
      const originalComponent = mockComponents.singleInput
      circuitModel.activeCircuit.value.components.push(originalComponent)
      
      // Step 1: Select component
      mockSelection.selectedComponents.add(originalComponent.id)
      
      // Step 2: Copy to clipboard
      const selectedElements = {
        components: [originalComponent],
        wires: [],
        junctions: []
      }
      clipboard.copyToClipboard(selectedElements)
      
      expect(clipboard.hasClipboardData.value).toBe(true)
      expect(clipboard.getClipboardStats().components).toBe(1)
      
      // Step 3: Paste from clipboard
      const pastePosition = { x: 10, y: 20 }
      const pastedElements = clipboard.pasteFromClipboard(pastePosition)
      
      expect(pastedElements.components).toHaveLength(1)
      expect(pastedElements.components[0].id).not.toBe(originalComponent.id)
      expect(pastedElements.components[0].x).toBe(10)
      expect(pastedElements.components[0].y).toBe(20)
      
      // Step 4: Add to circuit manually (since PasteCommand expects real circuit model)
      pastedElements.components.forEach(component => {
        circuitModel.activeCircuit.value.components.push(component)
      })
      pastedElements.wires.forEach(wire => {
        circuitModel.activeCircuit.value.wires.push(wire)
      })
      pastedElements.junctions.forEach(junction => {
        circuitModel.activeCircuit.value.wireJunctions.push(junction)
      })
      
      expect(circuitModel.activeCircuit.value.components).toHaveLength(2)
      
      // Test undo functionality separately
      const pasteCommand = new undoController.PasteCommand(circuitModel, pastedElements)
      undoController.executeCommand(pasteCommand)
      expect(undoController.canUndo.value).toBe(true)
    })

    it('should handle copy-paste with complex circuit elements', () => {
      // Setup: Create complex circuit
      const complexElements = mockCircuitElements.complexCircuit
      circuitModel.activeCircuit.value.components = [...complexElements.components]
      circuitModel.activeCircuit.value.wires = [...complexElements.wires]
      circuitModel.activeCircuit.value.wireJunctions = [...complexElements.junctions]
      
      // Copy all elements
      clipboard.copyToClipboard(complexElements)
      
      // Paste with offset
      const pastePosition = { x: 50, y: 50 }
      const pastedElements = clipboard.pasteFromClipboard(pastePosition)
      
      expect(pastedElements.components).toHaveLength(5)
      expect(pastedElements.wires).toHaveLength(2)
      expect(pastedElements.junctions).toHaveLength(2)
      
      // Verify all elements have new IDs
      pastedElements.components.forEach(component => {
        expect(complexElements.components.some(orig => orig.id === component.id)).toBe(false)
      })
      
      pastedElements.wires.forEach(wire => {
        expect(complexElements.wires.some(orig => orig.id === wire.id)).toBe(false)
      })
    })
  })

  // Note: Cut-paste workflow is tested at the unit level in useCanvasController tests

  describe('Duplicate Workflow', () => {
    // Note: Duplicate workflow is tested at the unit level in useCanvasController tests

    it('should handle duplicate with wire connections', () => {
      // Setup: Create circuit with connected components
      const input = mockComponents.singleInput
      const gate = mockComponents.andGate
      const wire = mockWires.simpleWire
      
      circuitModel.activeCircuit.value.components = [input, gate]
      circuitModel.activeCircuit.value.wires = [wire]
      
      // Duplicate both components and wire
      const selectedElements = {
        components: [input, gate],
        wires: [wire],
        junctions: []
      }
      
      const serialized = clipboard.serializeElements(selectedElements)
      const duplicatePosition = { x: 30, y: 0 }
      const duplicatedElements = clipboard.deserializeElements(serialized, duplicatePosition)
      
      // Verify wire connections are updated
      expect(duplicatedElements.wires).toHaveLength(1)
      expect(duplicatedElements.wires[0].startConnection.componentId).toBe(duplicatedElements.components[0].id)
      expect(duplicatedElements.wires[0].endConnection.componentId).toBe(duplicatedElements.components[1].id)
    })
  })

  describe('Multi-Operation Workflows', () => {
    // Note: Multi-operation workflows are tested at the unit level in useClipboard tests

    it('should handle mixed copy-cut-paste operations', () => {
      // Setup: Create components
      const input = testUtils.createMockComponent('input', { x: 10, y: 10 })
      const gate = testUtils.createMockComponent('and-gate', { x: 20, y: 20 })
      const output = testUtils.createMockComponent('output', { x: 30, y: 30 })
      
      circuitModel.activeCircuit.value.components = [input, gate, output]
      
      // Copy input
      clipboard.copyToClipboard({ components: [input], wires: [], junctions: [] })
      const copiedInput = clipboard.pasteFromClipboard({ x: 50, y: 50 })
      const copyCommand = new undoController.PasteCommand(circuitModel, copiedInput)
      undoController.executeCommand(copyCommand)
      
      // Cut gate
      undoController.startCommandGroup('Cut gate')
      clipboard.cutToClipboard({ components: [gate], wires: [], junctions: [] })
      const cutCommand = new undoController.RemoveComponentCommand(circuitModel, gate.id)
      undoController.executeCommand(cutCommand)
      undoController.endCommandGroup()
      
      // Paste gate elsewhere
      const cutGate = clipboard.pasteFromClipboard({ x: 60, y: 60 })
      const pasteCommand = new undoController.PasteCommand(circuitModel, cutGate)
      undoController.executeCommand(pasteCommand)
      
      expect(circuitModel.activeCircuit.value.components).toHaveLength(4) // input, output, copied input, moved gate
      expect(undoController.undoStackSize.value).toBe(3)
    })
  })

  describe('Error Recovery Workflows', () => {
    it('should handle clipboard corruption gracefully', () => {
      // Setup: Create valid clipboard data
      clipboard.copyToClipboard(mockCircuitElements.singleComponent)
      expect(clipboard.hasClipboardData.value).toBe(true)
      
      // Simulate clipboard corruption
      const corruptedData = clipboard.getClipboardDataForOS()
      const malformedData = corruptedData.replace('{', '{{')
      
      // Try to restore from corrupted data
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = clipboard.setClipboardDataFromOS(malformedData)
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse clipboard data from OS:',
        expect.any(SyntaxError)
      )
      consoleSpy.mockRestore()
      
      // Verify original clipboard data is preserved
      expect(clipboard.hasClipboardData.value).toBe(true)
    })

    it('should handle undo stack overflow', () => {
      // Create controller with small limit
      const smallUndoController = useUndoController(3)
      
      // Perform more operations than the limit
      for (let i = 0; i < 5; i++) {
        const component = testUtils.createMockComponent('input', { id: `test_${i}` })
        const command = new smallUndoController.AddComponentCommand(circuitModel, component)
        smallUndoController.executeCommand(command)
      }
      
      // Verify stack size is limited
      expect(smallUndoController.undoStackSize.value).toBe(3)
      
      // Verify undo still works
      smallUndoController.undo()
      expect(smallUndoController.undoStackSize.value).toBe(2)
    })
  })

  describe('Performance Workflows', () => {
    it('should handle large clipboard operations', () => {
      // Create large circuit
      const largeElements = {
        components: Array.from({ length: 100 }, (_, i) => 
          testUtils.createMockComponent('input', { id: `input_${i}` })
        ),
        wires: Array.from({ length: 50 }, (_, i) => 
          testUtils.createMockWire({ id: `wire_${i}` })
        ),
        junctions: Array.from({ length: 25 }, (_, i) => 
          testUtils.createMockJunction({ connectedWireId: `wire_${i}` })
        )
      }
      
      // Performance test: serialize/deserialize large data
      const startTime = performance.now()
      
      const serialized = clipboard.serializeElements(largeElements)
      const deserialized = clipboard.deserializeElements(serialized, { x: 0, y: 0 })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000) // 1 second
      
      // Verify all elements are processed
      expect(deserialized.components).toHaveLength(100)
      expect(deserialized.wires).toHaveLength(50)
      expect(deserialized.junctions).toHaveLength(25)
    })
  })

})