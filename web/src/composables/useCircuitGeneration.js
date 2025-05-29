export function useCircuitGeneration() {
  
  function generateGglProgram(components, wires, componentRefs, componentInstances) {
    const sections = []
    
    // Header
    sections.push('from ggl import io, logic, circuit')
    sections.push('')
    sections.push('c = circuit.Circuit(js_logging=True)')
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
      const incomingWires = wires.filter(w => w.endConnection.componentId === component.id)
      for (const wire of incomingWires) {
        const sourceComp = components.find(c => c.id === wire.startConnection.componentId)
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
      const incomingWires = wires.filter(w => w.endConnection.componentId === component.id)
      if (incomingWires.length > 0) {
        for (const wire of incomingWires) {
          const sourceVarName = componentVarNames[wire.startConnection.componentId]
          if (!sourceVarName) {
            console.error(`Source component ${wire.startConnection.componentId} not yet processed`)
            continue
          }
          
          sections.push(generateConnection(wire, componentVarNames, sourceVarName, varName))
        }
      }
      
      sections.push('')
    }
    
    sections.push('c.run()')
    
    return sections.join('\n')
  }
  
  function generateConnection(wire, componentVarNames, sourceVarName, destVarName) {
    const sourcePort = wire.startConnection.portIndex
    const destPort = wire.endConnection.portIndex
    
    // Generate connection based on port indices
    let sourceExpr = sourceVarName
    let destExpr = destVarName
    
    // Need to check the component type to determine if we need port specifiers
    // AND gates have multiple inputs, so we always need to specify the input port
    // For now, we'll always use port specifiers when available
    sourceExpr = `${sourceVarName}.output("${sourcePort}")`
    destExpr = `${destVarName}.input("${destPort}")`
    
    // Generate descriptive comment
    let comment = `# ${sourceVarName}`
    if (sourcePort > 0) {
      comment += `.out[${sourcePort}]`
    }
    comment += ` -> ${destVarName}`
    if (destPort > 0) {
      comment += `.in[${destPort}]`
    }
    
    return `c.connect(${sourceExpr}, ${destExpr})    ${comment}`
  }
  
  return {
    generateGglProgram
  }
}