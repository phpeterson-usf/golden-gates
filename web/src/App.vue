<template>
  <BrowserCompatibilityGuard>
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
      <AutosaveSelectionDialog
        v-model:visible="showAutosaveDialog"
        :autosaves="availableAutosaves"
        @restore="handleAutosaveRestore"
        @cancel="showAutosaveDialog = false"
      />
      <AppToolbar
        :circuitTabs="circuitTabs"
        :activeTabId="activeTabId"
        :circuitManager="circuitManager"
        @openCommandPalette="commandPaletteVisible = true"
        @switchToTab="switchToTab"
        @closeTab="handleCloseTab"
        @showConfirmation="showConfirmation"
        @toggleInspector="inspectorVisible = !inspectorVisible"
      />

      <div class="main-content">
      <div
        class="circuit-container"
        :class="{ 'drag-over': isDraggingOver }"
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

      <!-- Subtle simulation loading indicator -->
      <div v-if="isRunning || isPyodideLoading" class="simulation-loading">
        <i class="pi pi-spin pi-spinner"></i>
        <span>{{ isPyodideLoading ? $t('simulation.initializing') : $t('simulation.running') }}</span>
      </div>
    </div>
  </div>
  </BrowserCompatibilityGuard>
</template>

<script>
import CircuitCanvas from './components/CircuitCanvas.vue'
import ComponentInspector from './components/ComponentInspector.vue'
import ComponentIcon from './components/ComponentIcon.vue'
import ConfirmationDialog from './components/ConfirmationDialog.vue'
import CommandPalette from './components/CommandPalette.vue'
import AutosaveSelectionDialog from './components/AutosaveSelectionDialog.vue'
import AppToolbar from './components/AppToolbar.vue'
import BrowserCompatibilityGuard from './components/BrowserCompatibilityGuard.vue'
import { usePythonEngine } from './composables/usePythonEngine'
import { useFileService } from './composables/useFileService'
import { useCircuitModel } from './composables/useCircuitModel'
import { useAppController } from './composables/useAppController'
import { useAutosave } from './composables/useAutosave'
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
    AutosaveSelectionDialog,
    AppToolbar,
    BrowserCompatibilityGuard
  },
  setup() {
    // Initialize circuit manager (model layer)
    const circuitManager = useCircuitModel()

    // Initialize circuit operations (controller layer)
    const circuitOperations = useAppController(circuitManager)

    // Initialize autosave system
    const autosave = useAutosave(circuitManager)

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

      // Autosave system
      autosave,

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
      beforeUnloadHandler: null,
      showAutosaveDialog: false,
      availableAutosaves: []
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
        case 'clearCircuit':
          this.clearCircuit()
          break
        case 'runSimulation':
          this.runSimulation(this.$refs.canvas)
          break
        case 'stopSimulation':
          this.stopSimulation()
          break
        case 'restoreAutosave':
          this.showManualRestoreDialog()
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
      // Close tab directly - confirmation logic now handled by CircuitTabsBar
      this.closeTab(circuitId)
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
        // Get the old component before updating
        const oldComponent = this.$refs.canvas.components.find(c => c.id === updatedComponent.id)

        // Check if properties affecting connections have changed
        if (oldComponent && this.hasConnectionPropertiesChanged(oldComponent, updatedComponent)) {
          // Update wire endpoints to maintain connections
          this.$refs.canvas.updateWireEndpointsForPropertyChange(oldComponent, updatedComponent)
        }

        this.$refs.canvas.updateComponent(updatedComponent)
        // Refresh the selected component reference to maintain sync
        if (this.selectedComponent && this.selectedComponent.id === updatedComponent.id) {
          this.selectedComponent = this.$refs.canvas.components.find(
            c => c.id === updatedComponent.id
          )
        }
      }
    },

    /**
     * Check if properties that affect connection points have changed
     */
    hasConnectionPropertiesChanged(oldComponent, newComponent) {
      // Check invertedInputs array changes
      const oldInvertedInputs = oldComponent.props?.invertedInputs || []
      const newInvertedInputs = newComponent.props?.invertedInputs || []

      if (oldInvertedInputs.length !== newInvertedInputs.length) {
        return true
      }

      // Check if any inverted input indices changed
      for (let i = 0; i < oldInvertedInputs.length; i++) {
        if (!newInvertedInputs.includes(oldInvertedInputs[i])) {
          return true
        }
      }
      for (let i = 0; i < newInvertedInputs.length; i++) {
        if (!oldInvertedInputs.includes(newInvertedInputs[i])) {
          return true
        }
      }

      // Could add other connection-affecting properties here in the future
      // (e.g., rotation, numInputs for dynamic components)

      return false
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
    },

    /**
     * Check for available autosaves and automatically restore the newest one
     */
    checkForAutosaveRestoration() {
      // Only check if there's no meaningful user data to avoid overwriting current work
      // Don't count empty default circuits as "existing data"
      let hasExistingUserData = false

      // Check if any circuit has actual user content (components or wires)
      for (const [circuitId, circuit] of this.allCircuits) {
        if (circuit.components?.length > 0 || circuit.wires?.length > 0) {
          hasExistingUserData = true
          break
        }
      }

      if (hasExistingUserData) {
        // Skipping autosave restoration - existing user data found
        return
      }

      // No existing user data found - checking for autosaves

      const availableRestores = this.autosave.getAvailableRestores()

      if (availableRestores.length === 0) {
        // No autosaves available for restoration
        return
      }

      // Automatically restore the newest autosave (first in the sorted array)
      const newestAutosave = availableRestores[0]

      if (this.autosave.restoreFromAutosave(newestAutosave.key)) {
        // Autosave restoration successful
        // Force a re-render by updating reactive properties if needed
        this.$nextTick(() => {
          // Navigate to the restored active circuit if it exists
          if (this.activeTabId && this.allCircuits.has(this.activeTabId)) {
            this.switchToTab(this.activeTabId)
          }
        })
      }
    },

    /**
     * Show manual restore dialog with all available autosaves
     */
    showManualRestoreDialog() {
      const availableRestores = this.autosave.getAvailableRestores()

      if (availableRestores.length === 0) {
        // No autosaves available - could show a message or do nothing
        return
      }

      this.availableAutosaves = availableRestores
      this.showAutosaveDialog = true
    },

    /**
     * Handle autosave restoration from selection dialog
     */
    handleAutosaveRestore(selectedAutosave) {
      this.showAutosaveDialog = false

      if (this.autosave.restoreFromAutosave(selectedAutosave.key)) {
        // Autosave restoration successful
        // Force a re-render by updating reactive properties if needed
        this.$nextTick(() => {
          // Navigate to the restored active circuit if it exists
          if (this.activeTabId && this.allCircuits.has(this.activeTabId)) {
            this.switchToTab(this.activeTabId)
          }
        })
      } else {
        alert(this.$t('autosave.restoreError'))
      }
    },

    /**
     * Clear the current circuit (all components, wires, and reset to empty state)
     */
    clearCircuit() {
      this.showConfirmation({
        title: this.$t('dialogs.confirmClear'),
        message: this.$t('dialogs.confirmClearMessage'),
        type: 'warning',
        acceptLabel: this.$t('ui.clearCircuit'),
        onAccept: () => {
          // Temporarily disable autosave to prevent saving cleared state
          this.autosave.setAutosaveEnabled(false)

          // Clear all autosave data first
          this.autosave.clearAllAutosaves()

          // Also clear any other circuit-related localStorage data
          this.clearAllCircuitData()

          // Clear the circuit manager data completely
          this.circuitManager.allCircuits.value.clear()
          this.circuitManager.availableComponents.value.clear()
          this.circuitManager.openTabs.value = []

          // Create a fresh main circuit
          this.createNewCircuit()

          // Clear the canvas if it exists
          if (this.$refs.canvas) {
            this.$refs.canvas.clearCircuit()
          }

          // Force a refresh of the selected circuit
          this.selectedCircuit = this.activeCircuit

          // Re-enable autosave after a short delay
          setTimeout(() => {
            this.autosave.setAutosaveEnabled(true)
          }, 1000)
        },
        onReject: () => {
          // User cancelled, do nothing
        }
      })
    },

    /**
     * Aggressively clear all circuit-related localStorage data
     */
    clearAllCircuitData() {
      // Get all localStorage keys
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (
          key &&
          (key.startsWith('golden-gates-') ||
            key.includes('circuit') ||
            key.includes('autosave') ||
            key.includes('component'))
        ) {
          keysToRemove.push(key)
        }
      }

      // Remove all found keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
    }
  },

  mounted() {
    // Set up the beforeunload handler
    this.beforeUnloadHandler = event => this.handleBeforeUnload(this.$refs.canvas, event)
    window.addEventListener('beforeunload', this.beforeUnloadHandler)

    // Initialize autosave system
    this.autosave.initializeAutosave()

    // Check for available autosaves and prompt for restoration
    this.checkForAutosaveRestoration()

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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

/* Subtle simulation loading indicator */
.simulation-loading {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  color: #374151;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.simulation-loading i {
  color: #3b82f6;
  font-size: 1rem;
}

.simulation-loading span {
  font-weight: 500;
}
</style>
