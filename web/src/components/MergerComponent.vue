<template>
  <g class="merger-component" :transform="`translate(${x}, ${y}) rotate(${rotation})`">
    <!-- Merger body (vertical line with thick stroke) -->
    <line 
      :x1="gridSize" 
      :y1="0" 
      :x2="gridSize" 
      :y2="height" 
      :class="['merger-body', { 'selected': selected }]"
      :stroke-width="8"
      :data-component-id="id"
      @mousedown="handleMouseDown"
    />
    
    <!-- Output connection line -->
    <line 
      :x1="gridSize" 
      :y1="outputY" 
      :x2="2 * gridSize" 
      :y2="outputY" 
      class="connector-line"
    />
    
    <!-- Output bits label positioned to the right and above the output point -->
    <text 
      :x="2 * gridSize + 8" 
      :y="outputY - 3" 
      class="range-label"
      text-anchor="start"
    >
      {{ outputBits }}
    </text>
    
    <!-- Input connection lines with labels -->
    <g v-for="(input, index) in inputs" :key="index">
      <line 
        x1="0" 
        :y1="input.y" 
        :x2="gridSize" 
        :y2="input.y" 
        class="connector-line"
      />
      <!-- Range label positioned to the left of the connection point -->
      <text 
        :x="-8" 
        :y="input.y - 3" 
        class="range-label"
        text-anchor="end"
      >
        {{ getRangeLabel(index) }}
      </text>
    </g>
    
    <!-- Connection points -->
    <circle 
      :cx="2 * gridSize" 
      :cy="outputY" 
      :r="CONNECTION_DOT_RADIUS" 
      class="connection-point output-point"
      :data-component-id="id"
      :data-port="0"
      data-type="output"
    />
    
    <circle 
      v-for="(input, index) in inputs" 
      :key="`input-${index}`"
      cx="0" 
      :cy="input.y" 
      :r="CONNECTION_DOT_RADIUS" 
      class="connection-point input-point"
      :data-component-id="id"
      :data-port="index"
      data-type="input"
    />
  </g>
</template>

<script setup>
import { computed } from 'vue'
import { componentRegistry } from '../utils/componentRegistry'
import { useDraggable } from '../composables/useDraggable'
import { CONNECTION_DOT_RADIUS } from '../utils/constants'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  selected: {
    type: Boolean,
    default: false
  },
  rotation: {
    type: Number,
    default: 0
  },
  outputBits: {
    type: Number,
    default: 8
  },
  ranges: {
    type: Array,
    default: () => [
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
      { start: 6, end: 7 }
    ]
  },
  gridSize: {
    type: Number,
    default: 15
  }
})

const emit = defineEmits(['startDrag'])

// Use the draggable composable for selection and dragging
const { handleMouseDown, fillColor, strokeColor, strokeWidth } = useDraggable(props, emit)

// Get dynamic connections
const connections = computed(() => {
  const config = componentRegistry['merger']
  return config.getConnections(props)
})

// Get dynamic dimensions
const dimensions = computed(() => {
  const config = componentRegistry['merger']
  return config.getDimensions(props)
})

const height = computed(() => dimensions.value.height)
const outputY = computed(() => connections.value.outputs[0].y)
const inputs = computed(() => connections.value.inputs)

// Get range label for display
function getRangeLabel(index) {
  const range = props.ranges[index]
  if (!range) return ''
  
  if (range.start === range.end) {
    return range.start.toString()
  } else {
    return `${range.start}-${range.end}`
  }
}
</script>

<style scoped>
.merger-component {
  pointer-events: all;
}
</style>