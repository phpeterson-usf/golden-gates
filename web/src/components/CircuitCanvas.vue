<template>
  <div class="circuit-canvas-container" ref="container">
    <!-- Grid background -->
    <svg 
      class="grid-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
    >
      <defs>
        <pattern id="grid" :width="gridSize * zoom" :height="gridSize * zoom" patternUnits="userSpaceOnUse">
          <circle :cx="gridSize * zoom" :cy="gridSize * zoom" :r="dotSize * zoom" :fill="COLORS.gridDot" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
    
    <!-- Circuit elements -->
    <svg 
      class="circuit-canvas"
      :class="{ 
        dragging: isDragging() || isSelecting,
        'wire-drawing': drawingWire,
        'junction-mode': isJunctionMode
      }"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasClick"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @keydown="handleKeyDown"
      @keyup="handleKeyUp"
      tabindex="0"
    >
      <g :transform="`scale(${zoom})`">
        <!-- Wires -->
        <Wire
          v-for="(wire, index) in wires"
          :key="`wire-${index}`"
          :points="wire.points"
          :selected="selectedWires.has(index)"
          :data-wire-index="index"
          @click="handleWireClick(index, $event)"
          @mousedown="handleWireMouseDown(index, $event)"
        />
        
        <!-- Wire preview during drawing -->
        <Wire
          v-if="drawingWire && wirePoints.length > 0"
          :points="previewPoints"
          :preview="true"
        />
        
        <!-- Junction points -->
        <circle
          v-for="(junction, index) in wireJunctions"
          :key="`junction-${index}`"
          :cx="junction.pos.x"
          :cy="junction.pos.y"
          :r="CONNECTION_DOT_RADIUS"
          :fill="COLORS.connectionFill"
          class="wire-junction"
          pointer-events="none"
        />
        
        <!-- Junction preview point when Alt is held -->
        <circle
          v-if="junctionPreview"
          :cx="junctionPreview.x"
          :cy="junctionPreview.y"
          :r="CONNECTION_DOT_RADIUS + 2"
          fill="#3b82f6"
          stroke="white"
          stroke-width="2"
          class="junction-preview"
          pointer-events="none"
        >
          <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        <!-- Connection preview point when hovering during wire drawing -->
        <circle
          v-if="connectionPreview"
          :cx="connectionPreview.x"
          :cy="connectionPreview.y"
          :r="CONNECTION_DOT_RADIUS + 2"
          fill="#3b82f6"
          stroke="white"
          stroke-width="2"
          class="connection-preview"
          pointer-events="none"
        >
          <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
        </circle>
        
        <!-- Components -->
        <component
          v-for="comp in components"
          :key="comp.id"
          :ref="el => setComponentRef(comp.id, el)"
          :is="getComponentType(comp.type)"
          :id="comp.id"
          :x="comp.x"
          :y="comp.y"
          :selected="selectedComponents.has(comp.id)"
          :circuitManager="comp.type === 'schematic-component' ? circuitManager : undefined"
          v-bind="comp.props"
          @startDrag="handleStartDrag"
          @editSubcircuit="handleEditSubcircuit"
        />
        
        <!-- Rubber-band selection rectangle -->
        <rect
          v-if="isSelecting && selectionRect"
          :x="selectionRect.x"
          :y="selectionRect.y"
          :width="selectionRect.width"
          :height="selectionRect.height"
          fill="rgba(59, 130, 246, 0.1)"
          stroke="rgb(59, 130, 246)"
          stroke-width="1"
          stroke-dasharray="4 2"
          pointer-events="none"
        />
        
      </g>
    </svg>
    
    <!-- Zoom controls -->
    <div class="zoom-controls">
      <button 
        class="zoom-button"
        @click="zoomIn"
        :disabled="zoom >= maxZoom"
        title="Zoom In"
      >
        <i class="pi pi-plus"></i>
      </button>
      <button 
        class="zoom-button"
        @click="zoomOut"
        :disabled="zoom <= minZoom"
        title="Zoom Out"
      >
        <i class="pi pi-minus"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'
import { componentRegistry } from '../utils/componentRegistry'
import { DOT_SIZE, COLORS, CONNECTION_DOT_RADIUS } from '../utils/constants'
import Wire from './Wire.vue'

