<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- Label -->
    <text 
      x="-10" 
      y="5" 
      text-anchor="end" 
      font-size="14" 
      class="component-label"
    >
      {{ label }}
    </text>
    
    <!-- Input square (30x30, offset up by 15 pixels to center the output dot) -->
    <rect
      x="0"
      y="-15"
      :width="gridSize"
      :height="gridSize"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      class="component-body"
      @mousedown="handleMouseDown"
    />
    
    <!-- Output connection point (right side, centered - on grid vertex) -->
    <circle 
      :cx="gridSize" 
      cy="0" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point output"
      :data-component-id="id"
      data-port="0"
      data-type="output"
    />
    
    <!-- Value display (inside the square) -->
    <text 
      :x="gridSize / 2" 
      y="5" 
      text-anchor="middle" 
      class="component-value"
    >
      {{ value }}
    </text>
  </g>
</template>

<script>
import { useDraggable, draggableProps } from '../composables/useDraggable'
import { COLORS, CONNECTION_DOT_RADIUS } from '../utils/constants'

export default {
  name: 'InputNode',
  props: {
    ...draggableProps,
    label: {
      type: String,
      default: 'IN'
    },
    value: {
      type: Number,
      default: 0
    },
    gridSize: {
      type: Number,
      default: 30
    }
  },
  emits: ['startDrag'],
  setup(props, { emit }) {
    const { handleMouseDown, fillColor, strokeColor, strokeWidth } = useDraggable(props, emit)
    
    return {
      handleMouseDown,
      fillColor,
      strokeColor,
      strokeWidth,
      COLORS,
      CONNECTION_DOT_RADIUS
    }
  },
  methods: {
    generate() {
      // Use label as variable name if it exists and is valid
      let varName
      if (this.label && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.label)) {
        // Label is a valid Python identifier
        varName = this.label.toLowerCase()
      } else {
        // Fall back to numbered variable name
        const match = this.id.match(/input_(\d+)/)
        const index = match ? match[1] : '0'
        varName = `input${index}`
      }
      
      // Generate GGL code for this input
      return {
        varName,
        code: `${varName} = io.Input(bits=1, label="${this.label}")`
      }
    }
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>