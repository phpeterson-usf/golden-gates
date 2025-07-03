<template>
  <div id="app">
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :type="confirmDialog.type"
      @accept="confirmDialog.acceptCallback"
      @reject="confirmDialog.rejectCallback"
    />
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
        >
          <template #item="{ item }">
            <div class="menu-item-content">
              <ComponentIcon 
                v-if="item.componentType" 
                :componentType="item.componentType" 
                :size="16" 
                class="component-icon-menu"
              />
              <i v-else-if="item.icon" :class="item.icon"></i>
              <span class="menu-item-label">{{ item.label }}</span>
            </div>
          </template>
        </TieredMenu>
      </template>
      <template #end>
        <Button 
          icon="pi pi-folder-open" 
          label="Open" 
          class="p-button-sm" 
          @click="openCircuit"
          v-tooltip.bottom="'Open circuit from file'"
        />
        <Button 
          icon="pi pi-save" 
          label="Save" 
          class="p-button-sm" 
          @click="saveCircuit"
          v-tooltip.bottom="'Save circuit to file'"
        />
        <Button 
          icon="pi pi-sliders-h" 
          class="p-button-text p-button-sm" 
          @click="inspectorVisible = !inspectorVisible"
          v-tooltip.left="'Toggle Inspector'"
        />
        <Button icon="pi pi-play" label="Run" class="p-button-success p-button-sm" @click="runSimulation" :disabled="isRunning" />
        <Button icon="pi pi-stop" label="Stop" class="p-button-danger p-button-sm" @click="stopSimulation" :disabled="!isRunning" />
      </template>
    </Toolbar>
    
    <div class="main-content">
      <div 
        class="circuit-container" 
        :class="{ 'inspector-open': inspectorVisible, 'drag-over': isDraggingOver }"
        @dragover.prevent="handleDragOver"
        @drop.prevent="handleDrop"
        @dragenter.prevent="handleDragEnter"
        @dragleave.prevent="handleDragLeave"
      >
        <CircuitCanvas 
          ref="canvas" 
          @selectionChanged="handleSelectionChanged"
        />
      </div>
      
      <div v-if="inspectorVisible" class="inspector-panel">
        <button class="inspector-close" @click="inspectorVisible = false">
          <i class="pi pi-times"></i>
        </button>
        <ComponentInspector 
          :component="selectedComponent"
          @update:component="updateComponent"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CircuitCanvas from './components/CircuitCanvas.vue'
import ComponentInspector from './components/ComponentInspector.vue'
import ComponentIcon from './components/ComponentIcon.vue'
import ConfirmationDialog from './components/ConfirmationDialog.vue'
import { usePyodide } from './composables/usePyodide'
import { useFileOperations } from './composables/useFileOperations'

