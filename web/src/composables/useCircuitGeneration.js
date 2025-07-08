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
    
    const visited = new Set()
    const inProgress = new Set()  // For cycle detection
    const componentOrder = []
    
    // Start from input components
    const inputComponents = components.filter(c => c.type === 'input')
    
    // Process each input's downstream components
    for (const input of inputComponents) {
      visitComponent(input)
    }
    
    // Process any remaining unvisited components (disconnected or in cycles)
    for (const comp of components) {
      if (!visited.has(comp.id)) {
        visitComponent(comp)
      }
    }
    
    function visitComponent(component) {
      if (visited.has(component.id)) return
      
      if (inProgress.has(component.id)) {
        // We've hit a cycle - just note it and continue
        console.log(`Cycle detected at component ${component.props?.label || component.id}`)
        return
      }
      
      inProgress.add(component.id)
      
      // Visit all components that feed INTO this one first
      // (unless they would create a cycle)
      const incomingWires = wires.filter(w => {
        const endComp = findComponentAtConnection(components, w.endConnection)
        return endComp && endComp.id === component.id
      })
      for (const wire of incomingWires) {
        const sourceComp = findComponentAtConnection(components, wire.startConnection)
        if (sourceComp && !visited.has(sourceComp.id)) {
          visitComponent(sourceComp)
        }
      }
      
      // Now add this component
      visited.add(component.id)
      inProgress.delete(component.id)
      componentOrder.push(component)
    }
    
    // Generate code in the determined order
    const componentVarNames = {} // Map component IDs to their variable names
    
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
      
      // Add incoming connections
      const incomingWires = wires.filter(w => {
        const endComp = findComponentAtConnection(components, w.endConnection)
        return endComp && endComp.id === component.id
      })
      if (incomingWires.length > 0) {
        for (const wire of incomingWires) {
          const sourceComp = findComponentAtConnection(components, wire.startConnection)
          if (!sourceComp) {
            // Check if this wire is from a junction - if so, it will be handled later
            const isJunctionWire = wireJunctions.some(j => j.connectedWireId === wire.id)
            if (!isJunctionWire) {
              console.error(`Source component not found for wire connection at position ${wire.startConnection.pos.x},${wire.startConnection.pos.y}`)
            }
            continue
          }
          const sourceVarName = componentVarNames[sourceComp.id]
          if (!sourceVarName) {
            console.error(`Source component ${sourceComp.id} not yet processed`)
            continue
          }
          
          sections.push(generateConnection(wire, components, componentVarNames, sourceVarName, varName, circuitVarName))
        }
      }
      
      sections.push('')
    }
    
    // Process wire junctions to find additional connections
    // A junction connects wires together, so we need to find all wires connected through junctions
    if (wireJunctions && wireJunctions.length > 0) {
      // Build a map of wire connections through junctions
      const wireConnections = new Map() // Map wire ID to the wire it connects to through a junction
      
      for (const junction of wireJunctions) {
        // Find the source wire (the wire that was clicked on to create the junction)
        const sourceWire = wires[junction.sourceWireIndex]
        if (!sourceWire) continue
        
        // Find the connected wire (the new wire created from the junction)
        const connectedWire = wires.find(w => w.id === junction.connectedWireId)
        if (!connectedWire) continue
        
        // The connected wire inherits the source from the source wire
        // So we need to create a connection from the source wire's source to the connected wire's destination
        const sourceComp = findComponentAtConnection(components, sourceWire.startConnection)
        const destComp = findComponentAtConnection(components, connectedWire.endConnection)
        
        if (sourceComp && destComp) {
          const sourceVarName = componentVarNames[sourceComp.id]
          const destVarName = componentVarNames[destComp.id]
          
          if (sourceVarName && destVarName) {
            // Create a virtual wire representing the junction connection
            const virtualWire = {
              startConnection: sourceWire.startConnection,
              endConnection: connectedWire.endConnection
            }
            
            sections.push(generateConnection(virtualWire, components, componentVarNames, sourceVarName, destVarName, circuitVarName))
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