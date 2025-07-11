/**
 * Pyodide MEMFS Operations for Circuit Components
 * Handles writing circuit components as Python modules to Pyodide's memory filesystem
 */

/**
 * Write all saved circuit components as Python modules to Pyodide's MEMFS
 * This allows components to import other components in hierarchical circuits
 */
export async function writeAllCircuitComponentsToPyodideMemfs(circuitManager, pyodide) {
  // Clean up any existing component files first
  await removeExistingComponentFilesFromMemfs(pyodide)
  
  // Write ALL saved components as Python modules to MEMFS
  for (const [id, component] of circuitManager.availableComponents.value) {
    if (component.type === 'circuit-component') {
      const circuit = circuitManager.getCircuit(component.circuitId)
      if (!circuit) continue
      
      // Generate GGL program for this component's circuit
      const gglProgramCode = await generateGglProgramForCircuitComponent(
        circuit,
        circuitManager
      )
      
      // Wrap as importable Python module
      const pythonModuleCode = wrapGglProgramAsComponentModule(
        component.name,
        gglProgramCode,
        findRequiredComponentImports(circuit.components, circuitManager)
      )
      
      // Write to Pyodide's MEMFS
      const fileName = `${component.name}.py`
      pyodide.FS.writeFile(fileName, pythonModuleCode)
    }
  }
}

/**
 * Generate a GGL program for a circuit component
 */
async function generateGglProgramForCircuitComponent(circuit, circuitManager) {
  // Import the circuit generation function
  const { useCircuitGeneration } = await import('./useCircuitGeneration.js')
  const { generateGglProgram } = useCircuitGeneration()
  
  // Generate the GGL code for this circuit
  return generateGglProgram(
    circuit.components,
    circuit.wires,
    circuit.wireJunctions,
    {}, // componentRefs - not needed for component generation
    {}, // componentInstances - not needed for component generation
    circuitManager
  )
}

/**
 * Wrap a GGL program as an importable Python component module
 */
function wrapGglProgramAsComponentModule(componentName, gglProgram, requiredImports) {
  return `from ggl import circuit, logic, io

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
function findRequiredComponentImports(components, circuitManager) {
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

/**
 * Remove existing component files from Pyodide's MEMFS
 */
export async function removeExistingComponentFilesFromMemfs(pyodide) {
  try {
    const files = pyodide.FS.readdir('.')
    files.forEach(file => {
      if (file.endsWith('.py') && !file.startsWith('_')) {
        try {
          pyodide.FS.unlink(file)
        } catch (e) {
          // File might not exist or be a system file
        }
      }
    })
    
    // Clear Python's import cache for our modules
    try {
      pyodide.runPython(`
import sys
if hasattr(sys, 'modules'):
    modules_to_remove = [m for m in sys.modules.keys() 
                         if not m.startswith('_') and '.' not in m 
                         and m not in ['ggl', 'circuit', 'logic', 'io', 'sys']]
    for module in modules_to_remove:
        if module in sys.modules:
            del sys.modules[module]
    print(f"Removed {len(modules_to_remove)} modules from cache")
`)
    } catch (e) {
      console.warn('Could not clear Python import cache:', e)
    }
    
  } catch (e) {
    console.warn('Error cleaning up MEMFS:', e)
  }
}

/**
 * Configure Python import path to include MEMFS root directory
 */
export function configurePythonImportPathForMemfs(pyodide) {
  // Since Pyodide already sets up sys.path in initialization, 
  // and MEMFS files are written to the current directory ('.'),
  // we just need to ensure '.' is in the path if it's not already there
  try {
    const result = pyodide.runPython(`
import sys
import os
current_dir = os.getcwd()
print(f"Current working directory: {current_dir}")
print(f"sys.path: {sys.path}")
if '.' not in sys.path:
    sys.path.insert(0, '.')
    print("Added '.' to sys.path")
'Python path configured'
`)
  } catch (e) {
    console.warn('Could not configure Python import path:', e)
    // This is not critical - MEMFS might work anyway
  }
}

/**
 * Execute a Python program in Pyodide with proper error handling
 */
export async function executePythonProgramInPyodide(gglProgram, pyodide) {
  const pythonExecutionCode = `
# Make updateCallback available in builtins so all modules can access it
import builtins
import js
builtins.updateCallback = js.window.__vueUpdateCallback

# Execute the GGL program
exec(${JSON.stringify(gglProgram)})

"Simulation completed successfully"
`
  
  return await pyodide.runPythonAsync(pythonExecutionCode)
}