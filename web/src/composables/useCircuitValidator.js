import { componentRegistry } from '../utils/componentRegistry'

/**
 * Circuit Validator - Validates circuit connections based purely on geometry
 * Determines which components are connected by analyzing wire endpoint positions
 */
export function useCircuitValidator(components, wires, circuitManager) {
  /**
   * Get component connections (unified utility for registry/schematic components)
   */
  function getComponentConnections(component) {
    const config = componentRegistry[component.type]
    if (!config) return null

    return config.getConnections
      ? config.getConnections(component.props, circuitManager)
      : config.connections
  }

  /**
   * Calculate absolute port position
   */
  function getPortPosition(component, port) {
    return {
      x: component.x + port.x,
      y: component.y + port.y
    }
  }

  /**
   * Find all component ports at a given position
   * @param {Object} position - { x, y } in grid units
   * @param {string} [filterType] - 'input' or 'output' to filter port types
   * @returns {Array} Array of { component, portIndex, portType, portName }
   */
  function findPortsAtPosition(position, filterType = null) {
    const foundPorts = []

    for (const component of components.value) {
      const connections = getComponentConnections(component)
      if (!connections) continue

      // Helper to check ports of a specific type
      const checkPorts = (ports, portType) => {
        if (!ports || (filterType && portType !== filterType)) return

        ports.forEach((port, portIndex) => {
          const portPos = getPortPosition(component, port)
          if (portPos.x === position.x && portPos.y === position.y) {
            foundPorts.push({
              component,
              portIndex,
              portType,
              portName: port.name || portIndex.toString()
            })
          }
        })
      }

      checkPorts(connections.outputs, 'output')
      checkPorts(connections.inputs, 'input')
    }

    return foundPorts
  }

  /**
   * Resolve wire connections based on geometry
   * @param {Object} wire - Wire object with startConnection.pos and endConnection.pos
   * @returns {Object} { start: portInfo[], end: portInfo[], errors: string[], valid: boolean }
   */
  function resolveWireConnections(wire) {
    const startOutputs = findPortsAtPosition(wire.startConnection.pos, 'output')
    const endInputs = findPortsAtPosition(wire.endConnection.pos, 'input')

    const errors = []
    const { x: startX, y: startY } = wire.startConnection.pos
    const { x: endX, y: endY } = wire.endConnection.pos

    // Validate start connection
    if (startOutputs.length === 0) {
      errors.push(`Wire start position (${startX}, ${startY}) has no output port`)
    } else if (startOutputs.length > 1) {
      errors.push(`Wire start position (${startX}, ${startY}) has multiple output ports`)
    }

    // Validate end connection
    if (endInputs.length === 0) {
      errors.push(`Wire end position (${endX}, ${endY}) has no input port`)
    } else if (endInputs.length > 1) {
      errors.push(`Wire end position (${endX}, ${endY}) has multiple input ports`)
    }

    return {
      start: startOutputs,
      end: endInputs,
      errors,
      valid: errors.length === 0 && startOutputs.length === 1 && endInputs.length === 1
    }
  }

  /**
   * Get all valid circuit connections for code generation
   * @returns {Array} Array of { wire, sourceComponent, sourcePortIndex, targetComponent, targetPortIndex }
   */
  function getValidConnections() {
    const connections = []

    wires.value.forEach(wire => {
      const resolution = resolveWireConnections(wire)
      if (resolution.valid) {
        const sourcePort = resolution.start[0]
        const targetPort = resolution.end[0]

        connections.push({
          wire,
          sourceComponent: sourcePort.component,
          sourcePortIndex: sourcePort.portIndex,
          targetComponent: targetPort.component,
          targetPortIndex: targetPort.portIndex
        })
      }
    })

    return connections
  }

  /**
   * Validate all wires in the circuit
   * @returns {Object} { validWires: number, errors: string[] }
   */
  function validateAllWires() {
    const allErrors = []
    let validCount = 0

    wires.value.forEach((wire, index) => {
      const resolution = resolveWireConnections(wire)
      if (resolution.valid) {
        validCount++
      } else {
        allErrors.push(...resolution.errors.map(err => `Wire ${index}: ${err}`))
      }
    })

    return {
      validWires: validCount,
      errors: allErrors
    }
  }

  /**
   * Check if circuit is valid for execution
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  function validateCircuit() {
    const { errors } = validateAllWires()

    // Check for unconnected inputs
    const validConnections = getValidConnections()

    components.value.forEach(component => {
      const connections = getComponentConnections(component)
      if (!connections?.inputs) return

      connections.inputs.forEach((port, portIndex) => {
        const portPos = getPortPosition(component, port)

        // Check if any valid connection ends at this position
        const hasConnection = validConnections.some(
          conn =>
            conn.wire.endConnection.pos.x === portPos.x &&
            conn.wire.endConnection.pos.y === portPos.y
        )

        if (!hasConnection) {
          const portName = port.name || portIndex.toString()
          const componentLabel = component.props?.label || component.id
          errors.push(
            `Component ${component.type} "${componentLabel}" input "${portName}" is not connected`
          )
        }
      })
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  return {
    // Core functions for geometry-based connection resolution
    findPortsAtPosition,
    resolveWireConnections,
    getValidConnections,

    // Validation functions
    validateAllWires,
    validateCircuit,

    // Utility functions
    getComponentConnections,
    getPortPosition
  }
}
