import { ref, onMounted, onUnmounted } from 'vue'
import { GRID_SIZE } from '../utils/constants'

export function useCanvasViewport() {
  // Canvas dimensions
  const canvasWidth = ref(800)
  const canvasHeight = ref(600)
  
  // Grid settings
  const gridSize = ref(GRID_SIZE)
  
  // Zoom settings
  const zoom = ref(1)
  const minZoom = ref(0.5)
  const maxZoom = ref(2)
  const zoomStep = ref(0.25)

  // Resize canvas to fit container
  function resizeCanvas(containerRef) {
    if (!containerRef) return
    
    const container = containerRef
    if (container) {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      
      // Only update if dimensions actually changed
      if (newWidth !== canvasWidth.value || newHeight !== canvasHeight.value) {
        canvasWidth.value = newWidth
        canvasHeight.value = newHeight
      }
    }
  }

  // Zoom in
  function zoomIn() {
    if (zoom.value < maxZoom.value) {
      zoom.value = Math.min(zoom.value + zoomStep.value, maxZoom.value)
    }
  }

  // Zoom out
  function zoomOut() {
    if (zoom.value > minZoom.value) {
      zoom.value = Math.max(zoom.value - zoomStep.value, minZoom.value)
    }
  }

  // Reset zoom
  function resetZoom() {
    zoom.value = 1
  }

  // Snap position to grid
  function snapToGrid(pos) {
    return {
      x: Math.round(pos.x / gridSize.value) * gridSize.value,
      y: Math.round(pos.y / gridSize.value) * gridSize.value
    }
  }

  // Get mouse position in canvas coordinates
  function getMousePos(event) {
    // Find the SVG element - it might be the currentTarget or we need to traverse up
    let svg = event.currentTarget
    while (svg && svg.tagName !== 'svg') {
      svg = svg.parentElement
    }
    
    if (!svg || !svg.createSVGPoint) {
      // Fallback: find the nearest SVG element
      svg = event.target.closest('svg')
    }
    
    if (!svg || !svg.createSVGPoint) {
      console.error('Could not find SVG element')
      return { x: 0, y: 0 }
    }
    
    const pt = svg.createSVGPoint()
    pt.x = event.clientX
    pt.y = event.clientY
    
    // Transform to SVG coordinates and account for zoom
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
    return {
      x: svgP.x / zoom.value,
      y: svgP.y / zoom.value
    }
  }

  // Set up resize observer
  function setupResizeObserver(containerRef) {
    let resizeObserver = null
    
    onMounted(() => {
      // Initial resize
      resizeCanvas(containerRef.value)
      
      // Set up resize observer
      if (window.ResizeObserver && containerRef.value) {
        resizeObserver = new ResizeObserver(() => {
          resizeCanvas(containerRef.value)
        })
        resizeObserver.observe(containerRef.value)
      }
      
      // Fallback to window resize
      window.addEventListener('resize', () => resizeCanvas(containerRef.value))
    })
    
    onUnmounted(() => {
      if (resizeObserver && containerRef.value) {
        resizeObserver.unobserve(containerRef.value)
      }
      window.removeEventListener('resize', () => resizeCanvas(containerRef.value))
    })
  }

  return {
    // State
    canvasWidth,
    canvasHeight,
    gridSize,
    zoom,
    minZoom,
    maxZoom,
    zoomStep,
    
    // Methods
    resizeCanvas,
    zoomIn,
    zoomOut,
    resetZoom,
    snapToGrid,
    getMousePos,
    setupResizeObserver
  }
}