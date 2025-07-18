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
    <CommandPalette
      v-model="commandPaletteVisible"
      :availableComponents="availableComponentsArray"
      @command="handleCommand"
    />
    <Toolbar class="app-toolbar">
      <template #start>
        <Button
          class="p-button-sm golden-gate-button"
          @click="commandPaletteVisible = true"
          v-tooltip.right="commandPaletteTooltip"
        >
          <GoldenGateLogo :width="48" :height="24" />
        </Button>

        <!-- Circuit Tabs -->
        <div v-if="circuitTabs.length > 0" class="circuit-tabs">
          <Button
            v-for="tab in circuitTabs"
            :key="tab.id"
            :label="tab.name"
            :class="['circuit-tab', { active: tab.id === activeTabId }]"
            @click="switchToTab(tab.id)"
            text
            size="small"
          >
            <template #default>
              <span>{{ tab.name }}</span>
              <i
                class="pi pi-times tab-close"
                @click.stop="handleCloseTab(tab.id)"
                v-if="circuitTabs.length > 1"
              ></i>
            </template>
          </Button>
        </div>
      </template>
      <template #end>
        <Button
          icon="pi pi-sliders-h"
          class="p-button-text p-button-sm"
          @click="inspectorVisible = !inspectorVisible"
          v-tooltip.left="$t('ui.toggleInspector')"
        />
      </template>
    </Toolbar>

    <div class="main-content">
      <div
        class="circuit-container"
        :class="{ 'inspector-open': inspectorVisible, 'drag-over': isDraggingOver }"
        :data-drop-message="$t('ui.dropFileHere')"
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
              :class="[
                'breadcrumb-button',
                { active: index === $refs.canvas?.breadcrumbs.length - 1 }
              ]"
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
import CommandPalette from './components/CommandPalette.vue'
import GoldenGateLogo from './components/GoldenGateLogo.vue'
import { usePythonEngine } from './composables/usePythonEngine'
import { useFileService } from './composables/useFileService'
import { useCircuitModel } from './composables/useCircuitModel'
import { useAppController } from './composables/useAppController'
import { useCommandPalette } from './composables/useCommandPalette'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'

export default {
  name: 'App',
  components: {
    CircuitCanvas,
    ComponentIcon,
    ComponentInspector,
    ConfirmationDialog,
    CommandPalette,
    GoldenGateLogo
  },
  setup() {
    // Initialize circuit manager (model layer)
    const circuitManager = useCircuitModel()

    // Initialize circuit operations (controller layer)
    const circuitOperations = useAppController(circuitManager)

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

    // Initialize command palette
    const { isVisible: commandPaletteVisible } = useCommandPalette()

    // Command handler for keyboard shortcuts
    const handleCommand = ({ action, params }) => {
      // Dispatch to mounted component methods via custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('circuitCommand', { detail: { action, params } }))
      }
    }

    // Set up keyboard shortcuts
    useKeyboardShortcuts(handleCommand)

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
      confirmDialog,
      commandPaletteVisible
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
    commandPaletteTooltip() {
      return `${this.$t('commands.commandPalette.title')} (G)`
    }
  },
  methods: {
    handleCommand({ action, params }) {
      // Handle different command actions
      switch (action) {
        case 'addComponent':
          this.addComponent(...params)
          break
        case 'addCircuitComponent':
          this.addCircuitComponent(...params)
          break
        case 'createNewCircuit':
          this.createNewCircuit()
          break
        case 'openCircuit':
          this.openCircuitFile()
          break
        case 'saveCircuit':
          this.saveCircuitFile()
          break
        case 'runSimulation':
          this.runSimulation(this.$refs.canvas)
          break
        case 'stopSimulation':
          this.stopSimulation()
          break
        default:
          console.warn(this.$t('ui.unknownCommand') + ':', action)
      }
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

    handleCloseTab(circuitId) {
      // Check if the circuit has unsaved changes
      if (this.hasCircuitUnsavedWork(circuitId)) {
        this.showConfirmation({
          title: this.$t('dialogs.unsavedChanges'),
          message: this.$t('dialogs.unsavedChangesMessage'),
          type: 'warning',
          acceptLabel: this.$t('ui.closeWithoutSaving'),
          onAccept: () => {
            this.closeTab(circuitId)
          },
          onReject: () => {
            // User cancelled, do nothing
          }
        })
      } else {
        // No unsaved changes, close immediately
        this.closeTab(circuitId)
      }
    },

    hasCircuitUnsavedWork(circuitId) {
      const circuit = this.circuitManager.getCircuit(circuitId)
      if (!circuit) return false
      
      // Check if circuit has any components or wires
      const hasComponents = circuit.components && circuit.components.length > 0
      const hasWires = circuit.wires && circuit.wires.length > 0
      
      return hasComponents || hasWires
    },

    handleSelectionChanged(selection) {
      // Handle single component selection
      if (selection.components.size === 1) {
        const componentId = Array.from(selection.components)[0]
        this.selectedComponent =
          this.$refs.canvas?.components.find(c => c.id === componentId) || null
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
          this.selectedComponent = this.$refs.canvas.components.find(
            c => c.id === updatedComponent.id
          )
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
      const jsonFile = files.find(
        file => file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')
      )

      if (!jsonFile) {
        alert(this.$t('ui.dropFileAlert'))
        return
      }

      await this.handleDroppedFile(this.$refs.canvas, jsonFile)
    }
  },

  mounted() {
    // Set up the beforeunload handler
    this.beforeUnloadHandler = event => this.handleBeforeUnload(this.$refs.canvas, event)
    window.addEventListener('beforeunload', this.beforeUnloadHandler)

    // Initialize selectedCircuit with the current circuit if no component is selected
    if (!this.selectedComponent && this.activeCircuit) {
      this.selectedCircuit = this.activeCircuit
    }

    // Set up command event listener for keyboard shortcuts
    this.commandEventHandler = event => this.handleCommand(event.detail)
    window.addEventListener('circuitCommand', this.commandEventHandler)
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

    // Clean up the command event handler
    if (this.commandEventHandler) {
      window.removeEventListener('circuitCommand', this.commandEventHandler)
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
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
  content: attr(data-drop-message);
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
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
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

/* Golden Gate button styling with USF colors */
.golden-gate-button {
  padding: 0.375rem 0.875rem !important;
  min-width: auto !important;
  background-color: #00543c !important; /* USF Green */
  border-color: #00543c !important;
  color: #ffcc02 !important; /* USF Gold */
}

.golden-gate-button:hover {
  background-color: #004832 !important; /* Darker USF Green */
  border-color: #004832 !important;
  color: #ffd633 !important; /* Brighter USF Gold */
}

.golden-gate-button .golden-gate-logo {
  color: #ffcc02; /* USF Gold */
  transition: color 0.2s ease;
}

.golden-gate-button:hover .golden-gate-logo {
  color: #ffd633; /* Brighter USF Gold */
}

.golden-gate-button .logo-tower-left,
.golden-gate-button .logo-tower-right {
  fill: #ffcc02; /* USF Gold towers */
}

.golden-gate-button:hover .logo-tower-left,
.golden-gate-button:hover .logo-tower-right {
  fill: #ffd633; /* Brighter USF Gold towers */
}

/* Dark mode support */
.p-dark .golden-gate-button {
  background-color: #006b4d !important; /* Lighter USF Green for dark mode */
  border-color: #006b4d !important;
}

.p-dark .golden-gate-button:hover {
  background-color: #007d58 !important;
  border-color: #007d58 !important;
}
</style>
