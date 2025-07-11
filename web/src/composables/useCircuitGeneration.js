import { componentRegistry } from '../utils/componentRegistry'

export function useCircuitGeneration() {
  
  // Helper function to find required component imports for circuit generation
  function findRequiredComponentImportsForGeneration(components, circuitManager) {
    if (!circuitManager) return ''
    
    const imports = new Set()
    
    components.forEach(comp => {
      if (comp.type === 'schematic-component') {
        const circuitId = comp.props?.circuitId || comp.circuitId
        const componentDef = circuitManager.getComponentDefinition(circuitId)
        if (componentDef) {
          imports.add(`from ${componentDef.name} import ${componentDef.name}`)
        }
      }
    })
    
    return Array.from(imports).join('\n')
  }
  
  // Helper function to generate component code from registry
  function generateComponentCode(component, varName) {
    const config = componentRegistry[component.type]
    if (!config) {
      console.error(`No registry config found for component type: ${component.type}`)
      return null
    }

    const props = component.props || {}
    
    switch (component.type) {
      case 'input':
        return `${varName} = io.Input(bits=${props.bits || 1}, label="${props.label || 'IN'}")\n${varName}.value = ${props.value || 0}`
      
      case 'output':
        return `${varName} = io.Output(bits=${props.bits || 1}, label="${props.label || 'OUT'}", js_id="${component.id}")`
      
      case 'and-gate':
        return `${varName} = logic.And(label="${props.label || 'and1'}")`
      
      case 'or-gate':
        return `${varName} = logic.Or(label="${props.label || 'or1'}")`
      
      case 'not-gate':
        return `${varName} = logic.Not(label="${props.label || 'not1'}")`
      
      case 'nand-gate':
        return `${varName} = logic.Nand(label="${props.label || 'nand1'}")`
      
      case 'nor-gate':
        return `${varName} = logic.Nor(label="${props.label || 'nor1'}")`
      
      case 'xor-gate':
        return `${varName} = logic.Xor(label="${props.label || 'xor1'}")`
      
      case 'xnor-gate':
        return `${varName} = logic.Xnor(label="${props.label || 'xnor1'}")`
      
      case 'buffer':
        return `${varName} = logic.Buffer(label="${props.label || 'buf1'}")`
      
      default:
        console.warn(`Unknown component type for code generation: ${component.type}`)
        return null
    }
  }

  // Helper function to get component outputs (handles both registry and schematic components)
  function getComponentOutputs(component, circuitManager) {
    if (component.type === 'schematic-component') {
      const circuitId = component.props?.circuitId || component.circuitId
      const componentDef = circuitManager?.getComponentDefinition?.(circuitId)
      return componentDef?.interface?.outputs || []
    } else {
      const config = componentRegistry[component.type]
      return config?.connections?.outputs || []
    }
  }

  // Helper function to get component inputs (handles both registry and schematic components)
  function getComponentInputs(component, circuitManager) {
    if (component.type === 'schematic-component') {
      const circuitId = component.props?.circuitId || component.circuitId
      const componentDef = circuitManager?.getComponentDefinition?.(circuitId)
      return componentDef?.interface?.inputs || []
    } else {
      const config = componentRegistry[component.type]
      return config?.connections?.inputs || []
    }
  }

  // Helper function to get port name from port index
  function getPortName(ports, portIndex, portType) {
    if (ports && ports[portIndex]) {
      const port = ports[portIndex]
      
      // For schematic components, use the label from the interface
      if (port.label) {
        return port.label
      }
      
      // Fallback to port id if no label
      if (port.id) {
        return port.id
      }
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
  
  function generateGglProgram(components, wires, wireJunctions, componentRefs, componentInstances, circuitManager = null) {
    const sections = []
    const circuitVarName = 'circuit0' // Dynamic circuit name to avoid conflicts
    
    // Header
    sections.push('from ggl import io, logic, circuit')
    
    // Import all circuit components used in this circuit
    const componentImports = findRequiredComponentImportsForGeneration(components, circuitManager)
    if (componentImports) {
      sections.push(componentImports)
    }
    
    sections.push('')
    sections.push(`${circuitVarName} = circuit.Circuit(js_logging=True)`)
    sections.push('')
    
    // Phase 1: Generate all components first
    const componentVarNames = {} // Map component IDs to their variable names
    
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
          const instanceCount = componentOrder.filter(c => 
            c.type === 'schematic-component' && 
            (c.props?.circuitId || c.circuitId) === circuitId
          ).indexOf(component) + 1
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
          // Use the component's own generate() method if available
          const generated = instance.generate()
          
          // Update varName to match our naming convention
          componentVarNames[component.id] = generated.varName
          
          // Create component
          sections.push(generated.code)
        } else {
          // Fallback: Generate code directly from component registry
          const generatedCode = generateComponentCode(component, varName)
          if (generatedCode) {
            sections.push(generatedCode)
          } else {
            console.error(`Could not generate code for component ${component.id} of type ${component.type}`)
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
          console.error(`Component not found for wire connection`)
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
        sections.push(generateConnection(wire, components, componentVarNames, sourceVarName, destVarName, circuitVarName, circuitManager))
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
        const sourceWireStart = findComponentAtConnection(components, sourceWire.startConnection, circuitManager)
        const sourceWireEnd = findComponentAtConnection(components, sourceWire.endConnection, circuitManager)
        
        if (sourceWireStart && sourceWireEnd) {
          const startVarName = componentVarNames[sourceWireStart.id]
          const endVarName = componentVarNames[sourceWireEnd.id]
          
          if (startVarName && endVarName) {
            const connectionKey = `${sourceWireStart.id}:${sourceWire.startConnection.portIndex}->${sourceWireEnd.id}:${sourceWire.endConnection.portIndex}`
            
            if (!processedConnections.has(connectionKey)) {
              processedConnections.add(connectionKey)
              sections.push(generateConnection(sourceWire, components, componentVarNames, startVarName, endVarName, circuitVarName, circuitManager))
            }
          }
        }
        
        // Find all wires connected from this junction
        const junctionWires = wires.filter(w => w.id === junction.connectedWireId)
        
        for (const junctionWire of junctionWires) {
          // Each junction wire connects from the source wire's start to its own end
          const junctionDest = findComponentAtConnection(components, junctionWire.endConnection, circuitManager)
          
          if (sourceWireStart && junctionDest) {
            const sourceVarName = componentVarNames[sourceWireStart.id]
            const destVarName = componentVarNames[junctionDest.id]
            
            if (sourceVarName && destVarName) {
              const connectionKey = `${sourceWireStart.id}:${sourceWire.startConnection.portIndex}->${junctionDest.id}:${junctionWire.endConnection.portIndex}`
              
              if (!processedConnections.has(connectionKey)) {
                processedConnections.add(connectionKey)
                
                // Create a virtual wire representing the junction connection
                const virtualWire = {
                  startConnection: sourceWire.startConnection,
                  endConnection: junctionWire.endConnection
                }
                
                sections.push(generateConnection(virtualWire, components, componentVarNames, sourceVarName, destVarName, circuitVarName, circuitManager))
              }
            }
          }
        }
      }
    }
    
    sections.push(`${circuitVarName}.run()`)
    
    return sections.join('\n')
  }
  
  function generateConnection(wire, components, componentVarNames, sourceVarName, destVarName, circuitVarName, circuitManager = null) {
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
    
    // Only add output specifier if component has multiple outputs
    if (sourceOutputs.length > 1) {
      const outputName = getPortName(sourceOutputs, sourcePort, 'output')
      sourceExpr = `${sourceVarName}.output("${outputName}")`
    }
    
    // Only add input specifier if component has multiple inputs
    if (destInputs.length > 1) {
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
    
    return `${circuitVarName}.connect(${sourceExpr}, ${destExpr})    ${comment}`
  }
  
  return {
    generateGglProgram
  }
}