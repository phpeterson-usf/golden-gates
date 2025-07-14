<template>
  <g class="splitter-component" :transform="`translate(${x}, ${y}) rotate(${rotation})`">
    <!-- Splitter body (vertical line with thick stroke) -->
    <line 
      :x1="gridSize" 
      :y1="0" 
      :x2="gridSize" 
      :y2="height" 
      :class="['splitter-body', { 'selected': selected }]"
      :stroke-width="8"
      :data-component-id="id"
      @mousedown="handleMouseDown"
    />
    
    <!-- Input connection line -->
    <line 
      x1="0" 
      :y1="inputY" 
      :x2="gridSize" 
      :y2="inputY" 
      class="connector-line"
    />
    
    <!-- Input bits label positioned to the left and above the input point -->
    <text 
      :x="-8" 
      :y="inputY - 3" 
      class="range-label"
      text-anchor="end"
    >
      {{ inputBits }}
    </text>
    
    <!-- Output connection lines with labels -->
    <g v-for="(output, index) in outputs" :key="index">
      <line 
        :x1="gridSize" 
        :y1="output.y" 
        :x2="2 * gridSize" 
        :y2="output.y" 
        class="connector-line"
      />
      <!-- Range label positioned to the right of the connection point -->
      <text 
        :x="2 * gridSize + 8" 
        :y="output.y - 3" 
        class="range-label"
        text-anchor="start"
      >
        {{ getRangeLabel(index) }}
      </text>
    </g>
    
    <!-- Connection points -->
    <circle 
      cx="0" 
      :cy="inputY" 
      :r="CONNECTION_DOT_RADIUS" 
      class="connection-point input-point"
      :data-component-id="id"
      :data-port="0"
      data-type="input"
    />
    
    <circle 
      v-for="(output, index) in outputs" 
      :key="`output-${index}`"
      :cx="2 * gridSize" 
      :cy="output.y" 
      :r="CONNECTION_DOT_RADIUS" 
      class="connection-point output-point"
      :data-component-id="id"
      :data-port="index"
      data-type="output"
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
  inputBits: {
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
  const config = componentRegistry['splitter']
  return config.getConnections(props)
})

// Get dynamic dimensions
const dimensions = computed(() => {
  const config = componentRegistry['splitter']
  return config.getDimensions(props)
})

const height = computed(() => dimensions.value.height)
const inputY = computed(() => connections.value.inputs[0].y)
const outputs = computed(() => connections.value.outputs)

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
.splitter-component {
  pointer-events: all;
}

.splitter-body {
  stroke: var(--text-color);
  stroke-linecap: round;
  cursor: move;
}

.splitter-body.selected {
  stroke: #3b82f6;
}

.connector-line {
  stroke: var(--text-color);
  stroke-width: 2;
  pointer-events: none;
}

.connection-point {
  fill: black;
  pointer-events: all;
  cursor: crosshair;
}

.connection-point:hover {
  fill: #0066cc;
}

.range-label {
  font-size: 10px;
  font-weight: 500;
  fill: var(--text-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  pointer-events: none;
  user-select: none;
}
</style>