<template>
  <g @click="handleClick" @mousedown="handleMouseDown">
    <!-- Invisible wider line for easier clicking -->
    <polyline
      v-if="!preview"
      :points="pointsString"
      fill="none"
      stroke="transparent"
      :stroke-width="strokeWidth + 8"
      stroke-linejoin="round"
      stroke-linecap="round"
      class="wire-hitbox"
    />
    <!-- Visible wire -->
    <polyline
      :points="pointsString"
      fill="none"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
      stroke-linecap="round"
      class="wire"
      :class="{ preview: preview, selected: selected }"
    />
  </g>
</template>

<script>
import { computed } from 'vue'
import { COLORS, STROKE_WIDTHS } from '../utils/constants'

export default {
  name: 'Wire',
  props: {
    points: {
      type: Array,
      required: true
    },
    preview: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'mousedown'],
  setup(props, { emit }) {
    const pointsString = computed(() => {
      return props.points.map(p => `${p.x},${p.y}`).join(' ')
    })
    
    const strokeColor = computed(() => {
      if (props.preview) return COLORS.wirePreview
      return props.selected ? COLORS.wireSelected : COLORS.wire
    })
    
    const strokeWidth = computed(() => {
      return props.selected ? STROKE_WIDTHS.wireSelected : STROKE_WIDTHS.wire
    })
    
    const handleClick = (event) => {
      if (!props.preview) {
        emit('click', event)
      }
    }
    
    const handleMouseDown = (event) => {
      if (!props.preview) {
        emit('mousedown', event)
      }
    }
    
    return {
      pointsString,
      strokeColor,
      strokeWidth,
      handleClick,
      handleMouseDown
    }
  }
}
</script>

<style scoped>
.wire {
  pointer-events: stroke;
  cursor: pointer;
}

.wire.preview {
  opacity: 0.6;
  stroke-dasharray: 5, 5;
  cursor: crosshair;
}

.wire.selected {
  filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.5));
}

.wire-hitbox {
  pointer-events: stroke;
  cursor: pointer;
}
</style>