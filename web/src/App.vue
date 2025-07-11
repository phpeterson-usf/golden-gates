<template>
  <div id="app">
    <ConfirmationDialog
      v-model:visible="showConfirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :type="confirmDialog.type"
      :acceptLabel="confirmDialog.acceptLabel"
      :showCancel="confirmDialog.showCancel"
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
        
        <!-- Circuit Tabs -->
        <div v-if="circuitTabs.length > 0" class="circuit-tabs">
          <Button
            v-for="tab in circuitTabs"
            :key="tab.id"
            :label="tab.name"
            :class="['circuit-tab', { 'active': tab.id === activeTabId }]"
            @click="switchToTab(tab.id)"
            text
            size="small"
          >
            <template #default>
              <span>{{ tab.name }}</span>
              <i 
                class="pi pi-times tab-close" 
                @click.stop="closeTab(tab.id)"
                v-if="circuitTabs.length > 1"
              ></i>
            </template>
          </Button>
        </div>
        
      </template>
      <template #end>
        <Button 
          icon="pi pi-folder-open" 
          label="Open" 
          class="p-button-sm" 
          @click="openCircuitFile"
          v-tooltip.bottom="'Open circuit from file'"
        />
        <Button 
          icon="pi pi-save" 
          label="Save" 
          class="p-button-sm" 
          @click="saveCircuitFile"
          v-tooltip.bottom="'Save circuit to file'"
        />
        <Button 
          icon="pi pi-sliders-h" 
          class="p-button-text p-button-sm" 
          @click="inspectorVisible = !inspectorVisible"
          v-tooltip.left="'Toggle Inspector'"
        />
        <Button icon="pi pi-play" label="Run" class="p-button-success p-button-sm" @click="runSimulation($refs.canvas)" :disabled="isRunning" />
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
          :circuitManager="circuitManager"
          @selectionChanged="handleSelectionChanged"
        />
        
        <!-- Circuit Navigation Breadcrumbs -->
        <div v-if="$refs.canvas?.breadcrumbs?.length > 1" class="circuit-breadcrumbs">
          <template v-for="(crumb, index) in $refs.canvas?.breadcrumbs" :key="crumb.id">
            <i v-if="index > 0" class="pi pi-angle-right breadcrumb-separator"></i>
            <Button 
              :label="crumb.name"
              :class="['breadcrumb-button', { active: index === $refs.canvas?.breadcrumbs.length - 1 }]"
              @click="$refs.canvas?.navigateToCircuit(crumb.id)"
              text
            />
          </template>
        </div>
      </div>
      
      <div v-if="inspectorVisible" class="inspector-panel">
        <button class="inspector-close" @click="inspectorVisible = false">
          <i class="pi pi-times"></i>
        </button>
        <ComponentInspector 
          :component="selectedComponent"
          :circuit="selectedCircuit"
          @update:component="updateComponent"
          @update:circuit="updateCircuit"
          @action="handleInspectorAction"
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
import { useCircuitManager } from './composables/useCircuitManager'
import { useCircuitOperations } from './composables/useCircuitOperations'

