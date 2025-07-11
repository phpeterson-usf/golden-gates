<template>
  <g :transform="`translate(${x}, ${y})`">
    <!-- Rotation group centered on input point -->
    <g :transform="`rotate(${rotation}, 0, 0)`">
    <!-- Value display (above the circle, centered on component) -->
    <text 
      :x="(gridSize + 5) / 2" 
      y="-15" 
      text-anchor="middle" 
      class="component-value"
    >
      {{ formattedValue }}
    </text>
    
    <!-- Output circle (larger by 5px diameter, offset right so input point is on left edge) -->
    <circle
      :cx="(gridSize + 5) / 2"
      cy="0"
      :r="(gridSize + 5) / 2"
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
      :x="gridSize + 10" 
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

<script>
import { useDraggable, draggableProps } from '../composables/useDraggable'
import { COLORS, CONNECTION_DOT_RADIUS } from '../utils/constants'

export default {
  name: 'OutputNode',
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
      default: 'OUT'
    },
    value: {
      type: Number,
      default: 0
    },
    bits: {
      type: Number,
      default: 1
    },
    base: {
      type: Number,
      default: 10
    },
    gridSize: {
      type: Number,
      default: 30
    },
    rotation: {
      type: Number,
      default: 0,
      validator: (value) => [0, 90, 180, 270].includes(value)
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
      let varName
      const match = this.id.match(/output_(\d+)/)
      const index = match ? match[1] : '0'
      varName = `output${index}`
      
      // Generate GGL code for this output with js_id
      return {
        varName,
        code: `${varName} = io.Output(bits=${this.bits}, label="${this.label}", js_id="${this.id}")`
      }
    }
  }
}
</script>

<style scoped>
@import '../styles/components.css';
</style>