<template>
  <g :transform="`translate(${x * GRID_SIZE}, ${y * GRID_SIZE})`">
    <!-- Label above (always upright) -->
    <text
      :x="GRID_SIZE"
      y="-15"
      text-anchor="middle"
      class="component-label"
    >
      {{ label }}
    </text>

    <!-- Rotation group centered roughly in the middle -->
    <g :transform="`rotate(${rotation}, ${GRID_SIZE}, ${GRID_SIZE})`">
      <!-- Triangle shape -->
      <polygon
        :points="trianglePoints"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        :class="componentClasses"
        @mousedown="handleMouseDown"
      />

      <!-- Single connection dot -->
      <circle
        :cx="0"
        :cy="GRID_SIZE"
        :r="CONNECTION_DOT_RADIUS"
        :fill="COLORS.connectionFill"
        class="connection-point"
        :class="direction"
        :data-component-id="id"
        data-port="0"
        :data-type="direction"
      />
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
    rotation: { type: Number, default: 0 },
    direction: { type: String as PropType<'input' | 'output'>, default: 'input' }
  },
  emits: ['startDrag'],
  computed: {
    trianglePoints() {
      const width = GRID_SIZE
      const height = GRID_SIZE

      const tipX = 0
      const tipY = GRID_SIZE // connection dot is at (0, GRID_SIZE)

      const baseTopX = width
      const baseTopY = GRID_SIZE - height / 2

      const baseBottomX = width
      const baseBottomY = GRID_SIZE + height / 2

      return `${tipX},${tipY} ${baseBottomX},${baseBottomY} ${baseTopX},${baseTopY}`
    }
  },
  setup(props, { emit }) {
    const { handleMouseDown, fillColor, strokeColor, strokeWidth, componentClasses } =
      useComponentView(props, emit)

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
