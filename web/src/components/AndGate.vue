<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- AND gate shape - MIL-STD-806B style -->
    <!-- Rectangle left half + semicircle right half -->
    <!-- Rectangle extends to x=60, semicircle radius is 30, so tip is at x=90 -->
    <path
      :d="gatePath"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      class="component-body"
      @mousedown="handleMouseDown"
    />
    
    <!-- Input connection points -->
    <circle 
      v-for="(input, index) in numInputs"
      :key="`input-${index}`"
      cx="0" 
      :cy="getInputY(index)" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point input"
      :data-component-id="id"
      :data-port="index"
      data-type="input"
    />
    
    <!-- Output connection point -->
    <circle 
      cx="90" 
      :cy="gateHeight / 2" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point output"
      :data-component-id="id"
      data-port="0"
      data-type="output"
    />
    
    <!-- Label -->
    <text x="45" :y="gateHeight / 2 + 5" text-anchor="middle" class="component-label">
      &amp;
    </text>
  </g>
</template>

<script>
import { useDraggable, draggableProps } from '../composables/useDraggable'
import { COLORS, CONNECTION_DOT_RADIUS, GRID_SIZE } from '../utils/constants'

export default {
  name: 'AndGate',
  props: {
    ...draggableProps,
    numInputs: {
      type: Number,
      default: 2,
      validator: (value) => value >= 2 && value <= 8
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
  computed: {
    gateHeight() {
      // Calculate height based on number of inputs
      // Each input must be on a grid vertex (multiple of GRID_SIZE)
      return (this.numInputs - 1) * GRID_SIZE
    },
    gatePath() {
      // Dynamic SVG path based on gate height
      const h = this.gateHeight
      // Add padding above and below the input range
      const padding = 15
      return `M 0 ${-padding} L 60 ${-padding} A 30 30 0 0 1 60 ${h + padding} L 0 ${h + padding} L 0 ${-padding} Z`
    }
  },
  methods: {
    generate() {
      // Extract the number from the component ID (e.g., "and-gate_1" -> 1)
      const match = this.id.match(/and-gate_(\d+)/)
      const index = match ? match[1] : '0'
      const varName = `and${index}`
      
      // Generate GGL code for this AND gate with num_inputs parameter
      const numInputsParam = this.numInputs !== 2 ? `num_inputs=${this.numInputs}` : ''
      return {
        varName,
        code: `${varName} = logic.And(${numInputsParam})`
      }
    },
    getInputY(index) {
      // Calculate Y position for each input
      // Each input is on a grid vertex
      return index * GRID_SIZE
    }
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>