<template>
  <g :transform="`translate(${x * GRID_SIZE}, ${y * GRID_SIZE})`">
    <!-- Rotation group centered roughly in the middle -->
    <g :transform="`rotate(${rotation}, ${GRID_SIZE}, ${GRID_SIZE})`">
      <!-- Label above -->
      <text :x="GRID_SIZE" y="-15" text-anchor="middle" class="component-label">
        {{ label }}
      </text>

      <!-- Triangle shape pointing left -->
      <polygon
        :points="trianglePoints"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        :class="componentClasses"
        @mousedown="handleMouseDown"
      />

      <!-- Input connection (left tip of triangle) -->
      <circle
        :cx="0"
        :cy="GRID_SIZE"
        :r="CONNECTION_DOT_RADIUS"
        :fill="COLORS.connectionFill"
        class="connection-point input"
        :data-component-id="id"
        data-port="0"
        data-type="input"
      />

      <!-- No output connection circle -->
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useComponentView, draggableProps } from '../composables/useComponentView'
import { COLORS, CONNECTION_DOT_RADIUS, GRID_SIZE } from '../utils/constants'

export default defineComponent({
  name: 'TunnelNode',
  props: {
    ...draggableProps,
    label: { type: String, default: 'TUN' },
    rotation: { type: Number, default: 0 }
  },
  emits: ['startDrag'],
  computed: {
    trianglePoints() {
      const width = GRID_SIZE // horizontal length
      const height = GRID_SIZE * 2 // vertical height
      const tipX = 0
      const tipY = height / 2  // GRID_SIZE, center vertically
      return `${tipX},${tipY} ${width},${height} ${width},0`
    }
  },
  setup(props, { emit }) {
    const {
      handleMouseDown,
      fillColor,
      strokeColor,
      strokeWidth,
      componentClasses
    } = useComponentView(props, emit)

    return {
      handleMouseDown,
      fillColor,
      strokeColor,
      strokeWidth,
      componentClasses,
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