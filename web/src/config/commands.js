// Command palette configuration with i18n support
export const commandGroups = {
  file: {
    labelKey: 'commands.groups.file',
    items: [
      {
        id: 'new-circuit',
        labelKey: 'commands.file.newCircuit',
        icon: 'pi pi-plus',
        action: 'createNewCircuit'
      },
      {
        id: 'open-circuit',
        labelKey: 'commands.file.openCircuit',
        icon: 'pi pi-folder-open',
        action: 'openCircuit',
        shortcut: 'O'
      },
      {
        id: 'save-circuit',
        labelKey: 'commands.file.saveCircuit',
        icon: 'pi pi-save',
        action: 'saveCircuit',
        shortcut: 'S'
      },
      {
        id: 'clear-circuit',
        labelKey: 'commands.file.clearCircuit',
        icon: 'pi pi-trash',
        action: 'clearCircuit'
      },
      {
        separator: true
      },
      {
        id: 'restore-autosave',
        labelKey: 'commands.file.restoreAutosave',
        icon: 'pi pi-history',
        action: 'restoreAutosave'
      }
    ]
  },
  simulation: {
    labelKey: 'commands.groups.simulation',
    items: [
      {
        id: 'run-simulation',
        labelKey: 'commands.simulation.run',
        icon: 'pi pi-play',
        action: 'runSimulation',
        shortcut: 'R'
      },
      {
        id: 'stop-simulation',
        labelKey: 'commands.simulation.stop',
        icon: 'pi pi-stop',
        action: 'stopSimulation',
        shortcut: 'T'
      }
    ]
  },
  insert: {
    labelKey: 'commands.groups.insert',
    items: [
      {
        id: 'insert-and-gate',
        labelKey: 'commands.insert.andGate',
        componentType: 'and',
        action: 'addComponent',
        params: ['and-gate']
      },
      {
        id: 'insert-or-gate',
        labelKey: 'commands.insert.orGate',
        componentType: 'or',
        action: 'addComponent',
        params: ['or-gate']
      },
      {
        id: 'insert-xor-gate',
        labelKey: 'commands.insert.xorGate',
        componentType: 'xor',
        action: 'addComponent',
        params: ['xor-gate']
      },
      {
        id: 'insert-not-gate',
        labelKey: 'commands.insert.notGate',
        componentType: 'not',
        action: 'addComponent',
        params: ['not-gate']
      },
      {
        id: 'insert-nand-gate',
        labelKey: 'commands.insert.nandGate',
        componentType: 'nand',
        action: 'addComponent',
        params: ['nand-gate']
      },
      {
        id: 'insert-nor-gate',
        labelKey: 'commands.insert.norGate',
        componentType: 'nor',
        action: 'addComponent',
        params: ['nor-gate']
      },
      {
        id: 'insert-xnor-gate',
        labelKey: 'commands.insert.xnorGate',
        componentType: 'xnor',
        action: 'addComponent',
        params: ['xnor-gate']
      },
      {
        separator: true
      },
      {
        id: 'insert-input',
        labelKey: 'commands.insert.input',
        componentType: 'input',
        action: 'addComponent',
        params: ['input']
      },
      {
        id: 'insert-output',
        labelKey: 'commands.insert.output',
        componentType: 'output',
        action: 'addComponent',
        params: ['output']
      },
      {
        id: 'insert-constant',
        labelKey: 'commands.insert.constant',
        componentType: 'constant',
        action: 'addComponent',
        params: ['constant']
      },
      {
        separator: true
      },
      {
        id: 'insert-splitter',
        labelKey: 'commands.insert.splitter',
        componentType: 'splitter',
        action: 'addComponent',
        params: ['splitter']
      },
      {
        id: 'insert-merger',
        labelKey: 'commands.insert.merger',
        componentType: 'merger',
        action: 'addComponent',
        params: ['merger']
      },
      {
        separator: true
      },
      {
        id: 'insert-multiplexer',
        labelKey: 'commands.insert.multiplexer',
        componentType: 'multiplexer',
        action: 'addComponent',
        params: ['multiplexer']
      }
    ]
  }
}

// Helper function to get all commands as a flat list for searching
export function getAllCommands() {
  const commands = []
  Object.entries(commandGroups).forEach(([groupKey, group]) => {
    group.items.forEach(item => {
      if (!item.separator) {
        commands.push({
          ...item,
          groupKey,
          groupLabelKey: group.labelKey
        })
      }
    })
  })
  return commands
}

// Helper function to get commands for dynamic circuit components
export function getDynamicComponentCommands(availableComponents) {
  return availableComponents.map(component => ({
    id: `insert-component-${component.id}`,
    labelKey: null, // Use component.name directly
    label: component.name,
    icon: 'pi pi-chip',
    action: 'addCircuitComponent',
    params: [component.id],
    groupKey: 'insert',
    groupLabelKey: 'commands.groups.insert'
  }))
}
