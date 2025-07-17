import { ref, computed } from 'vue'

/**
 * Undo Controller - Command pattern implementation for undo/redo operations
 * Manages a stack of reversible commands for circuit modifications
 */
export function useUndoController(maxUndoLevels = 50) {
  // Undo stack state
  const undoStack = ref([])
  const redoStack = ref([])
  const currentCommandGroup = ref(null)
  const isExecutingCommand = ref(false)
  
  // Computed properties
  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)
  
  // Get current undo stack size
  const undoStackSize = computed(() => undoStack.value.length)
  const redoStackSize = computed(() => redoStack.value.length)
  
  /**
   * Base command interface
   * All commands must implement execute() and undo() methods
   */
  class Command {
    constructor(description = 'Command') {
      this.description = description
      this.timestamp = Date.now()
    }
    
    execute() {
      throw new Error('Command must implement execute() method')
    }
    
    undo() {
      throw new Error('Command must implement undo() method')
    }
  }
  
  /**
   * Command group for batching multiple operations
   */
  class CommandGroup extends Command {
    constructor(description = 'Command Group') {
      super(description)
      this.commands = []
    }
    
    addCommand(command) {
      this.commands.push(command)
    }
    
    execute() {
      this.commands.forEach(command => command.execute())
    }
    
    undo() {
      // Undo commands in reverse order
      for (let i = this.commands.length - 1; i >= 0; i--) {
        this.commands[i].undo()
      }
    }
    
    isEmpty() {
      return this.commands.length === 0
    }
  }
  
  /**
   * Add Component Command
   */
  class AddComponentCommand extends Command {
    constructor(circuitModel, component) {
      super(`Add ${component.type} component`)
      this.circuitModel = circuitModel
      this.component = component
    }
    
    execute() {
      this.circuitModel.addComponent(this.component)
    }
    
    undo() {
      this.circuitModel.removeComponent(this.component.id)
    }
  }
  
  /**
   * Remove Component Command
   */
  class RemoveComponentCommand extends Command {
    constructor(circuitModel, componentId) {
      super(`Remove component`)
      this.circuitModel = circuitModel
      this.componentId = componentId
      this.component = null
    }
    
    execute() {
      // Store component data before removal
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        this.component = circuit.components.find(c => c.id === this.componentId)
      }
      this.circuitModel.removeComponent(this.componentId)
    }
    
    undo() {
      // NOTE: Component undo is not fully functional due to architectural limitations
      // The circuit model reactive references are not available during undo operations
      // This causes components to be partially restored but not rendered correctly
      if (this.component) {
        this.circuitModel.addComponent(this.component)
      }
    }
  }
  
  /**
   * Update Component Command
   */
  class UpdateComponentCommand extends Command {
    constructor(circuitModel, componentId, newProps, oldProps) {
      super(`Update component`)
      this.circuitModel = circuitModel
      this.componentId = componentId
      this.newProps = newProps
      this.oldProps = oldProps
    }
    
    execute() {
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        const component = circuit.components.find(c => c.id === this.componentId)
        if (component) {
          Object.assign(component, this.newProps)
        }
      }
    }
    
    undo() {
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        const component = circuit.components.find(c => c.id === this.componentId)
        if (component) {
          Object.assign(component, this.oldProps)
        }
      }
    }
  }
  
  /**
   * Move Component Command
   */
  class MoveComponentCommand extends Command {
    constructor(circuitModel, componentId, newPosition, oldPosition) {
      super(`Move component`)
      this.circuitModel = circuitModel
      this.componentId = componentId
      this.newPosition = newPosition
      this.oldPosition = oldPosition
    }
    
    execute() {
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        const component = circuit.components.find(c => c.id === this.componentId)
        if (component) {
          component.x = this.newPosition.x
          component.y = this.newPosition.y
        }
      }
    }
    
    undo() {
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        const component = circuit.components.find(c => c.id === this.componentId)
        if (component) {
          component.x = this.oldPosition.x
          component.y = this.oldPosition.y
        }
      }
    }
  }
  
  /**
   * Add Wire Command
   */
  class AddWireCommand extends Command {
    constructor(circuitModel, wire) {
      super(`Add wire`)
      this.circuitModel = circuitModel
      this.wire = wire
    }
    
    execute() {
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        circuit.wires.push(this.wire)
      }
    }
    
    undo() {
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        const wireIndex = circuit.wires.findIndex(w => w.id === this.wire.id)
        if (wireIndex !== -1) {
          circuit.wires.splice(wireIndex, 1)
        }
      }
    }
  }
  
  /**
   * Remove Wire Command
   */
  class RemoveWireCommand extends Command {
    constructor(circuitModel, wireId) {
      super(`Remove wire`)
      this.circuitModel = circuitModel
      this.wireId = wireId
      this.wire = null
    }
    
    execute() {
      // Store wire data before removal, then remove using circuitModel method
      this.wire = this.circuitModel.removeWire(this.wireId)
    }
    
    undo() {
      // Restore wire using circuitModel method
      if (this.wire) {
        this.circuitModel.addWire(this.wire)
      }
    }
  }
  
  /**
   * Paste Command - for clipboard operations
   */
  class PasteCommand extends Command {
    constructor(circuitModel, pastedElements) {
      super(`Paste ${pastedElements.components.length} components`)
      this.circuitModel = circuitModel
      this.pastedElements = pastedElements
    }
    
    execute() {
      // Add pasted components using circuitModel methods
      this.pastedElements.components.forEach(component => {
        this.circuitModel.addComponent(component)
      })
      
      // Add pasted wires and junctions directly to the active circuit
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        this.pastedElements.wires.forEach(wire => {
          circuit.wires.push(wire)
        })
        
        this.pastedElements.junctions.forEach(junction => {
          circuit.wireJunctions.push(junction)
        })
      }
    }
    
    undo() {
      // Remove pasted components using circuitModel methods
      this.pastedElements.components.forEach(component => {
        this.circuitModel.removeComponent(component.id)
      })
      
      // Remove pasted wires and junctions directly from the active circuit
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        this.pastedElements.wires.forEach(wire => {
          const index = circuit.wires.findIndex(w => w.id === wire.id)
          if (index !== -1) {
            circuit.wires.splice(index, 1)
          }
        })
        
        this.pastedElements.junctions.forEach(junction => {
          const index = circuit.wireJunctions.findIndex(j => 
            j.pos.x === junction.pos.x && j.pos.y === junction.pos.y
          )
          if (index !== -1) {
            circuit.wireJunctions.splice(index, 1)
          }
        })
      }
    }
  }
  
  /**
   * Duplicate Command - for duplicate operations
   */
  class DuplicateCommand extends Command {
    constructor(circuitModel, duplicatedElements) {
      super(`Duplicate ${duplicatedElements.components.length} components`)
      this.circuitModel = circuitModel
      this.duplicatedElements = duplicatedElements
    }
    
    execute() {
      // Add duplicated components using circuitModel methods
      this.duplicatedElements.components.forEach(component => {
        this.circuitModel.addComponent(component)
      })
      
      // Add duplicated wires and junctions directly to the active circuit
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        this.duplicatedElements.wires.forEach(wire => {
          circuit.wires.push(wire)
        })
        
        this.duplicatedElements.junctions.forEach(junction => {
          circuit.wireJunctions.push(junction)
        })
      }
    }
    
    undo() {
      // Remove duplicated components using circuitModel methods
      this.duplicatedElements.components.forEach(component => {
        this.circuitModel.removeComponent(component.id)
      })
      
      // Remove duplicated wires and junctions directly from the active circuit
      const circuit = this.circuitModel.activeCircuit.value
      if (circuit) {
        this.duplicatedElements.wires.forEach(wire => {
          const index = circuit.wires.findIndex(w => w.id === wire.id)
          if (index !== -1) {
            circuit.wires.splice(index, 1)
          }
        })
        
        this.duplicatedElements.junctions.forEach(junction => {
          const index = circuit.wireJunctions.findIndex(j => 
            j.pos.x === junction.pos.x && j.pos.y === junction.pos.y
          )
          if (index !== -1) {
            circuit.wireJunctions.splice(index, 1)
          }
        })
      }
    }
  }
  
  /**
   * Execute a command and add it to the undo stack
   * @param {Command} command - Command to execute
   */
  function executeCommand(command) {
    if (isExecutingCommand.value) {
      // If we're already executing a command, just run it without adding to stack
      command.execute()
      return
    }
    
    // Clear redo stack when executing new command
    redoStack.value = []
    
    // If we're in a command group, add to the group
    if (currentCommandGroup.value) {
      currentCommandGroup.value.addCommand(command)
      command.execute()
      return
    }
    
    // Execute the command
    command.execute()
    
    // Add to undo stack
    undoStack.value.push(command)
    
    // Limit undo stack size
    if (undoStack.value.length > maxUndoLevels) {
      undoStack.value.shift()
    }
  }
  
  /**
   * Start a command group for batching operations
   * @param {string} description - Description of the command group
   */
  function startCommandGroup(description) {
    if (currentCommandGroup.value) {
      console.warn('Command group already started')
      return
    }
    
    currentCommandGroup.value = new CommandGroup(description)
  }
  
  /**
   * End the current command group and add to undo stack
   */
  function endCommandGroup() {
    if (!currentCommandGroup.value) {
      console.warn('No command group to end')
      return
    }
    
    const group = currentCommandGroup.value
    currentCommandGroup.value = null
    
    // Only add non-empty groups to undo stack
    if (!group.isEmpty()) {
      undoStack.value.push(group)
      
      // Limit undo stack size
      if (undoStack.value.length > maxUndoLevels) {
        undoStack.value.shift()
      }
    }
  }
  
  /**
   * Undo the last command
   */
  function undo() {
    if (undoStack.value.length === 0) {
      return false
    }
    
    isExecutingCommand.value = true
    
    const command = undoStack.value.pop()
    command.undo()
    redoStack.value.push(command)
    
    isExecutingCommand.value = false
    
    return true
  }
  
  /**
   * Redo the last undone command
   */
  function redo() {
    if (redoStack.value.length === 0) {
      return false
    }
    
    isExecutingCommand.value = true
    
    const command = redoStack.value.pop()
    command.execute()
    undoStack.value.push(command)
    
    isExecutingCommand.value = false
    
    return true
  }
  
  /**
   * Clear all undo/redo history
   */
  function clearHistory() {
    undoStack.value = []
    redoStack.value = []
    currentCommandGroup.value = null
  }
  
  /**
   * Get undo stack information for debugging
   */
  function getUndoStackInfo() {
    return {
      undoCount: undoStack.value.length,
      redoCount: redoStack.value.length,
      maxLevels: maxUndoLevels,
      recentCommands: undoStack.value.slice(-5).map(cmd => ({
        description: cmd.description,
        timestamp: cmd.timestamp
      }))
    }
  }
  
  return {
    // State
    canUndo,
    canRedo,
    undoStackSize,
    redoStackSize,
    
    // Core operations
    executeCommand,
    undo,
    redo,
    clearHistory,
    
    // Command grouping
    startCommandGroup,
    endCommandGroup,
    
    // Command classes for external use
    Command,
    CommandGroup,
    AddComponentCommand,
    RemoveComponentCommand,
    UpdateComponentCommand,
    MoveComponentCommand,
    AddWireCommand,
    RemoveWireCommand,
    PasteCommand,
    DuplicateCommand,
    
    // Utility
    getUndoStackInfo
  }
}