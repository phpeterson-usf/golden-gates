<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- AND gate shape - MIL-STD-806B style -->
    <!-- Rectangle left half + semicircle right half -->
    <!-- Rectangle extends to x=60, semicircle radius is 30, so tip is at x=90 -->
    <path
      d="M 0 -15 L 60 -15 A 30 30 0 0 1 60 75 L 0 75 L 0 -15 Z"
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
    
    <!-- Output connection point (on grid: x=90, y=30) -->
    <circle 
      cx="90" 
      cy="30" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point output"
      :data-component-id="id"
      data-port="0"
      data-type="output"
    />
    
    <!-- Label -->
    <text x="45" y="35" text-anchor="middle" class="component-label">
      &amp;
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
  },
  methods: {
    generate() {
      // Extract the number from the component ID (e.g., "and-gate_1" -> 1)
      const match = this.id.match(/and-gate_(\d+)/)
      const index = match ? match[1] : '0'
      const varName = `and${index}`
      
      // Generate GGL code for this AND gate
      return {
        varName,
        code: `${varName} = logic.And()`
      }
    }
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>