export default {
  name: 'App',
  components: {
    CircuitCanvas,
    ComponentIcon,
    ComponentInspector,
    ConfirmationDialog
  },
  setup() {
    // Initialize circuit manager (model layer)
    const circuitManager = useCircuitManager()
    
    // Initialize circuit operations (controller layer)
    const circuitOperations = useCircuitOperations(circuitManager)
    
    // Extract needed properties for template
    const { 
      tabs: circuitTabs, 
      activeTabId, 
      activeCircuit,
      allCircuits,
      availableComponentsArray,
      createCircuit, 
      switchToTab, 
      closeTab 
    } = circuitManager
    
    const {
      createNewCircuit,
      runSimulation,
      stopSimulation,
      saveCircuit,
      openCircuit,
      loadCircuitData,
      handleDroppedFile,
      handleInspectorAction,
      showConfirmation,
      hasUnsavedWork,
      handleBeforeUnload,
      isRunning,
      isPyodideLoading,
      isPyodideReady,
      pyodideError,
      pyodide,
      showConfirmDialog,
      confirmDialog
    } = circuitOperations
    
    return { 
      // Circuit manager
      circuitManager,
      circuitTabs,
      activeTabId,
      activeCircuit,
      allCircuits,
      availableComponentsArray,
      createCircuit,
      switchToTab,
      closeTab,
      
      // Circuit operations
      createNewCircuit,
      runSimulation,
      stopSimulation,
      saveCircuit,
      openCircuit,
      loadCircuitData,
      handleDroppedFile,
      handleInspectorAction,
      showConfirmation,
      hasUnsavedWork,
      handleBeforeUnload,
      isRunning,
      isPyodideLoading,
      isPyodideReady,
      pyodideError,
      pyodide,
      showConfirmDialog,
      confirmDialog
    }
  },
  data() {
    return {
      inspectorVisible: true,
      selectedComponent: null,
      selectedCircuit: null,
      isDraggingOver: false,
      dragCounter: 0,
      beforeUnloadHandler: null
    }
  },
  computed: {
    menuItems() {
      // Base menu items
      const baseItems = [
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
        },
        {
          label: 'Components',
          icon: 'pi pi-fw pi-cube',
          items: [
            {
              label: 'New Circuit',
              icon: 'pi pi-fw pi-plus',
              command: () => this.createNewCircuit()
            },
            {
              separator: true
            }
          ]
        }
      ]
      
      // Add saved circuit components
      const componentItems = baseItems.find(item => item.label === 'Components')
      if (this.availableComponentsArray?.length > 0) {
        this.availableComponentsArray.forEach(component => {
          componentItems.items.push({
            label: component.name,
            icon: 'pi pi-fw pi-chip',
            command: () => this.addCircuitComponent(component.id)
          })
        })
      }
      
      return baseItems
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
    
    addCircuitComponent(circuitId) {
      if (this.$refs.canvas) {
        const component = this.circuitManager.createSchematicComponent(circuitId)
        if (component) {
          this.$refs.canvas.addComponentAtSmartPosition('schematic-component', component.props)
        }
      }
    },
    
    
    
    handleSelectionChanged(selection) {
      // Handle single component selection
      if (selection.components.size === 1) {
        const componentId = Array.from(selection.components)[0]
        this.selectedComponent = this.$refs.canvas?.components.find(c => c.id === componentId) || null
        this.selectedCircuit = null // Clear circuit selection when component is selected
      } else {
        this.selectedComponent = null
        // Show current circuit properties when no component is selected
        this.selectedCircuit = this.activeCircuit
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
    
    updateCircuit(updatedCircuit) {
      // Update circuit properties in the circuit manager
      const circuit = this.circuitManager.getCircuit(updatedCircuit.id)
      if (circuit) {
        // Update reactive properties
        circuit.name = updatedCircuit.name
        circuit.label = updatedCircuit.label
        circuit.properties = {
          ...circuit.properties,
          ...updatedCircuit.properties
        }
        
        // Update selectedCircuit to reflect changes
        this.selectedCircuit = circuit
      }
    },
    
    async saveCircuitFile() {
      await this.saveCircuit(this.$refs.canvas)
    },
    
    async openCircuitFile() {
      await this.openCircuit(this.$refs.canvas)
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
      
      await this.handleDroppedFile(this.$refs.canvas, jsonFile)
    },
    
  },
  
  mounted() {
    // Set up the beforeunload handler
    this.beforeUnloadHandler = (event) => this.handleBeforeUnload(this.$refs.canvas, event)
    window.addEventListener('beforeunload', this.beforeUnloadHandler)
    
    // Initialize selectedCircuit with the current circuit if no component is selected
    if (!this.selectedComponent && this.activeCircuit) {
      this.selectedCircuit = this.activeCircuit
    }
  },
  
  watch: {
    // Watch for activeCircuit changes (tab switching) and update selectedCircuit if no component is selected
    activeCircuit(newCircuit) {
      if (!this.selectedComponent && newCircuit) {
        this.selectedCircuit = newCircuit
      }
    }
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

/* Circuit breadcrumb navigation */
.circuit-breadcrumbs {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.breadcrumb-separator {
  color: #6b7280;
  font-size: 0.75rem;
}

.breadcrumb-button {
  padding: 0.25rem 0.5rem !important;
  font-size: 0.75rem !important;
  min-height: auto !important;
  height: auto !important;
  border-radius: 4px !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
}

.breadcrumb-button:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.breadcrumb-button.active {
  color: #1f2937 !important;
  font-weight: 600 !important;
}

.breadcrumb-button.active:hover {
  background-color: #e5e7eb !important;
}

/* Circuit tabs */
.circuit-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 1rem;
  margin-right: 1rem;
}

.circuit-tab {
  padding: 0.25rem 0.75rem !important;
  font-size: 0.75rem !important;
  min-height: auto !important;
  height: auto !important;
  border-radius: 4px !important;
  color: #6b7280 !important;
  font-weight: 400 !important;
  position: relative;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.circuit-tab:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.circuit-tab.active {
  background-color: #e5e7eb !important;
  color: #1f2937 !important;
  font-weight: 500 !important;
}

.circuit-tab .tab-close {
  margin-left: 0.5rem;
  font-size: 0.625rem;
  opacity: 0.6;
  cursor: pointer;
}

.circuit-tab .tab-close:hover {
  opacity: 1;
  color: #ef4444 !important;
}
</style>