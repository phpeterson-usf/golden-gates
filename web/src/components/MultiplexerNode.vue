<template>
  <g :transform="`translate(${x * GRID_SIZE}, ${y * GRID_SIZE})`">
    <!-- Rotation group centered on output point -->
    <g :transform="`rotate(${rotation}, ${outputX}, ${outputY})`">
      <!-- Multiplexer body with slanted lines -->
      <path
        :d="multiplexerPath"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        class="component-body"
        @mousedown="handleMouseDown"
      />

      <!-- Input connection points -->
      <circle
        v-for="(_, index) in numInputs"
        :key="`input-${index}`"
        :cx="0"
        :cy="getInputY(index)"
        :r="CONNECTION_DOT_RADIUS"
        :fill="COLORS.connectionFill"
        class="connection-point input"
        :data-component-id="id"
        :data-port="index"
        data-type="input"
      />

      <!-- Selector connection point -->
      <circle
        :cx="selectorX"
        :cy="selectorY"
        :r="CONNECTION_DOT_RADIUS"
        :fill="COLORS.connectionFill"
        class="connection-point input"
        :data-component-id="id"
        :data-port="numInputs"
        data-type="input"
      />

      <!-- Output connection point -->
      <circle
        :cx="outputX"
        :cy="outputY"
        :r="CONNECTION_DOT_RADIUS"
        :fill="COLORS.connectionFill"
        class="connection-point output"
        :data-component-id="id"
        data-port="0"
        data-type="output"
      />

      <!-- Label (centered within the multiplexer) -->
      <text
        v-if="label"
        :x="GRID_SIZE"
        :y="outputY"
        text-anchor="middle"
        dominant-baseline="middle"
        class="component-label"
      >
        {{ label }}
      </text>

      <!-- Input 0 label -->
      <text x="8" :y="getInputY(0) + 4" text-anchor="middle" font-size="10" class="component-label">
        0
      </text>
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useComponentView, draggableProps } from '../composables/useComponentView'
import { COLORS, CONNECTION_DOT_RADIUS, GRID_SIZE } from '../utils/constants'

export default defineComponent({
  name: 'MultiplexerNode',
  props: {
    ...draggableProps,
    // Multiplexer props
    numInputs: {
      type: Number,
      default: 4,
      validator: (value: number) => value >= 2 && value <= 8
    },
    bits: {
      type: Number,
      default: 1,
      validator: (value: number) => value >= 1 && value <= 32
    },
    label: {
      type: String,
      default: ''
    },
    selectorPosition: {
      type: String,
      default: 'bottom',
      validator: (value: string) => ['top', 'bottom'].includes(value)
    },
    rotation: {
      type: Number,
      default: 0
    }
  },
  emits: ['startDrag'],
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
  },
  computed: {
    // Total height to accommodate all inputs on grid vertices
    totalHeight() {
      // Ensure inputs are spaced 2 grid units apart (like logic gates)
      // Height = (numInputs - 1) * 2 * GRID_SIZE + extra space for margins
      const inputSpacing = 2 * GRID_SIZE // 2 grid units between inputs
      const baseHeight = (this.numInputs - 1) * inputSpacing
      const minHeight = 4 * GRID_SIZE // Minimum height
      return Math.max(baseHeight + 2 * GRID_SIZE, minHeight) // Add 1 grid unit margin top/bottom
    },
    // Multiplexer is 2 grid units wide
    width() {
      return GRID_SIZE * 2
    },
    // SVG path for the multiplexer shape with slanted lines
    multiplexerPath() {
      const w = this.width
      const h = this.totalHeight
      const slant = GRID_SIZE / 2 // How much the top and bottom lines slant inward

      // Proper multiplexer shape: vertical sides, diagonal top and bottom edges
      return `
        M 0 0
        L ${w} ${slant}
        L ${w} ${h - slant}
        L 0 ${h}
        Z
      `
    },
    outputX() {
      return this.width
    },
    outputY() {
      return this.totalHeight / 2
    },
    selectorX() {
      return this.width / 2
    },
    selectorY() {
      return this.selectorPosition === 'top' ? 0 : this.totalHeight
    }
  },
  methods: {
    getInputY(index) {
      // Place inputs on grid vertices with 2 grid unit spacing
      const margin = GRID_SIZE // 1 grid unit margin from top
      const inputSpacing = 2 * GRID_SIZE // 2 grid units between inputs
      return margin + index * inputSpacing
    }
  }
})
</script>

<style scoped>
@import '../styles/components.css';
</style>
