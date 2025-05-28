<template>
  <div id="app">
    <Toolbar class="app-toolbar">
      <template #start>
        <Button 
          icon="pi pi-plus" 
          label="Insert" 
          class="p-button-sm" 
          @click="toggleInsertMenu"
          ref="insertButton"
        />
        <TieredMenu 
          ref="insertMenu" 
          :model="menuItems" 
          :popup="true"
        />
      </template>
      <template #end>
        <Button icon="pi pi-play" label="Run" class="p-button-success p-button-sm" @click="runSimulation" :disabled="isRunning" />
        <Button icon="pi pi-stop" label="Stop" class="p-button-danger p-button-sm" @click="stopSimulation" :disabled="!isRunning" />
      </template>
    </Toolbar>
    
    <div class="circuit-container">
      <CircuitCanvas ref="canvas" />
    </div>
  </div>
</template>

<script>
import CircuitCanvas from './components/CircuitCanvas.vue'
import { usePyodide } from './composables/usePyodide'

export default {
  name: 'App',
  components: {
    CircuitCanvas
  },
  setup() {
    const { initialize, runPython, isLoading, isReady, error } = usePyodide()
    return { initializePyodide: initialize, runPython, isPyodideLoading: isLoading, isPyodideReady: isReady, pyodideError: error }
  },
  data() {
    return {
      isRunning: false,
      menuItems: [
        {
          label: 'Logic',
          icon: 'pi pi-fw pi-sitemap',
          items: [
            {
              label: 'And',
              icon: 'pi pi-fw pi-plus',
              command: () => this.addComponent('and-gate')
            }
          ]
        },
        {
          label: 'I/O',
          icon: 'pi pi-fw pi-circle',
          items: [
            {
              label: 'Input',
              icon: 'pi pi-fw pi-circle',
              command: () => this.addComponent('input')
            },
            {
              label: 'Output',
              icon: 'pi pi-fw pi-circle-fill',
              command: () => this.addComponent('output')
            }
          ]
        }
      ]
    }
  },
  methods: {
    toggleInsertMenu(event) {
      this.$refs.insertMenu.toggle(event)
    },
    addComponent(type) {
      if (this.$refs.canvas) {
        this.$refs.canvas.addComponentAtCenter(type)
      }
    },
    async runSimulation() {
      this.isRunning = true
      
      try {
        // Initialize Pyodide if not already initialized
        if (!this.isPyodideReady) {
          console.log('Initializing Pyodide...')
          await this.initializePyodide()
        }
        
        // Get circuit data from canvas
        const circuitData = this.$refs.canvas?.getCircuitData()
        
        if (!circuitData) {
          console.error('Unable to get circuit data')
          return
        }
        
        if (!circuitData || circuitData.trim() === '') {
          console.log('No components in circuit')
          return
        }
        
        // The circuitData is now the complete GGL program
        const gglProgram = circuitData
        
        console.log('Generated GGL program:')
        console.log(gglProgram)
        
        // For now, just capture output
        const pythonCode = `
import sys
from io import StringIO

# Capture stdout
old_stdout = sys.stdout
sys.stdout = StringIO()

try:
    print("Ready to execute GGL program...")
    # TODO: exec() the GGL program here
    
    output = sys.stdout.getvalue()
finally:
    sys.stdout = old_stdout

output
`
        
        const result = await this.runPython(pythonCode)
        console.log('Simulation output:', result)
        
        // TODO: Update circuit visualization with simulation results
        
      } catch (err) {
        console.error('Simulation error:', err)
        // TODO: Show error to user
      } finally {
        this.isRunning = false
      }
    },
    
    stopSimulation() {
      console.log('Stopping simulation...')
      this.isRunning = false
      // TODO: Implement actual stop logic if needed
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f5f5f5;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-toolbar {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.circuit-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #f8fafc;
}

/* PrimeVue customizations for Aura theme */
.p-tieredmenu {
  min-width: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Improve TieredMenu item spacing */
.p-tieredmenu .p-menuitem-link {
  padding: 0.75rem 1rem;
  gap: 0.5rem;
}

.p-tieredmenu .p-menuitem-text {
  margin-left: 0.5rem;
}

.p-tieredmenu .p-menuitem-icon {
  font-size: 0.875rem;
}

.p-tieredmenu .p-submenu-icon {
  margin-left: auto;
  font-size: 0.75rem;
}

/* Add some vertical padding to menu sections */
.p-tieredmenu .p-menu-list {
  padding: 0.25rem 0;
}

.p-button {
  font-weight: 500;
}

/* Improve button appearance */
.p-button.p-button-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.p-button.p-button-sm .p-button-icon {
  font-size: 0.875rem;
}

/* Add spacing between icon and label */
.p-button .p-button-label {
  margin-left: 0.5rem !important;
}

/* Alternative approach - add gap to button content */
.p-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.p-toolbar {
  padding: 0.75rem 1rem;
  gap: 0.5rem;
}

/* Improve button spacing in toolbar */
.p-toolbar .p-button + .p-button {
  margin-left: 0.5rem;
}

/* Ensure button text doesn't wrap */
.p-button .p-button-label {
  white-space: nowrap;
}
</style>