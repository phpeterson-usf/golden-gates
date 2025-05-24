<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- Output circle (30 diameter, offset to center the input dot) -->
    <circle
      :cx="gridSize / 2"
      cy="0"
      :r="gridSize / 2"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      class="component-body"
      @mousedown="handleMouseDown"
    />
    
    <!-- Input connection point (left side, centered - on grid vertex) -->
    <circle 
      cx="0" 
      cy="0" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point input"
      :data-component-id="id"
      data-port="0"
      data-type="input"
    />
    
    <!-- Label (to the right of the circle) -->
    <text 
      :x="gridSize + 10" 
      y="5" 
      text-anchor="start" 
      font-size="14" 
      class="component-label"
    >
      {{ label }}
    </text>
    
    <!-- Value display (inside the circle) -->
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
  name: 'OutputNode',
  props: {
    ...draggableProps,
    label: {
      type: String,
      default: 'OUT'
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
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>