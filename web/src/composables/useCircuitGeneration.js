import { componentRegistry } from '../utils/componentRegistry'

export function useCircuitGeneration() {
  
  // Helper function to find component at a connection point
  function findComponentAtConnection(components, connection) {
    for (const component of components) {
      const config = componentRegistry[component.type]
      if (!config) continue
      
      // Get connections for this component
      let connections
      if (config.getConnections) {
        connections = config.getConnections(component.props)
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
  
  function generateGglProgram(components, wires, wireJunctions, componentRefs, componentInstances) {
    const sections = []
    const circuitVarName = 'circuit0' // Dynamic circuit name to avoid conflicts
    
    // Header
    sections.push('from ggl import io, logic, circuit')
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
        const sourceComp = findComponentAtConnection(components, w.startConnection)
        return sourceComp && sourceComp.id === component.id
      })
      
      for (const wire of outgoingWires) {
        const destComp = findComponentAtConnection(components, wire.endConnection)
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
      // Get the component instance and call its generate() method
      const instance = componentInstances[component.id]
      if (!instance || !instance.generate) {
        console.error(`Component ${component.id} has no generate method`)
        continue
      }
      
      // Use the component's own generate() method
      const generated = instance.generate()
      const varName = generated.varName
      
      // Store the variable name for later use
      componentVarNames[component.id] = varName
      
      // Create component
      sections.push(generated.code)
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
      
      const sourceComp = findComponentAtConnection(components, wire.startConnection)
      const destComp = findComponentAtConnection(components, wire.endConnection)
      
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
        sections.push(generateConnection(wire, components, componentVarNames, sourceVarName, destVarName, circuitVarName))
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
        const sourceWireStart = findComponentAtConnection(components, sourceWire.startConnection)
        const sourceWireEnd = findComponentAtConnection(components, sourceWire.endConnection)
        
        if (sourceWireStart && sourceWireEnd) {
          const startVarName = componentVarNames[sourceWireStart.id]
          const endVarName = componentVarNames[sourceWireEnd.id]
          
          if (startVarName && endVarName) {
            const connectionKey = `${sourceWireStart.id}:${sourceWire.startConnection.portIndex}->${sourceWireEnd.id}:${sourceWire.endConnection.portIndex}`
            
            if (!processedConnections.has(connectionKey)) {
              processedConnections.add(connectionKey)
              sections.push(generateConnection(sourceWire, components, componentVarNames, startVarName, endVarName, circuitVarName))
            }
          }
        }
        
        // Find all wires connected from this junction
        const junctionWires = wires.filter(w => w.id === junction.connectedWireId)
        
        for (const junctionWire of junctionWires) {
          // Each junction wire connects from the source wire's start to its own end
          const junctionDest = findComponentAtConnection(components, junctionWire.endConnection)
          
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
                
                sections.push(generateConnection(virtualWire, components, componentVarNames, sourceVarName, destVarName, circuitVarName))
              }
            }
          }
        }
      }
    }
    
    sections.push(`${circuitVarName}.run()`)
    
    return sections.join('\n')
  }
  
  function generateConnection(wire, components, componentVarNames, sourceVarName, destVarName, circuitVarName) {
    const sourcePort = wire.startConnection.portIndex
    const destPort = wire.endConnection.portIndex
    
    // Find the source and destination components by position
    const sourceComp = findComponentAtConnection(components, wire.startConnection)
    const destComp = findComponentAtConnection(components, wire.endConnection)
    
    if (!sourceComp || !destComp) {
      console.error('Could not find components for wire connection')
      return ''
    }
    
    // Get component definitions from registry
    const sourceConfig = componentRegistry[sourceComp.type]
    const destConfig = componentRegistry[destComp.type]
    
    // Generate connection based on number of ports
    let sourceExpr = sourceVarName
    let destExpr = destVarName
    
    // Only add output specifier if component has multiple outputs
    const sourceOutputs = sourceConfig?.connections?.outputs || []
    if (sourceOutputs.length > 1) {
      sourceExpr = `${sourceVarName}.output("${sourcePort}")`
    }
    
    // Only add input specifier if component has multiple inputs
    const destInputs = destConfig?.connections?.inputs || []
    if (destInputs.length > 1) {
      destExpr = `${destVarName}.input("${destPort}")`
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