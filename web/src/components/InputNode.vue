<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- Value display (above the square, centered on component) -->
    <text 
      :x="(gridSize - 5) / 2" 
      y="-15" 
      text-anchor="middle" 
      class="component-value"
    >
      {{ formattedValue }}
    </text>
    
    <!-- Label -->
    <text 
      x="-10" 
      y="5" 
      text-anchor="end" 
      font-size="14" 
      class="component-label"
    >
      {{ label }}
    </text>
    
    <!-- Input square (larger by 5px, offset left so output point is on right edge) -->
    <rect
      x="-5"
      :y="-(gridSize + 5) / 2"
      :width="gridSize + 5"
      :height="gridSize + 5"
      :fill="fillColor"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      class="component-body"
      @mousedown="handleMouseDown"
    />
    
    <!-- Output connection point (right side, centered - on grid vertex) -->
    <circle 
      :cx="gridSize" 
      cy="0" 
      :r="CONNECTION_DOT_RADIUS" 
      :fill="COLORS.connectionFill" 
      class="connection-point output"
      :data-component-id="id"
      data-port="0"
      data-type="output"
    />
  </g>
</template>

<script>
import { useDraggable, draggableProps } from '../composables/useDraggable'
import { COLORS, CONNECTION_DOT_RADIUS } from '../utils/constants'

export default {
  name: 'InputNode',
  computed: {
    formattedValue() {
      if (this.base === 16) {
        return '0x' + this.value.toString(16)
      } else if (this.base === 2) {
        return '0b' + this.value.toString(2)
      } else {
        return this.value.toString(10)
      }
    }
  },
  props: {
    ...draggableProps,
    label: {
      type: String,
      default: 'IN'
    },
    value: {
      type: Number,
      default: 0
    },
    base: {
      type: Number,
      default: 10
    },
    bits: {
      type: Number,
      default: 1
    },
    gridSize: {
      type: Number,
      default: 30
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
  methods: {
    generate() {
      // Use label as variable name if it exists and is valid
      let varName
      if (this.label && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.label)) {
        // Label is a valid Python identifier
        varName = this.label.toLowerCase()
      } else {
        // Fall back to numbered variable name
        const match = this.id.match(/input_(\d+)/)
        const index = match ? match[1] : '0'
        varName = `input${index}`
      }
      
      // Format value based on base
      let valueStr
      if (this.base === 16) {
        valueStr = '0x' + this.value.toString(16)
      } else if (this.base === 2) {
        valueStr = '0b' + this.value.toString(2)
      } else {
        valueStr = this.value.toString(10)
      }
      
      // Generate GGL code for this input
      const lines = [
        `${varName} = io.Input(bits=${this.bits}, label="${this.label}")`,
        `${varName}.value = ${valueStr}`
      ]
      
      return {
        varName,
        code: lines.join('\n')
      }
    }
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>