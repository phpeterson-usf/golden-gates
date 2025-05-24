<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- AND gate shape (offset to keep all dots on grid) -->
    <path
      d="M 10 -30 L 40 -30 L 40 0 A 30 30 0 0 1 40 60 L 40 90 L 10 90 L 10 -30 Z"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      class="component-body"
      @mousedown="handleMouseDown"
    />
    
    <!-- Input connection points (on grid: y=0 and y=60) -->
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
    <circle 
      cx="0" 
      cy="60" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point input"
      :data-component-id="id"
      data-port="1"
      data-type="input"
    />
    
    <!-- Output connection point (on grid: x=60, y=30) -->
    <circle 
      cx="60" 
      cy="30" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point output"
      :data-component-id="id"
      data-port="0"
      data-type="output"
    />
    
    <!-- Label -->
    <text x="25" y="35" text-anchor="middle" class="component-label">
      AND
    </text>
  </g>
</template>

<script>
import { useDraggable, draggableProps } from '../composables/useDraggable'
import { COLORS, CONNECTION_DOT_RADIUS } from '../utils/constants'

export default {
  name: 'AndGate',
  props: {
    ...draggableProps
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