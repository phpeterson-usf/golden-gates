export function useFileOperations() {

  const saveCircuit = async (components, wires, wireJunctions) => {
    try {
      // Create the circuit data object
      const circuitData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        components: components || [],
        wires: wires || [],
        wireJunctions: wireJunctions || []
      }
      
      // Convert to JSON string with nice formatting
      const jsonString = JSON.stringify(circuitData, null, 2)
      
      // Check if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        try {
          // Use the File System Access API for better UX
          const handle = await window.showSaveFilePicker({
            suggestedName: `circuit_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`,
            types: [{
              description: 'JSON Circuit File',
              accept: { 'application/json': ['.json'] }
            }]
          })
          
          // Create a writable stream and write the file
          const writable = await handle.createWritable()
          await writable.write(jsonString)
          await writable.close()
          
          console.log('Circuit saved successfully using File System Access API')
        } catch (err) {
          // User cancelled the save dialog
          if (err.name === 'AbortError') {
            console.log('Save cancelled by user')
            return
          }
          throw err
        }
      } else {
        // Fallback to traditional download for browsers that don't support File System Access API
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `circuit_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
        document.body.appendChild(link)
        link.click()
        
        // Clean up
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        console.log('Circuit saved successfully using fallback method')
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
            console.log('Open cancelled by user')
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
          input.addEventListener('change', async (e) => {
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
          })
          
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
    
    return true
  }

  const parseAndValidateJSON = (jsonString) => {
    try {
      const circuitData = JSON.parse(jsonString)
      validateCircuitData(circuitData)
      return circuitData
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