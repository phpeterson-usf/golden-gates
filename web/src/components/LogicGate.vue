<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- Vertical extension line for additional inputs -->
    <line
      v-if="numInputs > 2"
      x1="0"
      y1="0"
      x2="0"
      :y2="totalHeight"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      class="component-body"
    />
    
    <!-- Gate shape - MIL-STD-806B style -->
    <g :transform="gateTransform">
      <path
        :d="gatePath"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        class="component-body"
        @mousedown="handleMouseDown"
      />
    </g>
    
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
      :cy="outputY" 
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
      :y="outputY + 5" 
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
    totalHeight() {
      // Total height needed to accommodate all inputs with alternating grid vertices
      return (this.numInputs - 1) * GRID_SIZE * 2
    },
    gateHeight() {
      // All gates use fixed height of two grid units (30px)
      // This allows the output to be at the grid vertex between two inputs
      return GRID_SIZE * 2
    },
    gateTransform() {
      // For gates with more than 2 inputs, position the fixed-size gate at the vertical center
      if (this.numInputs > 2) {
        const centerY = this.totalHeight / 2 - GRID_SIZE
        return `translate(0, ${centerY})`
      }
      return ''
    },
    gatePath() {
      // Dynamic SVG path based on gate height
      const h = this.gateHeight
      const padding = 10  // Reduced padding for smaller grid
      
      if (this.gateDefinition.getSvgPath) {
        return this.gateDefinition.getSvgPath(h, padding)
      }
      
      // Fallback to a simple rectangle if no path defined
      return `M 0 ${-padding} L 60 ${-padding} L 60 ${h + padding} L 0 ${h + padding} Z`
    },
    outputX() {
      // All gates output at 3 grid units (60px)
      // Account for gates with output bubbles (NAND, NOR)
      return GRID_SIZE * 3 - (this.gateDefinition.outputOffset || 0)
    },
    outputY() {
      // For 2 inputs, output is at the grid vertex between them
      // For more inputs, output moves with the centered gate
      if (this.numInputs === 2) {
        return GRID_SIZE  // Between inputs at 0 and GRID_SIZE*2
      } else {
        // Gate is centered, so output is at center of total height
        return this.totalHeight / 2
      }
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
      // Inputs are on alternating grid vertices (0, 30, 60, 90...)
      return index * GRID_SIZE * 2
    }
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>