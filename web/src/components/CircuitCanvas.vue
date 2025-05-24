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
      :class="{ dragging: dragging }"
      :width="canvasWidth"
      :height="canvasHeight"
      @click="handleCanvasClick"
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
          @click="selectWire(index, $event)"
          @mousedown="startWireDrag(index, $event)"
        />
        
        <!-- Wire preview during drawing -->
        <Wire
          v-if="drawingWire && wirePoints.length > 0"
          :points="previewPoints"
          :preview="true"
        />
        
        <!-- Components -->
        <component
          v-for="comp in components"
          :key="comp.id"
          :is="getComponentType(comp.type)"
          :id="comp.id"
          :x="comp.x"
          :y="comp.y"
          :selected="selectedComponents.has(comp.id)"
          v-bind="comp.props"
          @startDrag="startDrag"
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
import { componentRegistry } from '../utils/componentRegistry'
import { GRID_SIZE, DOT_SIZE, COLORS } from '../utils/constants'
import Wire from './Wire.vue'

export default {
  components: {
    Wire
  },
  name: 'CircuitCanvas',
  data() {
    return {
      canvasWidth: 800,
      canvasHeight: 600,
      gridSize: GRID_SIZE,
      dotSize: DOT_SIZE,
      components: [],
      selectedComponents: new Set(),
      nextId: 1,
      inputCounter: 0,
      outputCounter: 0,
      dragging: null,
      zoom: 1,
      minZoom: 0.5,
      maxZoom: 2,
      zoomStep: 0.25,
      // Wire drawing state
      drawingWire: false,
      wirePoints: [],
      wireDirection: 'horizontal', // 'horizontal' or 'vertical'
      startConnection: null,
      wires: [],
      currentMousePos: null,
      selectedWires: new Set()
    }
  },
  mounted() {
    this.resizeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
    window.addEventListener('keydown', this.handleKeyDown)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCanvas)
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  methods: {
    getComponentType(type) {
      return componentRegistry[type]?.component
    },
    resizeCanvas() {
      const container = this.$refs.container
      if (container) {
        this.canvasWidth = container.clientWidth
        this.canvasHeight = container.clientHeight
      }
    },
    snapToGrid(pos) {
      return {
        x: Math.round(pos.x / this.gridSize) * this.gridSize,
        y: Math.round(pos.y / this.gridSize) * this.gridSize
      }
    },
    getMousePos(event) {
      // Get SVG coordinates from mouse position
      const svg = event.currentTarget
      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      
      // Transform to SVG coordinates and account for zoom
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      return {
        x: svgP.x / this.zoom,
        y: svgP.y / this.zoom
      }
    },
    handleCanvasClick(event) {
      const target = event.target
      
      // Check if we clicked on a connection point
      if (target.classList.contains('connection-point')) {
        const componentId = target.dataset.componentId
        const portIndex = parseInt(target.dataset.port)
        const portType = target.dataset.type // 'input' or 'output'
        
        if (!this.drawingWire) {
          // Start drawing a wire
          this.startWireDrawing(componentId, portIndex, portType, event)
        } else {
          // Complete the wire if clicking on a compatible connection
          this.completeWire(componentId, portIndex, portType)
        }
        return
      }
      
      // If drawing a wire and clicked elsewhere, add a waypoint
      if (this.drawingWire) {
        this.addWireWaypoint(event)
        return
      }
      
      // Otherwise, clicking on canvas deselects all components and wires
      if (target === event.currentTarget) {
        this.selectedComponents.clear()
        this.selectedWires.clear()
      }
    },
    addComponentAtCenter(type) {
      // Add component at center of visible canvas
      const centerX = this.canvasWidth / 2
      const centerY = this.canvasHeight / 2
      const snapped = this.snapToGrid({ x: centerX, y: centerY })
      
      const config = componentRegistry[type]
      if (!config) return
      
      const id = `${type}_${this.nextId++}`
      const component = {
        id,
        type,
        x: snapped.x,
        y: snapped.y,
        props: { ...config.defaultProps }
      }
      
      // Special handling for certain component types
      if (config.onCreate) {
        if (type === 'input') {
          config.onCreate(component, this.inputCounter++)
        } else if (type === 'output') {
          config.onCreate(component, this.outputCounter++)
        }
      }
      
      this.components.push(component)
    },
    startDrag(dragInfo) {
      // Check if Command key is held (metaKey for Mac, ctrlKey for Windows/Linux)
      const isMultiSelect = dragInfo.event?.metaKey || dragInfo.event?.ctrlKey
      
      // If multi-selecting, toggle the component's selection
      if (isMultiSelect) {
        if (this.selectedComponents.has(dragInfo.id)) {
          this.selectedComponents.delete(dragInfo.id)
          // If we just deselected the component, don't start dragging
          if (!this.selectedComponents.has(dragInfo.id)) {
            return
          }
        } else {
          this.selectedComponents.add(dragInfo.id)
        }
      } else {
        // If not multi-selecting and clicked component isn't selected, clear selection
        if (!this.selectedComponents.has(dragInfo.id)) {
          this.selectedComponents.clear()
        }
        // Add the clicked component to selection
        this.selectedComponents.add(dragInfo.id)
      }
      
      // Find the component
      const component = this.components.find(c => c.id === dragInfo.id)
      if (!component) return
      
      // Store initial positions of all selected components
      const draggedComponents = []
      for (const id of this.selectedComponents) {
        const comp = this.components.find(c => c.id === id)
        if (comp) {
          draggedComponents.push({
            id: comp.id,
            initialX: comp.x,
            initialY: comp.y
          })
        }
      }
      
      // Store initial positions of all selected wires
      const draggedWires = []
      for (const wireIndex of this.selectedWires) {
        const wire = this.wires[wireIndex]
        if (wire) {
          draggedWires.push({
            index: wireIndex,
            initialPoints: wire.points.map(p => ({ x: p.x, y: p.y }))
          })
        }
      }
      
      // Also include wires that are connected to selected components
      this.wires.forEach((wire, index) => {
        if (!this.selectedWires.has(index)) {
          const startSelected = this.selectedComponents.has(wire.startConnection.componentId)
          const endSelected = this.selectedComponents.has(wire.endConnection.componentId)
          
          if (startSelected || endSelected) {
            draggedWires.push({
              index: index,
              initialPoints: wire.points.map(p => ({ x: p.x, y: p.y })),
              startSelected,
              endSelected
            })
          }
        }
      })
      
      this.dragging = {
        id: dragInfo.id,
        offsetX: dragInfo.offsetX,
        offsetY: dragInfo.offsetY,
        hasMoved: false,
        components: draggedComponents,
        wires: draggedWires
      }
    },
    handleMouseMove(event) {
      // Always update current mouse position for wire preview
      const pos = this.getMousePos(event)
      this.currentMousePos = pos
      
      if (this.dragging) {
        const newX = pos.x - this.dragging.offsetX
        const newY = pos.y - this.dragging.offsetY
        
        // Mark that we've moved
        this.dragging.hasMoved = true
        
        // Calculate the delta based on whether we're dragging components or wires
        let deltaX, deltaY
        
        if (this.dragging.isWireDrag) {
          // For wire dragging, use the first wire's first point as reference
          const firstWire = this.wires[this.dragging.wires[0].index]
          if (!firstWire) return
          deltaX = newX - this.dragging.wires[0].initialPoints[0].x
          deltaY = newY - this.dragging.wires[0].initialPoints[0].y
        } else {
          // For component dragging, use the dragged component as reference
          const draggedComp = this.dragging.components.find(c => c.id === this.dragging.id)
          if (!draggedComp) return
          deltaX = newX - draggedComp.initialX
          deltaY = newY - draggedComp.initialY
        }
        
        // Update all selected components by the same delta
        for (const dragInfo of this.dragging.components) {
          const component = this.components.find(c => c.id === dragInfo.id)
          if (component) {
            component.x = dragInfo.initialX + deltaX
            component.y = dragInfo.initialY + deltaY
          }
        }
        
        // Update all affected wires
        for (const wireInfo of this.dragging.wires) {
          const wire = this.wires[wireInfo.index]
          if (wire) {
            // Update each point in the wire
            for (let i = 0; i < wire.points.length; i++) {
              wire.points[i] = {
                x: wireInfo.initialPoints[i].x + deltaX,
                y: wireInfo.initialPoints[i].y + deltaY
              }
            }
            
            // Update connection positions
            wire.startConnection.pos.x = wireInfo.initialPoints[0].x + deltaX
            wire.startConnection.pos.y = wireInfo.initialPoints[0].y + deltaY
            wire.endConnection.pos.x = wireInfo.initialPoints[wireInfo.initialPoints.length - 1].x + deltaX
            wire.endConnection.pos.y = wireInfo.initialPoints[wireInfo.initialPoints.length - 1].y + deltaY
          }
        }
      }
    },
    handleMouseUp(event) {
      if (this.dragging) {
        // Only snap to grid if we actually moved
        if (this.dragging.hasMoved) {
          const pos = this.getMousePos(event)
          const finalX = pos.x - this.dragging.offsetX
          const finalY = pos.y - this.dragging.offsetY
          
          // Calculate the delta based on whether we're dragging components or wires
          let snappedDeltaX, snappedDeltaY
          
          if (this.dragging.isWireDrag) {
            // For wire dragging, use the first wire's first point as reference
            const firstWire = this.wires[this.dragging.wires[0].index]
            if (!firstWire) return
            
            const snapped = this.snapToGrid({ x: finalX, y: finalY })
            snappedDeltaX = snapped.x - this.dragging.wires[0].initialPoints[0].x
            snappedDeltaY = snapped.y - this.dragging.wires[0].initialPoints[0].y
          } else {
            // For component dragging, use the dragged component as reference
            const draggedComp = this.dragging.components.find(c => c.id === this.dragging.id)
            if (!draggedComp) return
            
            const snapped = this.snapToGrid({ x: finalX, y: finalY })
            snappedDeltaX = snapped.x - draggedComp.initialX
            snappedDeltaY = snapped.y - draggedComp.initialY
          }
            
            // Apply the snapped delta to all selected components
            for (const dragInfo of this.dragging.components) {
              const component = this.components.find(c => c.id === dragInfo.id)
              if (component) {
                component.x = dragInfo.initialX + snappedDeltaX
                component.y = dragInfo.initialY + snappedDeltaY
              }
            }
            
            // Apply the snapped delta to all affected wires
            for (const wireInfo of this.dragging.wires) {
              const wire = this.wires[wireInfo.index]
              if (wire) {
                // Update each point in the wire
                for (let i = 0; i < wire.points.length; i++) {
                  wire.points[i] = {
                    x: wireInfo.initialPoints[i].x + snappedDeltaX,
                    y: wireInfo.initialPoints[i].y + snappedDeltaY
                  }
                }
                
                // Update connection positions
                wire.startConnection.pos.x = wireInfo.initialPoints[0].x + snappedDeltaX
                wire.startConnection.pos.y = wireInfo.initialPoints[0].y + snappedDeltaY
                wire.endConnection.pos.x = wireInfo.initialPoints[wireInfo.initialPoints.length - 1].x + snappedDeltaX
                wire.endConnection.pos.y = wireInfo.initialPoints[wireInfo.initialPoints.length - 1].y + snappedDeltaY
              }
            }
          }
        }
        
        this.dragging = null
      }
    },
    clearCircuit() {
      this.components = []
      this.selectedComponents.clear()
      this.nextId = 1
      this.inputCounter = 0
      this.outputCounter = 0
      this.dragging = null
      this.wires = []
      this.selectedWires.clear()
      this.drawingWire = false
      this.wirePoints = []
      this.startConnection = null
    },
    handleKeyDown(event) {
      // Escape key - cancel wire drawing
      if (event.key === 'Escape' && this.drawingWire) {
        event.preventDefault()
        this.cancelWireDrawing()
        return
      }
      
      // Delete or Backspace key
      if ((event.key === 'Delete' || event.key === 'Backspace')) {
        if (this.selectedComponents.size > 0 || this.selectedWires.size > 0) {
          event.preventDefault()
          this.deleteSelected()
        }
      }
    },
    cancelWireDrawing() {
      this.drawingWire = false
      this.wirePoints = []
      this.startConnection = null
    },
    deleteSelected() {
      // Delete selected components
      if (this.selectedComponents.size > 0) {
        // Remove all selected components
        this.components = this.components.filter(c => !this.selectedComponents.has(c.id))
        
        // Also remove any wires connected to deleted components
        this.wires = this.wires.filter(wire => {
          const startExists = this.components.some(c => c.id === wire.startConnection.componentId)
          const endExists = this.components.some(c => c.id === wire.endConnection.componentId)
          return startExists && endExists
        })
        
        // Clear component selection
        this.selectedComponents.clear()
      }
      
      // Delete selected wires
      if (this.selectedWires.size > 0) {
        // Create array of indices to delete, sorted in descending order
        const indicesToDelete = Array.from(this.selectedWires).sort((a, b) => b - a)
        
        // Remove wires by index (in reverse order to maintain indices)
        for (const index of indicesToDelete) {
          this.wires.splice(index, 1)
        }
        
        // Clear wire selection
        this.selectedWires.clear()
      }
    },
    zoomIn() {
      if (this.zoom < this.maxZoom) {
        this.zoom = Math.min(this.zoom + this.zoomStep, this.maxZoom)
      }
    },
    zoomOut() {
      if (this.zoom > this.minZoom) {
        this.zoom = Math.max(this.zoom - this.zoomStep, this.minZoom)
      }
    },
    startWireDrawing(componentId, portIndex, portType, event) {
      const component = this.components.find(c => c.id === componentId)
      if (!component) return
      
      // Get the connection point position
      const config = componentRegistry[component.type]
      const connections = portType === 'output' ? config.connections.outputs : config.connections.inputs
      const connection = connections[portIndex]
      if (!connection) return
      
      // Calculate absolute position of connection point
      const connectionPos = {
        x: component.x + connection.x,
        y: component.y + connection.y
      }
      
      // Start wire drawing
      this.drawingWire = true
      this.startConnection = { componentId, portIndex, portType, pos: connectionPos }
      this.wirePoints = [connectionPos]
      this.wireDirection = 'horizontal' // Start with horizontal
    },
    completeWire(componentId, portIndex, portType) {
      // Can't connect to same type (input to input or output to output)
      if (this.startConnection.portType === portType) return
      
      // Can't connect to same component
      if (this.startConnection.componentId === componentId) return
      
      const component = this.components.find(c => c.id === componentId)
      if (!component) return
      
      // Get the connection point position
      const config = componentRegistry[component.type]
      const connections = portType === 'output' ? config.connections.outputs : config.connections.inputs
      const connection = connections[portIndex]
      if (!connection) return
      
      // Calculate absolute position of connection point
      const endPos = {
        x: component.x + connection.x,
        y: component.y + connection.y
      }
      
      // Add the final point
      this.addPointToWire(endPos)
      
      // Create the wire
      this.wires.push({
        points: [...this.wirePoints],
        startConnection: { ...this.startConnection },
        endConnection: { componentId, portIndex, portType, pos: endPos }
      })
      
      // Reset wire drawing state
      this.drawingWire = false
      this.wirePoints = []
      this.startConnection = null
    },
    addWireWaypoint(event) {
      const pos = this.getMousePos(event)
      const snappedPos = this.snapToGrid(pos)
      this.addPointToWire(snappedPos)
      
      // Toggle direction for next segment
      this.wireDirection = this.wireDirection === 'horizontal' ? 'vertical' : 'horizontal'
    },
    addPointToWire(targetPos) {
      if (this.wirePoints.length === 0) {
        this.wirePoints.push(targetPos)
        return
      }
      
      const lastPoint = this.wirePoints[this.wirePoints.length - 1]
      
      // Add intermediate point to create right-angle turns
      if (this.wireDirection === 'horizontal') {
        // Move horizontally first, then vertically
        if (targetPos.x !== lastPoint.x) {
          this.wirePoints.push({ x: targetPos.x, y: lastPoint.y })
        }
        if (targetPos.y !== lastPoint.y) {
          this.wirePoints.push(targetPos)
        }
      } else {
        // Move vertically first, then horizontally
        if (targetPos.y !== lastPoint.y) {
          this.wirePoints.push({ x: lastPoint.x, y: targetPos.y })
        }
        if (targetPos.x !== lastPoint.x) {
          this.wirePoints.push(targetPos)
        }
      }
    },
    getPreviewPoint(mousePos) {
      if (this.wirePoints.length === 0) return [mousePos]
      
      const lastPoint = this.wirePoints[this.wirePoints.length - 1]
      const snappedPos = this.snapToGrid(mousePos)
      
      // Create preview points for right-angle routing
      const previewPoints = []
      if (this.wireDirection === 'horizontal') {
        // Horizontal first
        if (snappedPos.x !== lastPoint.x) {
          previewPoints.push({ x: snappedPos.x, y: lastPoint.y })
        }
        if (snappedPos.x !== lastPoint.x || snappedPos.y !== lastPoint.y) {
          previewPoints.push(snappedPos)
        }
      } else {
        // Vertical first
        if (snappedPos.y !== lastPoint.y) {
          previewPoints.push({ x: lastPoint.x, y: snappedPos.y })
        }
        if (snappedPos.x !== lastPoint.x || snappedPos.y !== lastPoint.y) {
          previewPoints.push(snappedPos)
        }
      }
      
      return previewPoints
    },
    selectWire(index, event) {
      // Check if Command key is held
      const isMultiSelect = event.metaKey || event.ctrlKey
      
      if (!isMultiSelect) {
        // Clear all selections
        this.selectedComponents.clear()
        this.selectedWires.clear()
      }
      
      // Toggle wire selection
      if (this.selectedWires.has(index)) {
        this.selectedWires.delete(index)
      } else {
        this.selectedWires.add(index)
      }
      
      // Stop propagation to prevent canvas click handler
      event.stopPropagation()
    },
    startWireDrag(wireIndex, event) {
      // Only start drag if the wire is selected
      if (!this.selectedWires.has(wireIndex)) return
      
      event.stopPropagation()
      
      // Get mouse position
      const svg = event.target.closest('svg')
      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      
      // Use the first point of the wire as reference
      const wire = this.wires[wireIndex]
      if (!wire || wire.points.length === 0) return
      
      // Create a pseudo drag event for the wire
      const dragInfo = {
        id: `wire_${wireIndex}`,
        offsetX: svgP.x / this.zoom - wire.points[0].x,
        offsetY: svgP.y / this.zoom - wire.points[0].y,
        event: event
      }
      
      // Store initial positions of all selected wires
      const draggedWires = []
      for (const index of this.selectedWires) {
        const w = this.wires[index]
        if (w) {
          draggedWires.push({
            index: index,
            initialPoints: w.points.map(p => ({ x: p.x, y: p.y }))
          })
        }
      }
      
      this.dragging = {
        id: dragInfo.id,
        offsetX: dragInfo.offsetX,
        offsetY: dragInfo.offsetY,
        hasMoved: false,
        components: [], // No components when dragging wires
        wires: draggedWires,
        isWireDrag: true
      }
    }
  },
  computed: {
    COLORS() {
      return COLORS
    },
    previewPoints() {
      if (!this.drawingWire || this.wirePoints.length === 0) return []
      
      // Get current mouse position
      const mousePos = this.currentMousePos || { x: 0, y: 0 }
      const preview = this.getPreviewPoint(mousePos)
      
      // Combine existing points with preview
      return [...this.wirePoints, ...preview]
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
  font-size: 16px;
  color: #374151;
  transition: all 0.2s;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.zoom-button:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.zoom-button:active:not(:disabled) {
  background-color: #e5e7eb;
}

.zoom-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>