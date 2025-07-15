import { computed } from 'vue'
import { COLORS, STROKE_WIDTHS } from '../utils/constants'

export function useComponentView(props, emit) {
  // Handle mouse down for dragging
  const handleMouseDown = (event) => {
    // Get the actual position where the user clicked relative to the SVG
    const svg = event.target.closest('svg')
    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    
    // Transform to SVG coordinates
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    
    // Get zoom from the transform group if it exists
    const transformGroup = svg.querySelector('g[transform]')
    let zoom = 1
    if (transformGroup) {
      const transform = transformGroup.getAttribute('transform')
      const scaleMatch = transform.match(/scale\(([\d.]+)\)/)
      if (scaleMatch) {
        zoom = parseFloat(scaleMatch[1])
      }
    }
    
    // Calculate offset from the component's position, accounting for zoom
    emit('startDrag', {
      id: props.id,
      offsetX: svgP.x / zoom - props.x,
      offsetY: svgP.y / zoom - props.y,
      event: event
    })
  }

  // Computed styles for selection state
  const fillColor = computed(() => 
    props.selected ? COLORS.componentSelectedFill : COLORS.componentFill
  )
  
  const strokeColor = computed(() => 
    props.selected ? COLORS.componentSelectedStroke : COLORS.componentStroke
  )
  
  const strokeWidth = computed(() => 
    props.selected ? STROKE_WIDTHS.selected : STROKE_WIDTHS.normal
  )

  return {
    handleMouseDown,
    fillColor,
    strokeColor,
    strokeWidth
  }
}

// Common props for draggable components
export const draggableProps = {
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  id: {
    type: String,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
}