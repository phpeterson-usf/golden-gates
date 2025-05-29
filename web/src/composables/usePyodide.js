import { ref, shallowRef } from 'vue'
import { loadPyodide } from 'pyodide'

const pyodideInstance = shallowRef(null)
const isLoading = ref(false)
const isReady = ref(false)
const error = ref(null)

export function usePyodide() {
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
      console.log('Pyodide loaded successfully')
      
      return pyodideInstance.value
    } catch (err) {
      error.value = err
      console.error('Failed to load Pyodide:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

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

  return {
    pyodide: pyodideInstance,
    isLoading,
    isReady,
    error,
    initialize,
    runPython,
    runPythonSync,
    loadPackage
  }
}