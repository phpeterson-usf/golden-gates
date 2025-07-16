export function useFileService() {

  const saveCircuit = async (components, wires, wireJunctions, circuitMetadata = {}, schematicComponents = {}) => {
    try {
      // Filter out runtime value attribute from output components
      const sanitizedComponents = (components || []).map(component => {
        if (component.type === 'output') {
          const { value, ...propsWithoutValue } = component.props || {}
          return {
            ...component,
            props: propsWithoutValue
          }
        }
        return component
      })

      // Create the circuit data object with consistent top-level structure
      const circuitData = {
        version: '1.2', // Grid unit coordinate system
        timestamp: new Date().toISOString(),
        // Circuit-level properties at top level for consistency with version/timestamp
        name: circuitMetadata.name || 'Untitled Circuit',
        label: circuitMetadata.label || circuitMetadata.name || 'Untitled Circuit',
        interface: circuitMetadata.interface,
        // Component instances and structure
        components: sanitizedComponents,
        wires: wires || [],
        wireJunctions: wireJunctions || [],
        // Schematic component definitions for hierarchical circuits
        schematicComponents: schematicComponents || {}
      }
      
      // Convert to JSON string with nice formatting
      const jsonString = JSON.stringify(circuitData, null, 2)
      
      // Check if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        try {
          // Use the File System Access API for better UX
          const circuitName = circuitMetadata.name || 'circuit'
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
          const handle = await window.showSaveFilePicker({
            suggestedName: `${circuitName}_${timestamp}.json`,
            types: [{
              description: 'JSON Circuit File',
              accept: { 'application/json': ['.json'] }
            }]
          })
          
          // Create a writable stream and write the file
          const writable = await handle.createWritable()
          await writable.write(jsonString)
          await writable.close()
          
        } catch (err) {
          // User cancelled the save dialog
          if (err.name === 'AbortError') {
            return
          }
          throw err
        }
      } else {
        // Fallback to traditional download for browsers that don't support File System Access API
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const circuitName = circuitMetadata.name || 'circuit'
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
        const link = document.createElement('a')
        link.href = url
        link.download = `${circuitName}_${timestamp}.json`
        document.body.appendChild(link)
        link.click()
        
        // Clean up
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
      }
    } catch (error) {
      console.error('Error saving circuit:', error)
      throw error
    }
  }

  const openCircuit = async () => {
    try {
      let fileContent = null
      
      // Check if File System Access API is supported
      if ('showOpenFilePicker' in window) {
        try {
          // Use the File System Access API
          const [fileHandle] = await window.showOpenFilePicker({
            types: [{
              description: 'JSON Circuit File',
              accept: { 'application/json': ['.json'] }
            }],
            multiple: false
          })
          
          const file = await fileHandle.getFile()
          fileContent = await file.text()
        } catch (err) {
          // User cancelled the open dialog
          if (err.name === 'AbortError') {
            return null
          }
          throw err
        }
      } else {
        // Fallback to input element
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json,application/json'
        
        const filePromise = new Promise((resolve, reject) => {
          const handleChange = async (e) => {
            const file = e.target.files[0]
            if (file) {
              try {
                const content = await file.text()
                resolve(content)
              } catch (err) {
                reject(err)
              }
            } else {
              resolve(null)
            }
            
            // Clean up the input element and event listener
            input.removeEventListener('change', handleChange)
            input.remove()
          }
          
          input.addEventListener('change', handleChange)
          
          // Simulate click
          input.click()
        })
        
        fileContent = await filePromise
        if (!fileContent) return null
      }
      
      return fileContent
    } catch (error) {
      console.error('Error opening file:', error)
      throw error
    }
  }

  const validateCircuitData = (circuitData) => {
    // Validate the circuit data structure
    if (!circuitData || typeof circuitData !== 'object') {
      throw new Error('Invalid circuit file: not an object')
    }
    
    if (!Array.isArray(circuitData.components)) {
      throw new Error('Invalid circuit file: missing components array')
    }
    
    if (!Array.isArray(circuitData.wires)) {
      throw new Error('Invalid circuit file: missing wires array')
    }
    
    // Validate component structure
    for (const component of circuitData.components) {
      if (!component.id || !component.type || 
          typeof component.x !== 'number' || 
          typeof component.y !== 'number') {
        throw new Error('Invalid component structure')
      }
    }
    
    // Validate v1.1+ format fields
    if (circuitData.name && typeof circuitData.name !== 'string') {
      throw new Error('Invalid circuit file: name must be a string')
    }
    
    if (circuitData.label && typeof circuitData.label !== 'string') {
      throw new Error('Invalid circuit file: label must be a string')
    }
    
    if (circuitData.interface && typeof circuitData.interface !== 'object') {
      throw new Error('Invalid circuit file: interface must be an object')
    }
    
    if (circuitData.schematicComponents && typeof circuitData.schematicComponents !== 'object') {
      throw new Error('Invalid circuit file: schematicComponents must be an object')
    }
    
    return true
  }

  const migrateCircuitData = (circuitData) => {
    // Constants for migration
    const GRID_SIZE = 15
    
    // Check if this is an old format that needs migration
    // We can detect this by checking if wire coordinates are large numbers (pixels)
    // or if version is missing/old
    const needsMigration = !circuitData.version || circuitData.version < '1.2'
    
    if (!needsMigration) {
      return circuitData
    }
    
    // Create a copy to avoid mutating original data
    const migratedData = JSON.parse(JSON.stringify(circuitData))
    
    // Migrate component coordinates (if they're in pixels)
    if (migratedData.components) {
      migratedData.components.forEach(component => {
        // If coordinates are large numbers, they're likely in pixels
        if (component.x > 20 || component.y > 20) {
          component.x = Math.round(component.x / GRID_SIZE)
          component.y = Math.round(component.y / GRID_SIZE)
        }
      })
    }
    
    // Migrate wire coordinates (if they're in pixels)
    if (migratedData.wires) {
      migratedData.wires.forEach(wire => {
        if (wire.points) {
          wire.points.forEach(point => {
            // If coordinates are large numbers, they're likely in pixels
            if (point.x > 20 || point.y > 20) {
              point.x = Math.round(point.x / GRID_SIZE)
              point.y = Math.round(point.y / GRID_SIZE)
            }
          })
        }
        
        // Migrate wire connection positions
        if (wire.startConnection && wire.startConnection.pos) {
          const pos = wire.startConnection.pos
          if (pos.x > 20 || pos.y > 20) {
            pos.x = Math.round(pos.x / GRID_SIZE)
            pos.y = Math.round(pos.y / GRID_SIZE)
          }
        }
        
        if (wire.endConnection && wire.endConnection.pos) {
          const pos = wire.endConnection.pos
          if (pos.x > 20 || pos.y > 20) {
            pos.x = Math.round(pos.x / GRID_SIZE)
            pos.y = Math.round(pos.y / GRID_SIZE)
          }
        }
      })
    }
    
    // Migrate wire junction positions
    if (migratedData.wireJunctions) {
      migratedData.wireJunctions.forEach(junction => {
        if (junction.pos) {
          const pos = junction.pos
          if (pos.x > 20 || pos.y > 20) {
            pos.x = Math.round(pos.x / GRID_SIZE)
            pos.y = Math.round(pos.y / GRID_SIZE)
          }
        }
      })
    }
    
    // Update version to indicate migration
    migratedData.version = '1.2'
    
    return migratedData
  }

  const parseAndValidateJSON = (jsonString) => {
    try {
      const circuitData = JSON.parse(jsonString)
      validateCircuitData(circuitData)
      
      // Migrate data format if needed
      const migratedData = migrateCircuitData(circuitData)
      
      return migratedData
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error('Invalid JSON format: ' + err.message)
      }
      throw err
    }
  }

  return {
    saveCircuit,
    openCircuit,
    parseAndValidateJSON
  }
}