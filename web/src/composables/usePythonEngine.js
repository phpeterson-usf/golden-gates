import { ref, shallowRef } from 'vue'
import { loadPyodide } from 'pyodide'

/**
 * Python Engine - Unified Pyodide integration for circuit simulation
 * Combines Pyodide initialization, MEMFS operations, and Python execution
 */

// Singleton Pyodide instance and state
const pyodideInstance = shallowRef(null)
const isLoading = ref(false)
const isReady = ref(false)
const error = ref(null)

export function usePythonEngine() {
  /**
   * Initialize Pyodide with GGL module setup
   */
  async function initialize() {
    if (pyodideInstance.value) {
      return pyodideInstance.value
    }

    isLoading.value = true
    error.value = null

    try {
      pyodideInstance.value = await loadPyodide({
        indexURL: '/pyodide/'
      })
      
      // Set up ggl module loading for Pyodide
      await pyodideInstance.value.runPythonAsync(`
import sys
import os
from pyodide.http import pyfetch

# Create a directory for the ggl module
os.makedirs('/home/pyodide/ggl', exist_ok=True)

# Function to recursively fetch Python files
async def fetch_python_files(base_url, target_dir):
    """
    Fetch __init__.py first, which should contain imports that tell us
    what other files we need to fetch.
    """
    # Start with __init__.py
    try:
        response = await pyfetch(f"{base_url}__init__.py")
        if response.status == 200:
            content = await response.text()
            with open(f"{target_dir}/__init__.py", 'w') as f:
                f.write(content)
            
            # Parse imports to find other required files
            import ast
            tree = ast.parse(content)
            
            required_files = set()
            for node in ast.walk(tree):
                if isinstance(node, ast.ImportFrom) and node.module is None:
                    # from .module import ...
                    for alias in node.names:
                        if alias.name != '*':
                            required_files.add(f"{alias.name}.py")
                elif isinstance(node, ast.ImportFrom) and node.level == 1:
                    # from .module import ...
                    module_name = node.module.split('.')[0]
                    required_files.add(f"{module_name}.py")
            
            # Also add any additional known files that might not be imported
            additional_files = ['ggl_logging.py']
            required_files.update(additional_files)
            
            # Fetch each required file
            for filename in required_files:
                try:
                    response = await pyfetch(f"{base_url}{filename}")
                    if response.status == 200:
                        content = await response.text()
                        with open(f"{target_dir}/{filename}", 'w') as f:
                            f.write(content)
                        print(f"Fetched {filename}")
                except Exception as e:
                    print(f"Warning: Could not fetch {filename}: {e}")
                    
            print(f"GGL module loaded with {len(required_files) + 1} files")
            
    except Exception as e:
        print(f"Error loading ggl module: {e}")

# Fetch the ggl module files
await fetch_python_files('/ggl/', '/home/pyodide/ggl')

# Add to Python path
sys.path.insert(0, '/home/pyodide')

# Test import
try:
    import ggl
    print("GGL module imported successfully")
except ImportError as e:
    print(f"Warning: Could not import ggl: {e}")
      `)
      
      isReady.value = true
      
      return pyodideInstance.value
    } catch (err) {
      error.value = err
      console.error('Failed to load Pyodide:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Execute Python code asynchronously
   */
  async function runPython(code) {
    if (!pyodideInstance.value) {
      throw new Error('Pyodide not initialized. Call initialize() first.')
    }

    try {
      return await pyodideInstance.value.runPythonAsync(code)
    } catch (err) {
      console.error('Python execution error:', err)
      throw err
    }
  }

  /**
   * Execute Python code synchronously
   */
  function runPythonSync(code) {
    if (!pyodideInstance.value) {
      throw new Error('Pyodide not initialized. Call initialize() first.')
    }

    try {
      return pyodideInstance.value.runPython(code)
    } catch (err) {
      console.error('Python execution error:', err)
      throw err
    }
  }

  /**
   * Load a Python package
   */
  async function loadPackage(packageName) {
    if (!pyodideInstance.value) {
      throw new Error('Pyodide not initialized. Call initialize() first.')
    }

    try {
      await pyodideInstance.value.loadPackage(packageName)
    } catch (err) {
      console.error(`Failed to load package ${packageName}:`, err)
      throw err
    }
  }

  /**
   * Write all saved circuit components as Python modules to Pyodide's MEMFS
   * This allows components to import other components in hierarchical circuits
   */
  async function writeAllCircuitComponentsToMemfs(circuitManager) {
    if (!pyodideInstance.value) {
      throw new Error('Pyodide not initialized. Call initialize() first.')
    }

    // Clean up any existing component files first
    await removeExistingComponentFilesFromMemfs()
    
    // Import circuit generation functions
    const { useCodeGenController } = await import('./useCodeGenController.js')
    const { generateGglProgramForCircuitComponent, wrapGglProgramAsComponentModule, findRequiredComponentImports } = useCodeGenController()
    
    // Write ALL saved components as Python modules to MEMFS
    for (const [id, component] of circuitManager.availableComponents.value) {
      if (component.type === 'circuit-component') {
        const circuit = circuitManager.getCircuit(component.circuitId)
        if (!circuit) continue
        
        // Generate GGL program for this component's circuit
        const gglProgramCode = generateGglProgramForCircuitComponent(circuit, circuitManager)
        
        // Wrap as importable Python module
        const pythonModuleCode = wrapGglProgramAsComponentModule(
          component.name,
          gglProgramCode,
          findRequiredComponentImports(circuit.components, circuitManager, component.name)
        )
        
        // Log the generated component module for debugging and verification
        const fileName = `${component.name}.py`
        console.log(`\n=== Writing ${fileName} to MEMFS ===`)
        console.log(pythonModuleCode)
        console.log(`=== End of ${fileName} ===\n`)
        
        // Write to Pyodide's MEMFS
        pyodideInstance.value.FS.writeFile(fileName, pythonModuleCode)
      }
    }
  }

  /**
   * Remove existing component files from Pyodide's MEMFS
   */
  async function removeExistingComponentFilesFromMemfs() {
    if (!pyodideInstance.value) return
    
    try {
      const files = pyodideInstance.value.FS.readdir('.')
      files.forEach(file => {
        if (file.endsWith('.py') && !file.startsWith('_')) {
          try {
            pyodideInstance.value.FS.unlink(file)
          } catch (e) {
            // File might not exist or be a system file
          }
        }
      })
      
      // Clear Python's import cache for our modules
      try {
        pyodideInstance.value.runPython(`
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
  function configurePythonImportPath() {
    if (!pyodideInstance.value) return
    
    // Since Pyodide already sets up sys.path in initialization, 
    // and MEMFS files are written to the current directory ('.'),
    // we just need to ensure '.' is in the path if it's not already there
    try {
      const result = pyodideInstance.value.runPython(`
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
  async function executePythonProgram(gglProgram) {
    if (!pyodideInstance.value) {
      throw new Error('Pyodide not initialized. Call initialize() first.')
    }

    const pythonExecutionCode = `
# Make updateCallback available in builtins so all modules can access it
import builtins
import js
builtins.updateCallback = js.window.__vueUpdateCallback

# Execute the GGL program
exec(${JSON.stringify(gglProgram)})

"Simulation completed successfully"
`
    
    return await pyodideInstance.value.runPythonAsync(pythonExecutionCode)
  }

  /**
   * Execute hierarchical circuit simulation with all MEMFS operations
   */
  async function executeHierarchicalCircuit(circuitManager, gglProgram) {
    if (!pyodideInstance.value) {
      throw new Error('Pyodide not initialized. Call initialize() first.')
    }

    // Step 1: Write all saved circuit components as Python modules to MEMFS
    await writeAllCircuitComponentsToMemfs(circuitManager)
    
    // Step 2: Configure Python import path for MEMFS (optional - MEMFS might already be in path)
    try {
      configurePythonImportPath()
    } catch (e) {
      console.warn('Could not configure Python import path, continuing anyway:', e)
    }
    
    // Step 3: Execute the complete hierarchical circuit program
    return await executePythonProgram(gglProgram)
  }

  return {
    // State
    pyodide: pyodideInstance,
    isLoading,
    isReady,
    error,
    
    // Core Pyodide operations
    initialize,
    runPython,
    runPythonSync,
    loadPackage,
    
    // MEMFS operations
    writeAllCircuitComponentsToMemfs,
    removeExistingComponentFilesFromMemfs,
    configurePythonImportPath,
    
    // Python execution
    executePythonProgram,
    executeHierarchicalCircuit
  }
}