// Composables
import { useCanvasOperations } from '../composables/useCanvasOperations'
import { useWireManagement } from '../composables/useWireManagement'
import { useSelection } from '../composables/useSelection'
import { useDragAndDrop } from '../composables/useDragAndDrop'
import { useCanvasInteractions } from '../composables/useCanvasInteractions'
import { useCircuitData } from '../composables/useCircuitData'
import { useCircuitGeneration } from '../composables/useCircuitGeneration'

export default {
  name: 'CircuitCanvas',
  components: {
    Wire
  },
  props: {
    circuitManager: {
      type: Object,
      required: true
    }
  },
  emits: ['selectionChanged'],
  setup(props, { emit }) {
    const container = ref(null)
    const componentRefs = ref({})
    
    // Canvas operations
    const {
      canvasWidth,
      canvasHeight,
      gridSize,
      zoom,
      minZoom,
      maxZoom,
      zoomIn,
      zoomOut,
      snapToGrid,
      getMousePos,
      setupResizeObserver
    } = useCanvasOperations()
    
    // Use the passed circuit manager instead of creating our own
    const {
      activeCircuit,
      addComponent,
      removeComponent,
      updateComponent,
      clearCurrentCircuit,
      navigateToCircuit,
      breadcrumbs
    } = props.circuitManager
    
    // Use current circuit components and wires directly
    const components = computed(() => activeCircuit.value?.components || [])
    const wires = computed(() => activeCircuit.value?.wires || [])
    const wireJunctions = computed(() => activeCircuit.value?.wireJunctions || [])
    
    // Circuit data management (for backward compatibility)
    const {
      getCircuitData: getCircuitDataBase
    } = useCircuitData()
    
    // Circuit generation
    const { generateGglProgram } = useCircuitGeneration()
    
    // Wire management - pass the shared model functions
    const wireManagement = useWireManagement(components, gridSize.value, {
      wires: wires,
      wireJunctions: wireJunctions,
      addWire: (wire) => activeCircuit.value?.wires.push(wire),
      removeWire: (index) => activeCircuit.value?.wires.splice(index, 1),
      addWireJunction: (junction) => activeCircuit.value?.wireJunctions.push(junction),
      removeWireJunction: (index) => activeCircuit.value?.wireJunctions.splice(index, 1)
    })
    const {
      selectedWires,
      drawingWire,
      wirePoints,
      currentMousePos,
      previewPoints,
      startConnection,
      startWireDrawing,
      addWireWaypoint,
      completeWire,
      cancelWireDrawing,
      findClosestGridPointOnWire,
      startWireFromJunction,
      completeWireAtJunction
    } = wireManagement
    
    // Selection management
    const selection = useSelection(
      components, 
      wires, 
      wireManagement.cleanupJunctionsForDeletedWires,
      (componentIds) => {
        // Delete components via circuit manager
        componentIds.forEach(id => removeComponent(id))
      },
      (index) => {
        // Delete wires via circuit manager
        activeCircuit.value?.wires.splice(index, 1)
      }
    )
    const {
      selectedComponents,
      isSelecting,
      selectionRect,
      startSelection,
      updateSelectionEnd,
      endSelection,
      selectComponent,
      selectWire,
      clearSelection,
      deleteSelected,
      checkAndClearJustFinished
    } = selection
    
    // Note: selectedWires is managed by both wireManagement and selection composables
    // We use selection.selectedWires for component selection logic
    
    // Drag and drop
    const dragAndDrop = useDragAndDrop(
      components,
      wires,
      selectedComponents,
      selection.selectedWires,
      snapToGrid,
      wireJunctions
    )
    const {
      dragging,
      startDrag,
      startWireDrag,
      updateDrag,
      endDrag,
      isDragging
    } = dragAndDrop

    // Canvas interactions (controller layer) - must come after selection and dragAndDrop
    const canvasInteractions = useCanvasInteractions(
      props.circuitManager,
      { getMousePos, snapToGrid, gridSize },
      wireManagement,
      selection,
      dragAndDrop
    )
    
    const {
      lastComponentPosition,
      isJunctionMode,
      junctionPreview,
      connectionPreview,
      handleCanvasClick,
      handleCanvasMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleKeyDown: handleInteractionKeyDown,
      handleKeyUp: handleInteractionKeyUp,
      handleWireClick,
      handleWireMouseDown,
      addComponentAtSmartPosition
    } = canvasInteractions

    // Global key handlers for when canvas doesn't have focus
    onMounted(() => {
      const handleGlobalKeyDown = (event) => {
        handleInteractionKeyDown(event)
      }
      
      const handleGlobalKeyUp = (event) => {
        handleInteractionKeyUp(event)
      }
      
      window.addEventListener('keydown', handleGlobalKeyDown)
      window.addEventListener('keyup', handleGlobalKeyUp)
      
      onUnmounted(() => {
        window.removeEventListener('keydown', handleGlobalKeyDown)
        window.removeEventListener('keyup', handleGlobalKeyUp)
      })
    })
    
    // Constants
    const dotSize = ref(DOT_SIZE)
    
    // Set up resize observer
    setupResizeObserver(container)
    
    // Keyboard event handling
    onMounted(() => {
      window.addEventListener('keydown', handleInteractionKeyDown)
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleInteractionKeyDown)
    })
    
    // Methods
    function getComponentType(type) {
      return componentRegistry[type]?.component
    }
    
    function setComponentRef(id, el) {
      if (el) {
        componentRefs.value[id] = el
      } else {
        delete componentRefs.value[id]
      }
    }
    
    
    
    
    
    function handleStartDrag(dragInfo) {
      startDrag(dragInfo)
    }
    
    function handleEditSubcircuit(circuitId) {
      navigateToCircuit(circuitId)
    }
    
    
    // Computed property to get component instances
    const componentInstances = computed(() => {
      const instances = {}
      Object.keys(componentRefs.value).forEach(id => {
        const ref = componentRefs.value[id]
        if (ref) {
          instances[id] = ref
        }
      })
      return instances
    })
    
    function getCircuitData() {
      return generateGglProgram(components.value, wires.value, wireJunctions.value, componentRefs.value, componentInstances.value)
    }
    
    
    // Watch for selection changes and emit event
    watch([selectedComponents, selection.selectedWires], () => {
      emit('selectionChanged', {
        components: selectedComponents.value,
        wires: selection.selectedWires.value
      })
    }, { deep: true })
    
    // Add wire directly (for loading from file)
    function addWire(wireData) {
      activeCircuit.value?.wires.push(wireData)
    }
    
    // Add wire junction directly (for loading from file)
    function addWireJunction(junctionData) {
      activeCircuit.value?.wireJunctions.push(junctionData)
    }
    
    // Load component directly from saved data (preserves ID and props)
    function loadComponent(componentData) {
      // Directly add the component without calling onCreate or generating new ID
      const component = {
        id: componentData.id,
        type: componentData.type,
        x: componentData.x,
        y: componentData.y,
        props: componentData.props || {}
      }
      addComponent(component)
    }
    
    // Clear current circuit
    function clearCircuit() {
      clearCurrentCircuit()
      clearSelection()
    }
    
    return {
      // Template refs
      container,
      
      // State
      canvasWidth,
      canvasHeight,
      gridSize,
      zoom,
      minZoom,
      maxZoom,
      dotSize,
      components,
      wires,
      selectedComponents,
      selectedWires: selection.selectedWires,
      isSelecting,
      selectionRect,
      drawingWire,
      wirePoints,
      previewPoints,
      wireJunctions,
      isJunctionMode,
      junctionPreview,
      connectionPreview,
      
      // Hierarchical circuit state
      activeCircuit,
      breadcrumbs,
      
      // Constants
      COLORS,
      CONNECTION_DOT_RADIUS,
      
      // Methods
      getComponentType,
      setComponentRef,
      handleCanvasClick,
      handleCanvasMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleKeyDown: handleInteractionKeyDown,
      handleKeyUp: handleInteractionKeyUp,
      handleStartDrag,
      handleEditSubcircuit,
      handleWireClick,
      handleWireMouseDown,
      addComponentAtSmartPosition,
      clearCircuit,
      getCircuitData,
      updateComponent,
      loadComponent,
      addWire,
      addWireJunction,
      isDragging,
      getMousePos,
      zoomIn,
      zoomOut,
      
      // Circuit hierarchy methods
      navigateToCircuit,
      ...props.circuitManager
    }
  }
}
</script>

<style scoped>
.circuit-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  overflow: hidden;
}

.grid-canvas, .circuit-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.grid-canvas {
  pointer-events: none;
  z-index: 1;
}

.circuit-canvas {
  z-index: 2;
  cursor: default;
}

.circuit-canvas.dragging {
  cursor: move;
}

.zoom-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

.zoom-button {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #6b7280;
  transition: all 0.2s;
}

.zoom-button:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-button i {
  font-size: 12px;
}
</style>