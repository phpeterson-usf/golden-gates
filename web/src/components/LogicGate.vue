<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- Rotation group centered on output point -->
    <g :transform="`rotate(${rotation}, ${outputX}, ${outputY})`">
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
    
    <!-- Inversion circles for inverted inputs -->
    <circle 
      v-for="(input, index) in numInputs"
      :key="`inversion-${index}`"
      v-show="isInputInverted(index)"
      :cx="getInversionCircleX()" 
      :cy="getInputY(index)" 
      :r="5" 
      :fill="COLORS.canvasBackground" 
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      class="inversion-circle"
    />
    
    <!-- Input connection points -->
    <circle 
      v-for="(input, index) in numInputs"
      :key="`input-${index}`"
      :cx="getInputConnectionX(index)" 
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
    
    <!-- Label (centered within the gate) -->
    <text 
      v-if="label"
      :x="labelX" 
      :y="outputY" 
      text-anchor="middle" 
      dominant-baseline="middle"
      class="component-label"
    >
      {{ label }}
    </text>
    </g>
  </g>
</template>

<script>
import { useComponentView, draggableProps } from '../composables/useComponentView'
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
      validator: (value) => value >= 1 && value <= 8  // Allow 1 input for NOT gate
    },
    bits: {
      type: Number,
      default: 1,
      validator: (value) => value >= 1 && value <= 32
    },
    label: {
      type: String,
      default: ''
    },
    rotation: {
      type: Number,
      default: 0,
      validator: (value) => [0, 90, 180, 270].includes(value)
    },
    invertedInputs: {
      type: Array,
      default: () => []
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
      CONNECTION_DOT_RADIUS
    }
  },
  computed: {
    gateDefinition() {
      return getGateDefinition(this.gateType) || {}
    },
    totalHeight() {
      // For single input (NOT gate), use standard height
      if (this.numInputs === 1) {
        return GRID_SIZE * 2  // Standard 30px height
      }
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
      // No transformation needed for 1 or 2 input gates
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
      // For 1 input (NOT gate), output is centered
      if (this.numInputs === 1) {
        return GRID_SIZE  // Center at 15px
      }
      // For 2 inputs, output is at the grid vertex between them
      else if (this.numInputs === 2) {
        return GRID_SIZE  // Between inputs at 0 and GRID_SIZE*2
      } else {
        // Gate is centered, so output is at center of total height
        return this.totalHeight / 2
      }
    },
    labelX() {
      // Calculate horizontal center of each gate type
      if (this.gateType === 'and') {
        // AND gate extends to 45px (3 grid units)
        return GRID_SIZE * 1.5  // 22.5px
      } else if (this.gateType === 'or') {
        // OR gate extends to 60px (4 grid units)
        return GRID_SIZE * 2  // 30px
      } else if (this.gateType === 'xor' || this.gateType === 'xnor') {
        // XOR/XNOR gate extends to 75px (5 grid units)
        return GRID_SIZE * 2.5  // 37.5px
      } else if (this.gateType === 'not') {
        // NOT gate triangle center
        return GRID_SIZE  // 15px (center of triangle)
      } else {
        // Default for other gate types
        return GRID_SIZE * 1.5
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
        label: this.label,
        invertedInputs: this.invertedInputs
      })
      
      return {
        varName,
        code
      }
    },
    getInputY(index) {
      // Check if gate definition has custom input positions
      const definition = getGateDefinition(this.gateType)
      if (definition && definition.getInputPositions) {
        const positions = definition.getInputPositions(this.numInputs)
        return positions[index]?.y || (index * GRID_SIZE * 2)
      }
      
      // For single input gates (like NOT), center the input vertically
      if (this.numInputs === 1) {
        return this.totalHeight / 2
      }
      
      // Default: Calculate Y position for each input
      // Inputs are on alternating grid vertices (0, 30, 60, 90...)
      return index * GRID_SIZE * 2
    },
    isInputInverted(index) {
      return this.invertedInputs.includes(index)
    },
    getInversionCircleX() {
      // Inversion circle positioned 7px from the left edge of the gate
      return -7
    },
    getInputConnectionX(index) {
      // Check if gate definition has custom input positions
      const definition = getGateDefinition(this.gateType)
      if (definition && definition.getInputPositions) {
        const positions = definition.getInputPositions(this.numInputs)
        const baseX = positions[index]?.x || 0
        // For inverted inputs, shift further left for the inversion circle
        return this.isInputInverted(index) ? baseX - 15 : baseX
      }
      
      // Default: For inverted inputs, connection point is at the left edge of the inversion circle
      // For normal inputs, connection point is at x=0 (left edge of gate)
      return this.isInputInverted(index) ? -15 : 0
    }
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>