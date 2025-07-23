<template>
  <g :transform="`translate(${x * GRID_SIZE}, ${y * GRID_SIZE})`">
    <!-- Rotation group centered on component -->
    <g :transform="`rotate(${rotation}, ${width * GRID_SIZE / 2}, ${height * GRID_SIZE / 2})`">
      <!-- Decoder body (rectangle) -->
      <rect
        :x="0"
        :y="0"
        :width="width * GRID_SIZE"
        :height="height * GRID_SIZE"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        :class="componentClasses"
        @mousedown="handleMouseDown"
      />

      <!-- Selector input connection point (no label) -->
      <circle
        :cx="selInputX"
        :cy="selInputY"
        :r="CONNECTION_DOT_RADIUS"
        :fill="COLORS.connectionFill"
        class="connection-point input"
        :data-component-id="id"
        data-port="0"
        data-type="input"
      />

      <!-- Output connection points (no labels) -->
      <template v-for="(_, index) in numOutputs" :key="`output-${index}`">
        <circle
          :cx="width * GRID_SIZE"
          :cy="getOutputY(index)"
          :r="CONNECTION_DOT_RADIUS"
          :fill="COLORS.connectionFill"
          class="connection-point output"
          :data-component-id="id"
          :data-port="index"
          data-type="output"
        />
      </template>

      <!-- Component label (centered) -->
      <text
        v-if="label"
        :x="width * GRID_SIZE / 2"
        :y="height * GRID_SIZE / 2"
        text-anchor="middle"
        dominant-baseline="middle"
        class="component-label"
        font-size="12"
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
  name: 'Decoder',
  props: {
    ...draggableProps,
    // Decoder props
    numOutputs: {
      type: Number,
      default: 4,
      validator: (value: number) => value >= 2 && value <= 16
    },
    label: {
      type: String,
      default: 'DEC'
    },
    rotation: {
      type: Number,
      default: 0
    }
  },
  emits: ['startDrag'],
  setup(props, { emit }) {
    const { handleMouseDown, fillColor, strokeColor, strokeWidth, componentClasses } = useComponentView(props, emit)

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
  },
  computed: {
    // Decoder is 4 grid units wide for better proportions, height based on number of outputs
    width() {
      return 4
    },
    height() {
      // Height = (numOutputs - 1) * 2 + 2 for proper spacing with grid alignment
      const outputSpacing = 2 // 2 grid units between outputs
      const baseHeight = (this.numOutputs - 1) * outputSpacing
      return Math.max(baseHeight + 2, 4) // Ensure minimum height of 4 grid units
    },
    // Selector input position (top center, on grid vertex)
    selInputX() {
      return GRID_SIZE * 2 // Center of 4-unit wide component
    },
    selInputY() {
      return 0 // Top edge
    }
  },
  methods: {
    getOutputY(index: number) {
      // Place outputs on grid vertices with 2 grid unit spacing
      const firstOutputY = GRID_SIZE // First output at 1 grid unit from top
      const outputSpacing = GRID_SIZE * 2 // 2 grid units between outputs
      return firstOutputY + index * outputSpacing
    }
  }
})
</script>

<style scoped>
@import '../styles/components.css';

.port-label {
  font-family: monospace;
  font-weight: bold;
  fill: var(--component-text-color, #000);
  pointer-events: none;
}

.component-label {
  font-family: monospace;
  font-weight: bold;
  fill: var(--component-text-color, #000);
  pointer-events: none;
}
</style>