export default {
  name: 'App',
  components: {
    CircuitCanvas,
    ComponentIcon,
    ComponentInspector,
    ConfirmationDialog
  },
  setup() {
    const { initialize, runPython, isLoading, isReady, error, pyodide } = usePyodide()
    const { saveCircuit: saveCircuitFile, openCircuit: openCircuitFile, parseAndValidateJSON } = useFileOperations()
    
    return { 
      initializePyodide: initialize, 
      runPython, 
      isPyodideLoading: isLoading, 
      isPyodideReady: isReady, 
      pyodideError: error, 
      pyodide,
      saveCircuitFile,
      openCircuitFile,
      parseAndValidateJSON
    }
  },
  data() {
    return {
      isRunning: false,
      inspectorVisible: true,
      selectedComponent: null,
      isDraggingOver: false,
      dragCounter: 0,
      showConfirmDialog: false,
      confirmDialog: {
        title: '',
        message: '',
        type: 'warning',
        acceptCallback: null,
        rejectCallback: null
      },
      beforeUnloadHandler: null,
      menuItems: [
        {
          label: 'Logic',
          icon: 'pi pi-fw pi-sitemap',
          items: [
            {
              label: 'And',
              componentType: 'and',
              command: () => this.addComponent('and-gate')
            },
            {
              label: 'Or',
              componentType: 'or',
              command: () => this.addComponent('or-gate')
            },
            {
              label: 'Xor',
              componentType: 'xor',
              command: () => this.addComponent('xor-gate')
            },
            {
              label: 'Not',
              componentType: 'not',
              command: () => this.addComponent('not-gate')
            },
            {
              label: 'Nand',
              componentType: 'nand',
              command: () => this.addComponent('nand-gate')
            },
            {
              label: 'Nor',
              componentType: 'nor',
              command: () => this.addComponent('nor-gate')
            },
            {
              label: 'Xnor',
              componentType: 'xnor',
              command: () => this.addComponent('xnor-gate')
            }
          ]
        },
        {
          label: 'I/O',
          icon: 'pi pi-fw pi-circle',
          items: [
            {
              label: 'Input',
              componentType: 'input',
              command: () => this.addComponent('input')
            },
            {
              label: 'Output',
              componentType: 'output',
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
        this.$refs.canvas.addComponentAtSmartPosition(type)
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
        
        // Create callback for Python to update Vue components
        window.__vueUpdateCallback = (componentId, value) => {
          console.log(`Output ${componentId} updated to ${value}`)
          // Update the component in the canvas
          if (this.$refs.canvas) {
            const component = this.$refs.canvas.components.find(c => c.id === componentId)
            if (component && component.type === 'output') {
              // Create a new component object to ensure Vue detects the change
              const updatedComponent = {
                ...component,
                props: {
                  ...component.props,
                  value: value
                }
              }
              this.$refs.canvas.updateComponent(updatedComponent)
            }
          }
        }
        
        // Execute the GGL program
        const pythonCode = `
# Make updateCallback available in builtins so all modules can access it
import builtins
import js
builtins.updateCallback = js.window.__vueUpdateCallback

# Execute the GGL program
exec(${JSON.stringify(gglProgram)})

# Return success
"Simulation completed"
`
        
        await this.runPython(pythonCode)
        console.log('Simulation completed')
        
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
    },
    
    handleSelectionChanged(selection) {
      // For now, just handle single component selection
      if (selection.components.size === 1) {
        const componentId = Array.from(selection.components)[0]
        this.selectedComponent = this.$refs.canvas?.components.find(c => c.id === componentId) || null
      } else {
        this.selectedComponent = null
      }
    },
    
    updateComponent(updatedComponent) {
      if (this.$refs.canvas) {
        this.$refs.canvas.updateComponent(updatedComponent)
        // Refresh the selected component reference to maintain sync
        if (this.selectedComponent && this.selectedComponent.id === updatedComponent.id) {
          this.selectedComponent = this.$refs.canvas.components.find(c => c.id === updatedComponent.id)
        }
      }
    },
    
    async saveCircuit() {
      try {
        const components = this.$refs.canvas?.components || []
        const wires = this.$refs.canvas?.wires || []
        const wireJunctions = this.$refs.canvas?.wireJunctions || []
        
        await this.saveCircuitFile(components, wires, wireJunctions)
      } catch (error) {
        console.error('Error saving circuit:', error)
        alert('Error saving circuit: ' + error.message)
      }
    },
    
    async openCircuit() {
      try {
        const fileContent = await this.openCircuitFile()
        if (!fileContent) return
        
        const circuitData = this.parseAndValidateJSON(fileContent)
        
        // Check if current circuit has any components
        const hasExistingCircuit = this.$refs.canvas?.components?.length > 0 || 
                                  this.$refs.canvas?.wires?.length > 0
        
        if (hasExistingCircuit) {
          this.showConfirmation({
            title: 'Replace Circuit?',
            message: 'This will replace your current circuit. Are you sure you want to continue?',
            type: 'warning',
            onAccept: () => this.loadCircuitData(circuitData)
          })
        } else {
          this.loadCircuitData(circuitData)
        }
      } catch (error) {
        console.error('Error opening circuit:', error)
        alert('Error opening circuit: ' + error.message)
      }
    },
    
    loadCircuitData(circuitData) {
      if (!this.$refs.canvas) return
      
      // Clear existing circuit
      this.$refs.canvas.clearCircuit()
      
      // Load components
      if (circuitData.components) {
        circuitData.components.forEach(component => {
          this.$refs.canvas.loadComponent(component)
        })
      }
      
      // Load wires
      if (circuitData.wires) {
        circuitData.wires.forEach(wire => {
          this.$refs.canvas.addWire(wire)
        })
      }
      
      // Load wire junctions
      if (circuitData.wireJunctions) {
        circuitData.wireJunctions.forEach(junction => {
          this.$refs.canvas.addWireJunction(junction)
        })
      }
      
      console.log('Circuit loaded successfully')
    },
    
    handleDragEnter(event) {
      this.dragCounter++
      if (event.dataTransfer.types.includes('Files')) {
        this.isDraggingOver = true
      }
    },
    
    handleDragLeave(event) {
      this.dragCounter--
      if (this.dragCounter <= 0) {
        this.isDraggingOver = false
        this.dragCounter = 0
      }
    },
    
    handleDragOver(event) {
      // Check if the drag contains files
      if (event.dataTransfer.types.includes('Files')) {
        event.dataTransfer.dropEffect = 'copy'
      }
    },
    
    async handleDrop(event) {
      this.isDraggingOver = false
      this.dragCounter = 0
      
      const files = Array.from(event.dataTransfer.files)
      
      // Find the first JSON file
      const jsonFile = files.find(file => 
        file.type === 'application/json' || 
        file.name.toLowerCase().endsWith('.json')
      )
      
      if (!jsonFile) {
        alert('Please drop a JSON circuit file')
        return
      }
      
      try {
        const fileContent = await jsonFile.text()
        const circuitData = this.parseAndValidateJSON(fileContent)
        
        // Check if current circuit has any components
        const hasExistingCircuit = this.$refs.canvas?.components?.length > 0 || 
                                  this.$refs.canvas?.wires?.length > 0
        
        if (hasExistingCircuit) {
          this.showConfirmation({
            title: 'Replace Circuit?',
            message: 'This will replace your current circuit. Are you sure you want to continue?',
            type: 'warning',
            onAccept: () => this.loadCircuitData(circuitData)
          })
        } else {
          this.loadCircuitData(circuitData)
        }
      } catch (error) {
        console.error('Error loading dropped file:', error)
        alert('Error loading circuit: ' + error.message)
      }
    },
    
    showConfirmation({ title, message, type = 'warning', onAccept, onReject }) {
      this.confirmDialog = {
        title,
        message,
        type,
        acceptCallback: onAccept || (() => {}),
        rejectCallback: onReject || (() => {})
      }
      this.showConfirmDialog = true
    },
    
    hasUnsavedWork() {
      // Check if there are any components or wires in the circuit
      const components = this.$refs.canvas?.components || []
      const wires = this.$refs.canvas?.wires || []
      return components.length > 0 || wires.length > 0
    },
    
    handleBeforeUnload(event) {
      if (this.hasUnsavedWork()) {
        // Modern browsers ignore custom messages for security reasons
        // They show a generic "Leave site?" dialog instead
        event.preventDefault()
        event.returnValue = '' // Chrome requires this
        return '' // Some browsers need this
      }
    }
  },
  
  mounted() {
    // Set up the beforeunload handler
    this.beforeUnloadHandler = this.handleBeforeUnload.bind(this)
    window.addEventListener('beforeunload', this.beforeUnloadHandler)
  },
  
  beforeUnmount() {
    // Clean up the beforeunload handler
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler)
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

/* Menu item styling for gate icons */
.menu-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.component-icon-menu {
  flex-shrink: 0;
}

.menu-item-label {
  flex: 1;
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
  height: 48px;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.circuit-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}

.circuit-container.drag-over {
  background-color: #eff6ff;
  border: 2px dashed #3b82f6;
  box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.1);
}

.circuit-container.drag-over::after {
  content: 'Drop JSON circuit file here';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* PrimeVue customizations for Aura theme */
.p-tieredmenu {
  min-width: 160px;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Improve TieredMenu item spacing */
.p-tieredmenu .p-menuitem-link {
  padding: 0.5rem 0.75rem;
  gap: 0.375rem;
  font-size: 0.75rem;
}

.p-tieredmenu .p-menuitem-text {
  margin-left: 0.375rem;
  font-size: 0.75rem;
}

.p-tieredmenu .p-menuitem-icon {
  font-size: 0.75rem;
}

.p-tieredmenu .p-submenu-icon {
  margin-left: auto;
  font-size: 0.625rem;
}

/* Add some vertical padding to menu sections */
.p-tieredmenu .p-menu-list {
  padding: 0.125rem 0;
}

.p-button {
  font-weight: 500;
}

/* Improve button appearance */
.p-button.p-button-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.p-button.p-button-sm .p-button-icon {
  font-size: 0.75rem;
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
  padding: 0.5rem 0.75rem;
  gap: 0.375rem;
}

/* Improve button spacing in toolbar */
.p-toolbar .p-button + .p-button {
  margin-left: 0.375rem;
}

/* Ensure button text doesn't wrap */
.p-button .p-button-label {
  white-space: nowrap;
}

/* Tooltip styles */
.p-tooltip .p-tooltip-text {
  font-size: 0.625rem;
  padding: 0.375rem 0.625rem;
}

/* Inspector panel styles */
.inspector-panel {
  width: 220px;
  flex-shrink: 0;
  background-color: #ffffff;
  border-left: 1px solid #e2e8f0;
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  position: relative;
}

.inspector-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  z-index: 1;
}

.inspector-close:hover {
  background-color: #f3f4f6;
  color: #374151;
}
</style>