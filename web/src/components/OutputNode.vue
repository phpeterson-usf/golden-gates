<template>
  <g :transform="`translate(${x * GRID_SIZE}, ${y * GRID_SIZE})`">
    <!-- Rotation group centered on input point -->
    <g :transform="`rotate(${rotation}, 0, 0)`">
    <!-- Value display (above the circle, centered on component) -->
    <text 
      :x="(GRID_SIZE + 5) / 2" 
      y="-15" 
      text-anchor="middle" 
      class="component-value"
    >
      {{ formattedValue }}
    </text>
    
    <!-- Output circle (larger by 5px diameter, offset right so input point is on left edge) -->
    <circle
      :cx="(GRID_SIZE + 5) / 2"
      cy="0"
      :r="(GRID_SIZE + 5) / 2"
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
      :x="GRID_SIZE + 10" 
      y="5" 
      text-anchor="start" 
      font-size="14" 
      class="component-label"
    >
      {{ label }}
    </text>
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useComponentView, draggableProps } from '../composables/useComponentView'
import { COLORS, CONNECTION_DOT_RADIUS, GRID_SIZE } from '../utils/constants'

export default defineComponent({
  name: 'OutputNode',
  props: {
    ...draggableProps,
    // IO props
    label: { type: String, default: 'OUT' },
    value: { type: Number, default: 0 },
    base: { type: Number, default: 10 },
    bits: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 }
  },
  emits: ['startDrag'],
  computed: {
    formattedValue() {
      // Format value based on base
      if (this.base === 16) {
        return '0x' + this.value.toString(16).padStart(Math.ceil(this.bits / 4), '0').toUpperCase()
      } else if (this.base === 2) {
        return '0b' + this.value.toString(2).padStart(this.bits, '0')
      } else {
        return this.value.toString()
      }
    }
  },
  setup(props, { emit }) {
    const { handleMouseDown, fillColor, strokeColor, strokeWidth } = useComponentView(props, emit)
    
    return {
      handleMouseDown,
      fillColor,
      strokeColor,
      strokeWidth,
      COLORS,
      CONNECTION_DOT_RADIUS,
      GRID_SIZE
    }
  }
})
</script>

<style scoped>
@import '../styles/components.css';
</style>