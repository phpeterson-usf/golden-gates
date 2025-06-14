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
      :class="{ dragging: isDragging() || isSelecting }"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasClick"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
    >
      <g :transform="`scale(${zoom})`">
        <!-- Wires -->
        <Wire
          v-for="(wire, index) in wires"
          :key="`wire-${index}`"
          :points="wire.points"
          :selected="selectedWires.has(index)"
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
          v-bind="comp.props"
          @startDrag="handleStartDrag"
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
import { useCircuitData } from '../composables/useCircuitData'
import { useCircuitGeneration } from '../composables/useCircuitGeneration'

export default {
  name: 'CircuitCanvas',
  components: {
    Wire
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
    
    // Circuit data management
    const {
      components,
      addComponent,
      removeComponent,
      clearCircuit,
      getCircuitData: getCircuitDataBase
    } = useCircuitData()
    
    // Circuit generation
    const { generateGglProgram } = useCircuitGeneration()
    
    // Wire management
    const wireManagement = useWireManagement(components, gridSize.value)
    const {
      wires,
      selectedWires,
      drawingWire,
      wirePoints,
      currentMousePos,
      previewPoints,
      wireJunctions,
      startWireDrawing,
      addWireWaypoint,
      completeWire,
      cancelWireDrawing,
      findClosestGridPointOnWire,
      startWireFromJunction,
      completeWireAtJunction
    } = wireManagement
    
    // Track last component position for intelligent placement
    const lastComponentPosition = ref({ x: 100, y: 100 })

    // Selection management
    const selection = useSelection(components, wires, wireManagement.cleanupJunctionsForDeletedWires)
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
    
    // Replace selectedWires ref with the one from selection
    selectedWires.value = selection.selectedWires.value
    
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
    
    // Constants
    const dotSize = ref(DOT_SIZE)
    
    // Set up resize observer
    setupResizeObserver(container)
    
    // Keyboard event handling
    function handleKeyDown(event) {
      // Check if an input field is focused
      const activeElement = document.activeElement
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.classList.contains('p-inputtext') ||
        activeElement.classList.contains('p-inputnumber-input')
      )
      
      // Delete selected components and wires (only if not typing in an input)
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputFocused) {
        deleteSelected()
      }
      
      // Cancel wire drawing with Escape
      if (event.key === 'Escape' && drawingWire.value) {
        cancelWireDrawing()
      }
    }
    
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
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
    
    function handleCanvasClick(event) {
      // Ignore clicks if we just finished selecting
      if (checkAndClearJustFinished()) {
        return
      }
      
      const target = event.target
      
      // Check if we clicked on a connection point
      if (target.classList.contains('connection-point')) {
        const componentId = target.dataset.componentId
        const portIndex = parseInt(target.dataset.port)
        const portType = target.dataset.type // 'input' or 'output'
        const pos = getMousePos(event)
        
        if (!drawingWire.value) {
          // Clear selection when starting to draw a wire
          clearSelection()
          // Start drawing a wire
          startWireDrawing(componentId, portIndex, portType, pos)
        } else {
          // Complete the wire if clicking on a compatible connection
          completeWire(componentId, portIndex, portType)
        }
        return
      }
      
      // If drawing a wire and clicked elsewhere, add a waypoint
      if (drawingWire.value) {
        const pos = getMousePos(event)
        addWireWaypoint(pos)
        return
      }
      
      // Otherwise, clicking on canvas deselects all
      if (target === event.currentTarget) {
        clearSelection()
      }
    }
    
    function handleCanvasMouseDown(event) {
      // Only start selection on the canvas itself, not on components
      if (event.target === event.currentTarget && !drawingWire.value) {
        const pos = getMousePos(event)
        const clearExisting = !event.shiftKey && !event.metaKey && !event.ctrlKey
        startSelection(pos, clearExisting)
        event.preventDefault()
      }
    }
    
    function handleMouseMove(event) {
      // Always update current mouse position for wire preview
      const pos = getMousePos(event)
      currentMousePos.value = pos
      
      // Handle rubber-band selection
      if (isSelecting.value) {
        updateSelectionEnd(pos)
        return
      }
      
      // Handle dragging
      if (isDragging()) {
        updateDrag(pos)
      }
    }
    
    function handleMouseUp() {
      // End dragging
      if (isDragging()) {
        const wasComponentDrag = !dragging.value?.isWireDrag
        endDrag(snapToGrid)
        
        // Update last component position if we were dragging components
        if (wasComponentDrag && selectedComponents.value.size > 0) {
          // Use the position of any selected component as the new reference
          const selectedId = Array.from(selectedComponents.value)[0]
          const selectedComponent = components.value.find(c => c.id === selectedId)
          if (selectedComponent) {
            lastComponentPosition.value = { x: selectedComponent.x, y: selectedComponent.y }
          }
        }
      }
      
      // End rubber-band selection
      if (isSelecting.value) {
        endSelection()
      }
    }
    
    function handleStartDrag(dragInfo) {
      startDrag(dragInfo)
    }
    
    function handleWireClick(index, event) {
      // If we're drawing a wire and Alt is held, complete it with a junction
      if (drawingWire.value && event.altKey) {
        const pos = getMousePos(event)
        const junctionPos = findClosestGridPointOnWire(index, pos)
        
        if (junctionPos) {
          // Complete the wire at this junction
          completeWireAtJunction(index, junctionPos)
        }
      } 
      // If not drawing and Alt is held, start from junction
      else if (!drawingWire.value && event.altKey) {
        const pos = getMousePos(event)
        const junctionPos = findClosestGridPointOnWire(index, pos)
        
        if (junctionPos) {
          // Start drawing a new wire from this junction
          startWireFromJunction(index, junctionPos)
        }
      } else {
        // Normal selection behavior with Command/Ctrl for multi-select
        const isMultiSelect = event.metaKey || event.ctrlKey
        selectWire(index, isMultiSelect)
      }
      // Stop propagation to prevent canvas click handler
      event.stopPropagation()
    }
    
    function handleWireMouseDown(wireIndex, event) {
      // Only start drag if the wire is selected
      if (!selection.selectedWires.value.has(wireIndex)) return
      
      event.stopPropagation()
      
      // Get mouse position
      const pos = getMousePos(event)
      const wire = wires.value[wireIndex]
      if (!wire || wire.points.length === 0) return
      
      startWireDrag(wireIndex, {
        id: `wire_drag_${wireIndex}`,
        offsetX: pos.x - wire.points[0].x,
        offsetY: pos.y - wire.points[0].y
      })
    }
    
    function addComponentAtSmartPosition(type) {
      // Use last component position with offset (5 grid units down)
      const x = lastComponentPosition.value.x
      const y = lastComponentPosition.value.y + (gridSize.value * 5)
      const snapped = snapToGrid({ x, y })
      
      const newComponent = addComponent(type, snapped.x, snapped.y)
      
      // Update last component position
      lastComponentPosition.value = { x: snapped.x, y: snapped.y }
      
      // Clear existing selection and select the new component
      clearSelection()
      selectComponent(newComponent.id)
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
      return generateGglProgram(components.value, wires.value, componentRefs.value, componentInstances.value)
    }
    
    function updateComponent(updatedComponent) {
      const index = components.value.findIndex(c => c.id === updatedComponent.id)
      if (index !== -1) {
        // Use Vue's reactivity-safe array update method
        components.value.splice(index, 1, updatedComponent)
      }
    }
    
    // Watch for selection changes and emit event
    watch([selectedComponents, selection.selectedWires], () => {
      emit('selectionChanged', {
        components: selectedComponents.value,
        wires: selection.selectedWires.value
      })
    }, { deep: true })
    
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
      selectedWires,
      isSelecting,
      selectionRect,
      drawingWire,
      wirePoints,
      previewPoints,
      wireJunctions,
      
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
      handleStartDrag,
      handleWireClick,
      handleWireMouseDown,
      addComponentAtSmartPosition,
      clearCircuit,
      getCircuitData,
      updateComponent,
      isDragging,
      getMousePos,
      zoomIn,
      zoomOut
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