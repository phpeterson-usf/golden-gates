<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- Gate shape - MIL-STD-806B style -->
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
      :cx="outputX" 
      :cy="gateHeight / 2" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point output"
      :data-component-id="id"
      data-port="0"
      data-type="output"
    />
    
    <!-- Label -->
    <text 
      v-if="label"
      x="45" 
      :y="gateHeight / 2 + 5" 
      text-anchor="middle" 
      class="component-label"
    >
      {{ label }}
    </text>
  </g>
</template>

<script>
import { useDraggable, draggableProps } from '../composables/useDraggable'
import { COLORS, CONNECTION_DOT_RADIUS, GRID_SIZE } from '../utils/constants'
import { getGateDefinition, generateGateCode } from '../config/gateDefinitions'

export default {
  name: 'LogicGate',
  props: {
    ...draggableProps,
    gateType: {
      type: String,
      required: true,
      validator: (value) => getGateDefinition(value) !== null
    },
    numInputs: {
      type: Number,
      default: 2,
      validator: (value) => value >= 2 && value <= 8
    },
    bits: {
      type: Number,
      default: 1,
      validator: (value) => value >= 1 && value <= 32
    },
    label: {
      type: String,
      default: ''
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
    gateDefinition() {
      return getGateDefinition(this.gateType) || {}
    },
    gateHeight() {
      // Calculate height based on number of inputs
      // Each input must be on a grid vertex (multiple of GRID_SIZE)
      return (this.numInputs - 1) * GRID_SIZE
    },
    gatePath() {
      // Dynamic SVG path based on gate height
      const h = this.gateHeight
      const padding = 15
      
      if (this.gateDefinition.getSvgPath) {
        return this.gateDefinition.getSvgPath(h, padding)
      }
      
      // Fallback to a simple rectangle if no path defined
      return `M 0 ${-padding} L 90 ${-padding} L 90 ${h + padding} L 0 ${h + padding} Z`
    },
    outputX() {
      // Account for gates with output bubbles (NAND, NOR)
      return 90 - (this.gateDefinition.outputOffset || 0)
    }
  },
  methods: {
    generate() {
      // Extract the number from the component ID (e.g., "and-gate_1" -> 1)
      const match = this.id.match(new RegExp(`${this.gateType}-gate_(\\d+)`))
      const index = match ? match[1] : '0'
      const varName = `${this.gateType}${index}`
      
      // Use the centralized code generation
      const code = generateGateCode(this.gateType, varName, {
        numInputs: this.numInputs,
        bits: this.bits,
        label: this.label
      })
      
      return {
        varName,
        code
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