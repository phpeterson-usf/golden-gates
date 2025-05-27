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