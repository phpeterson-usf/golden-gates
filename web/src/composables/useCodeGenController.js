import { componentRegistry } from '../utils/componentRegistry'
import { resetNameRegistry } from '../generators/BaseComponentGenerator'
import { createComponentGenerator } from '../generators/ComponentGeneratorFactory'

export function useCodeGenController() {
  // All components now use TypeScript mixins for code generation
  // No fallback logic needed - every component implements generate() via mixins

  // Helper function to get component outputs (handles both registry and schematic components)
  function getComponentOutputs(component, circuitManager) {
    const config = componentRegistry[component.type]
    if (config?.getConnections) {
      // Use dynamic connections for components like splitter/merger and schematic components
      const connections = config.getConnections(component.props || {}, circuitManager)
      return connections.outputs || []
    }
    return config?.connections?.outputs || []
  }

  // Helper function to get component inputs (handles both registry and schematic components)
  function getComponentInputs(component, circuitManager) {
    const config = componentRegistry[component.type]
    if (config?.getConnections) {
      // Use dynamic connections for components like splitter/merger and schematic components
      const connections = config.getConnections(component.props || {}, circuitManager)
      return connections.inputs || []
    }
    return config?.connections?.inputs || []
  }

  // Helper function to get port name from port index
  function getPortName(ports, portIndex, portType) {
    if (ports && Array.isArray(ports) && portIndex >= 0 && portIndex < ports.length) {
      const port = ports[portIndex]

      if (port && typeof port === 'object') {
        // For schematic components, use the label from the interface
        if (port.label) {
          return port.label
        }

        // For components with named ports (like splitter/merger), use the name
        if (port.name) {
          return port.name
        }

        // Fallback to port id if no label
        if (port.id) {
          return port.id
        }
      }
    }

    // Enhanced error reporting when port name cannot be resolved
    if (ports && Array.isArray(ports)) {
      console.warn(`getPortName: Port index ${portIndex} out of bounds for ${portType} ports array of length ${ports.length}. Available ports:`, ports.map(p => p?.label || p?.name || p?.id || 'unnamed'))
    } else {
      console.warn(`getPortName: Invalid ports array for ${portType}:`, ports)
    }

    // Fallback to port index for regular components or when no name is found
    return portIndex.toString()
  }

  // Helper function to find component at a connection point
  function findComponentAtConnection(components, connection, circuitManager = null) {
    for (const component of components) {
      const config = componentRegistry[component.type]
      if (!config) continue

      // Get connections for this component
      let connections
      if (config.getConnections) {
        connections = config.getConnections(component.props, circuitManager)
      } else {
        connections = config.connections
      }

      // Check if this connection matches an output
      if (connection.portType === 'output' && connections.outputs) {
        const output = connections.outputs[connection.portIndex]
        if (output) {
          const outputPos = { x: component.x + output.x, y: component.y + output.y }
          if (outputPos.x === connection.pos.x && outputPos.y === connection.pos.y) {
            return component
          }
        }
      }

      // Check if this connection matches an input
      if (connection.portType === 'input' && connections.inputs) {
        const input = connections.inputs[connection.portIndex]
        if (input) {
          const inputPos = { x: component.x + input.x, y: component.y + input.y }
          if (inputPos.x === connection.pos.x && inputPos.y === connection.pos.y) {
            return component
          }
        }
      }
    }
    return null
  }

  function generateGglProgram(
    components,
    wires,
    wireJunctions,
    componentRefs,
    componentInstances,
    circuitManager = null,
    includeRun = true
  ) {
    // Reset the global name registry for fresh sequential naming
    resetNameRegistry()

    const sections = []
    const circuitVarName = 'circuit0' // Dynamic circuit name to avoid conflicts
    

    // Header - import all GGL modules (unused imports are not an error in Python)
    sections.push(
      `from ggl import arithmetic, circuit, component, io, logic, memory, plexers, wires`
    )

    // Import all circuit components used in this circuit
    const componentImports = findRequiredComponentImports(components, circuitManager)
    if (componentImports) {
      sections.push(componentImports)
    }

    sections.push('')
    sections.push(`${circuitVarName} = circuit.Circuit(js_logging=True)`)
    sections.push('')

    // Phase 1: Generate all components first
    const componentVarNames = {} // Map component IDs to their variable names
    const componentErrors = [] // Collect errors for components

    // Use BFS to process components level by level
    const queue = []
    const visited = new Set()
    const processedConnections = new Set() // Track which connections we've already generated

    // Start with input components
    const inputComponents = components.filter(c => c.type === 'input')
    for (const input of inputComponents) {
      queue.push(input)
      visited.add(input.id)
    }

    // If no inputs, start with all components (for circuits that are purely combinational loops)
    if (inputComponents.length === 0) {
      for (const comp of components) {
        queue.push(comp)
        visited.add(comp.id)
      }
    }

    // Process components in BFS order
    const componentOrder = []
    while (queue.length > 0) {
      const component = queue.shift()
      componentOrder.push(component)

      // Find all components connected downstream from this one
      const outgoingWires = wires.filter(w => {
        const sourceComp = findComponentAtConnection(components, w.startConnection, circuitManager)
        return sourceComp && sourceComp.id === component.id
      })

      for (const wire of outgoingWires) {
        const destComp = findComponentAtConnection(components, wire.endConnection, circuitManager)
        if (destComp && !visited.has(destComp.id)) {
          visited.add(destComp.id)
          queue.push(destComp)
        }
      }
    }

    // Add any components we missed (disconnected components)
    for (const comp of components) {
      if (!visited.has(comp.id)) {
        componentOrder.push(comp)
      }
    }

    // Generate all component declarations first
    for (const component of componentOrder) {
      let varName

      if (component.type === 'schematic-component') {
        // Handle schematic components (saved circuits)
        const circuitId = component.props?.circuitId || component.circuitId
        const componentDef = circuitManager?.getComponentDefinition?.(circuitId)
        if (componentDef) {
          // Create meaningful variable name based on the circuit name
          const baseName = componentDef.name.toLowerCase()
          const instanceCount =
            componentOrder
              .filter(
                c =>
                  c.type === 'schematic-component' &&
                  (c.props?.circuitId || c.circuitId) === circuitId
              )
              .indexOf(component) + 1
          varName = `${baseName}_${instanceCount}`
          componentVarNames[component.id] = varName
          sections.push(`${varName} = ${componentDef.name}()`)
        } else {
          console.error(`Schematic component definition not found for ${circuitId}`)
          varName = `comp_${component.id.replace(/-/g, '_')}`
          componentVarNames[component.id] = varName
        }
      } else {
        // Handle regular components (input, output, logic gates)
        varName = `comp_${component.id.replace(/-/g, '_')}`
        componentVarNames[component.id] = varName

        const instance = componentInstances[component.id]
        if (instance && instance.generate) {
          // Use the component's own generate() method (all components have this via mixins)
          const generated = instance.generate()

          // Update varName to match the component's preferred naming
          componentVarNames[component.id] = generated.varName

          // Create component
          sections.push(generated.code)
        } else {
          // Use TypeScript factory to generate code from component data
          try {
            const generator = createComponentGenerator(component, { isMainCircuit: includeRun })
            const generated = generator.generate()
            componentVarNames[component.id] = generated.varName
            sections.push(generated.code)
          } catch (error) {
            console.error(
              `Failed to generate code for component ${component.id} of type ${component.type}:`,
              error
            )
            continue
          }
        }
      }
    }

    sections.push('')

    // Phase 2: Generate all connections
    // First, identify which wires are connected to junctions
    const junctionSourceWireIds = new Set()
    if (wireJunctions && wireJunctions.length > 0) {
      for (const junction of wireJunctions) {
        if (junction.sourceWireIndex !== undefined && wires[junction.sourceWireIndex]) {
          junctionSourceWireIds.add(wires[junction.sourceWireIndex].id)
        }
      }
    }

    // Process all wires and create connections
    for (const wire of wires) {
      // Skip wires that have junctions on them - they'll be handled in junction processing
      if (junctionSourceWireIds.has(wire.id)) {
        continue
      }

      const sourceComp = findComponentAtConnection(components, wire.startConnection, circuitManager)
      const destComp = findComponentAtConnection(components, wire.endConnection, circuitManager)

      if (!sourceComp || !destComp) {
        // Check if this wire is from a junction - if so, it will be handled later
        const isJunctionWire = wireJunctions.some(j => j.connectedWireId === wire.id)
        if (!isJunctionWire) {
          // Mark connected components with error state and details
          const errorDetails = {
            wireId: wire.id,
            startPos: `(${wire.startConnection.x}, ${wire.startConnection.y})`,
            endPos: `(${wire.endConnection.x}, ${wire.endConnection.y})`
          }

          // If source component exists but destination doesn't, mark source with error
          if (sourceComp && !destComp) {
            const sourceLabel = sourceComp.props?.label || sourceComp.label || 'unlabeled'
            componentErrors.push({
              componentId: sourceComp.id,
              error: {
                severity: 'error',
                messageId: 'WIRE_MISSING_DESTINATION',
                message: `Wire from ${sourceComp.type} "${sourceLabel}" has no destination component`,
                details: errorDetails
              }
            })
          }

          // If destination exists but source doesn't, mark destination with error
          if (!sourceComp && destComp) {
            const destLabel = destComp.props?.label || destComp.label || 'unlabeled'
            componentErrors.push({
              componentId: destComp.id,
              error: {
                severity: 'error',
                messageId: 'WIRE_MISSING_SOURCE',
                message: `Wire to ${destComp.type} "${destLabel}" has no source component`,
                details: errorDetails
              }
            })
          }

          // If neither exists, we can't mark anything - just log
          if (!sourceComp && !destComp) {
            console.error(
              `Dangling wire: id=${wire.id}, from ${errorDetails.startPos} to ${errorDetails.endPos}`
            )
          }
        }
        continue
      }

      const sourceVarName = componentVarNames[sourceComp.id]
      const destVarName = componentVarNames[destComp.id]

      if (!sourceVarName || !destVarName) {
        console.error(`Variable names not found for components: ${sourceComp.id} -> ${destComp.id}`)
        continue
      }

      // Create a unique key for this connection to avoid duplicates
      const connectionKey = `${sourceComp.id}:${wire.startConnection.portIndex}->${destComp.id}:${wire.endConnection.portIndex}`

      if (!processedConnections.has(connectionKey)) {
        processedConnections.add(connectionKey)
        sections.push(
          generateConnection(
            wire,
            components,
            componentVarNames,
            sourceVarName,
            destVarName,
            circuitVarName,
            circuitManager
          )
        )
      }
    }

    // Process wire junctions to find additional connections
    // A junction connects wires together, so we need to find all wires connected through junctions
    if (wireJunctions && wireJunctions.length > 0) {
      for (const junction of wireJunctions) {
        // Find the source wire (the wire that was clicked on to create the junction)
        const sourceWire = wires[junction.sourceWireIndex]
        if (!sourceWire) continue

        // Process the original source wire connection first
        const sourceWireStart = findComponentAtConnection(
          components,
          sourceWire.startConnection,
          circuitManager
        )
        const sourceWireEnd = findComponentAtConnection(
          components,
          sourceWire.endConnection,
          circuitManager
        )

        if (sourceWireStart && sourceWireEnd) {
          const startVarName = componentVarNames[sourceWireStart.id]
          const endVarName = componentVarNames[sourceWireEnd.id]

          if (startVarName && endVarName) {
            const connectionKey = `${sourceWireStart.id}:${sourceWire.startConnection.portIndex}->${sourceWireEnd.id}:${sourceWire.endConnection.portIndex}`

            if (!processedConnections.has(connectionKey)) {
              processedConnections.add(connectionKey)
              sections.push(
                generateConnection(
                  sourceWire,
                  components,
                  componentVarNames,
                  startVarName,
                  endVarName,
                  circuitVarName,
                  circuitManager
                )
              )
            }
          }
        }

        // Find all wires connected from this junction
        const junctionWires = wires.filter(w => w.id === junction.connectedWireId)

        for (const junctionWire of junctionWires) {
          // Each junction wire connects from the source wire's start to its own end
          const junctionDest = findComponentAtConnection(
            components,
            junctionWire.endConnection,
            circuitManager
          )

          if (sourceWireStart && junctionDest) {
            const sourceVarName = componentVarNames[sourceWireStart.id]
            const destVarName = componentVarNames[junctionDest.id]

            if (sourceVarName && destVarName) {
              const connectionKey = `${sourceWireStart.id}:${sourceWire.startConnection.portIndex}->${junctionDest.id}:${junctionWire.endConnection.portIndex}`

              if (!processedConnections.has(connectionKey)) {
                processedConnections.add(connectionKey)

                // Create a virtual wire representing the junction connection
                const virtualWire = {
                  id: junctionWire.id, // Use the junction wire's ID
                  startConnection: sourceWire.startConnection,
                  endConnection: junctionWire.endConnection
                }

                sections.push(
                  generateConnection(
                    virtualWire,
                    components,
                    componentVarNames,
                    sourceVarName,
                    destVarName,
                    circuitVarName,
                    circuitManager
                  )
                )
              }
            }
          }
        }
      }
    }

    // Only include run() call for main circuit execution, not for component definitions
    if (includeRun) {
      sections.push(`${circuitVarName}.run()`)
    }

    // Return both the generated code and any errors
    return {
      code: sections.join('\n'),
      errors: componentErrors
    }
  }

  function generateConnection(
    wire,
    components,
    componentVarNames,
    sourceVarName,
    destVarName,
    circuitVarName,
    circuitManager = null
  ) {
    const sourcePort = wire.startConnection.portIndex
    const destPort = wire.endConnection.portIndex

    // Find the source and destination components by position
    const sourceComp = findComponentAtConnection(components, wire.startConnection, circuitManager)
    const destComp = findComponentAtConnection(components, wire.endConnection, circuitManager)

    if (!sourceComp || !destComp) {
      console.error('Could not find components for wire connection')
      return ''
    }

    // Get component configurations (either from registry or schematic definitions)
    const sourceOutputs = getComponentOutputs(sourceComp, circuitManager)
    const destInputs = getComponentInputs(destComp, circuitManager)

    // Generate connection based on number of ports
    let sourceExpr = sourceVarName
    let destExpr = destVarName

    // Get component configurations
    const sourceConfig = componentRegistry[sourceComp.type]
    const destConfig = componentRegistry[destComp.type]

    // Determine if we need to specify port names
    const sourceRequiresNamedPorts =
      sourceComp.type === 'schematic-component' ||
      sourceConfig?.requiresNamedPorts ||
      sourceOutputs.length > 1

    const destRequiresNamedPorts =
      destComp.type === 'schematic-component' ||
      destConfig?.requiresNamedPorts ||
      destInputs.length > 1

    if (sourceRequiresNamedPorts) {
      const outputName = getPortName(sourceOutputs, sourcePort, 'output')
      sourceExpr = `${sourceVarName}.output("${outputName}")`
    }

    if (destRequiresNamedPorts) {
      const inputName = getPortName(destInputs, destPort, 'input')
      destExpr = `${destVarName}.input("${inputName}")`
    }

    // Generate descriptive comment
    let comment = `# ${sourceVarName}`
    if (sourceOutputs.length > 1 && sourcePort > 0) {
      comment += `.out[${sourcePort}]`
    }
    comment += ` -> ${destVarName}`
    if (destInputs.length > 1 || destPort > 0) {
      comment += `.in[${destPort}]`
    }

    // Only include js_id if wire has a valid ID
    const jsIdParam = wire.id && wire.id !== 'undefined' ? `, js_id="${wire.id}"` : ''
    return `${circuitVarName}.connect(${sourceExpr}, ${destExpr}${jsIdParam})    ${comment}`
  }

  /**
   * Generate a GGL program for a circuit component (without run() call)
   */
  function generateGglProgramForCircuitComponent(circuit, circuitManager) {
    // Generate the GGL code for this circuit (without run() call for components)
    const result = generateGglProgram(
      circuit.components,
      circuit.wires,
      circuit.wireJunctions,
      {}, // componentRefs - not needed when using factory approach
      {}, // componentInstances - not needed when using factory approach
      circuitManager,
      false // Don't include run() call for component modules
    )
    // For now, just return the code part for backward compatibility
    return result.code
  }

  /**
   * Wrap a GGL program as an importable Python component module
   */
  function wrapGglProgramAsComponentModule(componentName, gglProgram, requiredImports) {
    return `from ggl import arithmetic, circuit, logic, io, wires, plexers

# Import other components this circuit uses
${requiredImports}

# Build the circuit
${gglProgram}

# Export as a reusable component
${componentName} = circuit.Component(circuit0)
`
  }

  /**
   * Find all component imports required by a circuit
   */
  function findRequiredComponentImports(components, circuitManager, excludeComponentName = null) {
    const imports = new Set()

    components.forEach(comp => {
      if (comp.type === 'schematic-component') {
        const circuitId = comp.props?.circuitId || comp.circuitId
        const componentDef = circuitManager.getComponentDefinition(circuitId)
        if (componentDef && componentDef.name !== excludeComponentName) {
          imports.add(`from ${componentDef.name} import ${componentDef.name}`)
        }
      }
    })

    return Array.from(imports).join('\n')
  }


  return {
    generateGglProgram,
    generateGglProgramForCircuitComponent,
    wrapGglProgramAsComponentModule,
    findRequiredComponentImports
  }
}
