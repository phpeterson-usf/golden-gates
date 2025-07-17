import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useUndoController } from '@/composables/useUndoController'
import { mockCircuitModel, testUtils } from '../../fixtures/clipboard-test-data'

describe('useUndoController', () => {
  let undoController
  let mockCircuitManager

  beforeEach(() => {
    // Create mock circuit manager
    mockCircuitManager = {
      activeCircuit: ref(mockCircuitModel.createMockCircuit()),
      addComponent: vi.fn((component) => {
        if (mockCircuitManager.activeCircuit.value) {
          mockCircuitManager.activeCircuit.value.components.push(component)
        }
      }),
      removeComponent: vi.fn((componentId) => {
        if (mockCircuitManager.activeCircuit.value) {
          const index = mockCircuitManager.activeCircuit.value.components.findIndex(c => c.id === componentId)
          if (index !== -1) {
            mockCircuitManager.activeCircuit.value.components.splice(index, 1)
          }
        }
      }),
      updateComponent: vi.fn()
    }

    undoController = useUndoController(10) // Max 10 undo levels
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty undo/redo stacks', () => {
      expect(undoController.canUndo.value).toBe(false)
      expect(undoController.canRedo.value).toBe(false)
      expect(undoController.undoStackSize.value).toBe(0)
      expect(undoController.redoStackSize.value).toBe(0)
    })

    it('should provide all required methods', () => {
      expect(typeof undoController.executeCommand).toBe('function')
      expect(typeof undoController.undo).toBe('function')
      expect(typeof undoController.redo).toBe('function')
      expect(typeof undoController.clearHistory).toBe('function')
      expect(typeof undoController.startCommandGroup).toBe('function')
      expect(typeof undoController.endCommandGroup).toBe('function')
    })

    it('should provide command classes', () => {
      expect(undoController.AddComponentCommand).toBeDefined()
      expect(undoController.RemoveComponentCommand).toBeDefined()
      expect(undoController.UpdateComponentCommand).toBeDefined()
      expect(undoController.MoveComponentCommand).toBeDefined()
      expect(undoController.PasteCommand).toBeDefined()
    })
  })

  describe('basic command execution', () => {
    it('should execute a command and add to undo stack', () => {
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      undoController.executeCommand(command)
      
      expect(mockCircuitManager.addComponent).toHaveBeenCalledWith(component)
      expect(undoController.canUndo.value).toBe(true)
      expect(undoController.undoStackSize.value).toBe(1)
    })

    it('should clear redo stack when executing new command', () => {
      const component1 = testUtils.createMockComponent('input')
      const component2 = testUtils.createMockComponent('output')
      const command1 = new undoController.AddComponentCommand(mockCircuitManager, component1)
      const command2 = new undoController.AddComponentCommand(mockCircuitManager, component2)
      
      // Execute command, then undo to populate redo stack
      undoController.executeCommand(command1)
      undoController.undo()
      expect(undoController.canRedo.value).toBe(true)
      
      // Execute new command should clear redo stack
      undoController.executeCommand(command2)
      expect(undoController.canRedo.value).toBe(false)
    })
  })

  describe('undo operations', () => {
    it('should undo the last command', () => {
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      undoController.executeCommand(command)
      const undoResult = undoController.undo()
      
      expect(undoResult).toBe(true)
      expect(mockCircuitManager.removeComponent).toHaveBeenCalledWith(component.id)
      expect(undoController.canUndo.value).toBe(false)
      expect(undoController.canRedo.value).toBe(true)
    })

    it('should return false when nothing to undo', () => {
      const undoResult = undoController.undo()
      
      expect(undoResult).toBe(false)
    })
  })

  describe('redo operations', () => {
    it('should redo the last undone command', () => {
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      undoController.executeCommand(command)
      undoController.undo()
      
      const redoResult = undoController.redo()
      
      expect(redoResult).toBe(true)
      expect(mockCircuitManager.addComponent).toHaveBeenCalledTimes(2) // Once for execute, once for redo
      expect(undoController.canRedo.value).toBe(false)
      expect(undoController.canUndo.value).toBe(true)
    })

    it('should return false when nothing to redo', () => {
      const redoResult = undoController.redo()
      
      expect(redoResult).toBe(false)
    })
  })

  describe('command groups', () => {
    it('should group multiple commands together', () => {
      const component1 = testUtils.createMockComponent('input')
      const component2 = testUtils.createMockComponent('output')
      const command1 = new undoController.AddComponentCommand(mockCircuitManager, component1)
      const command2 = new undoController.AddComponentCommand(mockCircuitManager, component2)
      
      undoController.startCommandGroup('Add multiple components')
      undoController.executeCommand(command1)
      undoController.executeCommand(command2)
      undoController.endCommandGroup()
      
      expect(undoController.undoStackSize.value).toBe(1) // Both commands in one group
      
      // Undo should reverse both commands
      undoController.undo()
      expect(mockCircuitManager.removeComponent).toHaveBeenCalledTimes(2)
    })

    it('should not add empty command groups', () => {
      undoController.startCommandGroup('Empty group')
      undoController.endCommandGroup()
      
      expect(undoController.undoStackSize.value).toBe(0)
    })

    it('should handle nested command group warnings', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      undoController.startCommandGroup('Group 1')
      undoController.startCommandGroup('Group 2') // Should warn
      
      expect(consoleSpy).toHaveBeenCalledWith('Command group already started')
      consoleSpy.mockRestore()
    })
  })

  describe('stack size limits', () => {
    it('should limit undo stack size', () => {
      const maxSize = 3
      const controller = useUndoController(maxSize)
      
      // Add more commands than the limit
      for (let i = 0; i < maxSize + 2; i++) {
        const component = testUtils.createMockComponent('input', { id: `test_${i}` })
        const command = new controller.AddComponentCommand(mockCircuitManager, component)
        controller.executeCommand(command)
      }
      
      expect(controller.undoStackSize.value).toBe(maxSize)
    })
  })

  describe('AddComponentCommand', () => {
    it('should add component on execute', () => {
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      command.execute()
      
      expect(mockCircuitManager.addComponent).toHaveBeenCalledWith(component)
    })

    it('should remove component on undo', () => {
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      command.undo()
      
      expect(mockCircuitManager.removeComponent).toHaveBeenCalledWith(component.id)
    })
  })

  describe('RemoveComponentCommand', () => {
    it('should store component before removal', () => {
      const component = testUtils.createMockComponent('input')
      mockCircuitManager.activeCircuit.value.components.push(component)
      
      const command = new undoController.RemoveComponentCommand(mockCircuitManager, component.id)
      command.execute()
      
      expect(mockCircuitManager.removeComponent).toHaveBeenCalledWith(component.id)
    })

    it('should restore component on undo', () => {
      const component = testUtils.createMockComponent('input')
      mockCircuitManager.activeCircuit.value.components.push(component)
      
      const command = new undoController.RemoveComponentCommand(mockCircuitManager, component.id)
      command.execute()
      command.undo()
      
      expect(mockCircuitManager.addComponent).toHaveBeenCalledWith(component)
    })
  })

  describe('UpdateComponentCommand', () => {
    it('should update component properties', () => {
      const componentId = 'test_component'
      const newProps = { label: 'New Label' }
      const oldProps = { label: 'Old Label' }
      
      // Mock the component in the circuit
      const mockComponent = { id: componentId, ...oldProps }
      mockCircuitManager.activeCircuit.value.components.push(mockComponent)
      
      const command = new undoController.UpdateComponentCommand(
        mockCircuitManager,
        componentId,
        newProps,
        oldProps
      )
      
      command.execute()
      
      expect(mockComponent.label).toBe('New Label')
    })

    it('should restore old properties on undo', () => {
      const componentId = 'test_component'
      const newProps = { label: 'New Label' }
      const oldProps = { label: 'Old Label' }
      
      // Mock the component in the circuit
      const mockComponent = { id: componentId, ...newProps }
      mockCircuitManager.activeCircuit.value.components.push(mockComponent)
      
      const command = new undoController.UpdateComponentCommand(
        mockCircuitManager,
        componentId,
        newProps,
        oldProps
      )
      
      command.undo()
      
      expect(mockComponent.label).toBe('Old Label')
    })
  })

  describe('MoveComponentCommand', () => {
    it('should move component to new position', () => {
      const componentId = 'test_component'
      const newPosition = { x: 20, y: 30 }
      const oldPosition = { x: 10, y: 15 }
      
      // Mock the component in the circuit
      const mockComponent = { id: componentId, ...oldPosition }
      mockCircuitManager.activeCircuit.value.components.push(mockComponent)
      
      const command = new undoController.MoveComponentCommand(
        mockCircuitManager,
        componentId,
        newPosition,
        oldPosition
      )
      
      command.execute()
      
      expect(mockComponent.x).toBe(20)
      expect(mockComponent.y).toBe(30)
    })

    it('should restore old position on undo', () => {
      const componentId = 'test_component'
      const newPosition = { x: 20, y: 30 }
      const oldPosition = { x: 10, y: 15 }
      
      // Mock the component in the circuit
      const mockComponent = { id: componentId, ...newPosition }
      mockCircuitManager.activeCircuit.value.components.push(mockComponent)
      
      const command = new undoController.MoveComponentCommand(
        mockCircuitManager,
        componentId,
        newPosition,
        oldPosition
      )
      
      command.undo()
      
      expect(mockComponent.x).toBe(10)
      expect(mockComponent.y).toBe(15)
    })
  })

  describe('PasteCommand', () => {
    it('should add pasted elements on execute', () => {
      const pastedElements = {
        components: [testUtils.createMockComponent('input')],
        wires: [testUtils.createMockWire()],
        junctions: [testUtils.createMockJunction()]
      }
      
      const command = new undoController.PasteCommand(mockCircuitManager, pastedElements)
      command.execute()
      
      expect(mockCircuitManager.activeCircuit.value.components).toHaveLength(1)
      expect(mockCircuitManager.activeCircuit.value.wires).toHaveLength(1)
      expect(mockCircuitManager.activeCircuit.value.wireJunctions).toHaveLength(1)
    })

    it('should remove pasted elements on undo', () => {
      const pastedElements = {
        components: [testUtils.createMockComponent('input')],
        wires: [testUtils.createMockWire()],
        junctions: [testUtils.createMockJunction()]
      }
      
      const command = new undoController.PasteCommand(mockCircuitManager, pastedElements)
      command.execute()
      command.undo()
      
      expect(mockCircuitManager.activeCircuit.value.components).toHaveLength(0)
      expect(mockCircuitManager.activeCircuit.value.wires).toHaveLength(0)
      expect(mockCircuitManager.activeCircuit.value.wireJunctions).toHaveLength(0)
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple undo/redo operations', () => {
      const component1 = testUtils.createMockComponent('input')
      const component2 = testUtils.createMockComponent('output')
      const command1 = new undoController.AddComponentCommand(mockCircuitManager, component1)
      const command2 = new undoController.AddComponentCommand(mockCircuitManager, component2)
      
      // Execute both commands
      undoController.executeCommand(command1)
      undoController.executeCommand(command2)
      expect(undoController.undoStackSize.value).toBe(2)
      
      // Undo both
      undoController.undo()
      undoController.undo()
      expect(undoController.undoStackSize.value).toBe(0)
      expect(undoController.redoStackSize.value).toBe(2)
      
      // Redo both
      undoController.redo()
      undoController.redo()
      expect(undoController.undoStackSize.value).toBe(2)
      expect(undoController.redoStackSize.value).toBe(0)
    })

    it('should handle mixed individual and grouped commands', () => {
      const component1 = testUtils.createMockComponent('input')
      const component2 = testUtils.createMockComponent('output')
      const component3 = testUtils.createMockComponent('and-gate')
      
      // Individual command
      const command1 = new undoController.AddComponentCommand(mockCircuitManager, component1)
      undoController.executeCommand(command1)
      
      // Grouped commands
      undoController.startCommandGroup('Add pair')
      const command2 = new undoController.AddComponentCommand(mockCircuitManager, component2)
      const command3 = new undoController.AddComponentCommand(mockCircuitManager, component3)
      undoController.executeCommand(command2)
      undoController.executeCommand(command3)
      undoController.endCommandGroup()
      
      expect(undoController.undoStackSize.value).toBe(2) // Individual + group
      
      // Undo group (should remove both components)
      undoController.undo()
      expect(mockCircuitManager.removeComponent).toHaveBeenCalledTimes(2)
      
      // Undo individual
      undoController.undo()
      expect(mockCircuitManager.removeComponent).toHaveBeenCalledTimes(3)
    })
  })

  describe('utility methods', () => {
    it('should clear all history', () => {
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      undoController.executeCommand(command)
      expect(undoController.undoStackSize.value).toBe(1)
      
      undoController.clearHistory()
      
      expect(undoController.undoStackSize.value).toBe(0)
      expect(undoController.redoStackSize.value).toBe(0)
      expect(undoController.canUndo.value).toBe(false)
      expect(undoController.canRedo.value).toBe(false)
    })

    it('should provide undo stack info', () => {
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      undoController.executeCommand(command)
      
      const info = undoController.getUndoStackInfo()
      
      expect(info).toMatchObject({
        undoCount: 1,
        redoCount: 0,
        maxLevels: 10,
        recentCommands: expect.any(Array)
      })
      expect(info.recentCommands[0]).toMatchObject({
        description: expect.any(String),
        timestamp: expect.any(Number)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle commands with no active circuit', () => {
      mockCircuitManager.activeCircuit.value = null
      
      const component = testUtils.createMockComponent('input')
      const command = new undoController.AddComponentCommand(mockCircuitManager, component)
      
      // Should not throw error
      expect(() => command.execute()).not.toThrow()
      expect(() => command.undo()).not.toThrow()
    })

    it('should handle removing non-existent component', () => {
      const command = new undoController.RemoveComponentCommand(mockCircuitManager, 'non-existent')
      
      // Should not throw error
      expect(() => command.execute()).not.toThrow()
      expect(() => command.undo()).not.toThrow()
    })

    it('should handle updating non-existent component', () => {
      const command = new undoController.UpdateComponentCommand(
        mockCircuitManager,
        'non-existent',
        { label: 'New' },
        { label: 'Old' }
      )
      
      // Should not throw error
      expect(() => command.execute()).not.toThrow()
      expect(() => command.undo()).not.toThrow()
    })
  })
})