import { ref, computed } from 'vue'
import { componentRegistry } from '../utils/componentRegistry'

export function useWireManagement(components, gridSize) {
  // Wire state
  const wires = ref([])
  const selectedWires = ref(new Set())
  const drawingWire = ref(false)
  const wirePoints = ref([])
  const wireDirection = ref('horizontal') // 'horizontal' or 'vertical'
  const startConnection = ref(null)
  const currentMousePos = ref(null)

  // Start drawing a wire from a connection point
  function startWireDrawing(componentId, portIndex, portType, mousePos) {
    const component = components.value.find(c => c.id === componentId)
    if (!component) return
    
    // Get the component configuration
    const config = componentRegistry[component.type]
    if (!config) return
    
    // Get the connection point position relative to component
    let connections
    if (config.getConnections) {
      // Use dynamic connections if available
      const dynamicConnections = config.getConnections(component.props)
      connections = portType === 'output' ? dynamicConnections.outputs : dynamicConnections.inputs
    } else {
      // Use static connections
      connections = portType === 'output' ? config.connections.outputs : config.connections.inputs
    }
    const connectionPoint = connections?.[portIndex]
    if (!connectionPoint) return
    
    // Calculate the actual connection point position
    const connectionPos = {
      x: component.x + connectionPoint.x,
      y: component.y + connectionPoint.y
    }

    // Store the starting connection info
    startConnection.value = {
      componentId,
      portIndex,
      portType,
      pos: connectionPos
    }

    // Initialize wire drawing from the actual connection point
    drawingWire.value = true
    wirePoints.value = [connectionPos]
    
    // Determine initial direction based on port type
    wireDirection.value = portType === 'output' ? 'horizontal' : 'horizontal'
  }

  // Add a waypoint to the wire being drawn
  function addWireWaypoint(mousePos) {
    if (!drawingWire.value) return
    
    // Snap the waypoint to the grid
    const snappedPos = {
      x: Math.round(mousePos.x / gridSize) * gridSize,
      y: Math.round(mousePos.y / gridSize) * gridSize
    }
    
    wirePoints.value.push(snappedPos)
    
    // Toggle direction for next segment
    wireDirection.value = wireDirection.value === 'horizontal' ? 'vertical' : 'horizontal'
  }

  // Complete wire drawing
  function completeWire(componentId, portIndex, portType) {
    if (!drawingWire.value || !startConnection.value) return
    
    // Check if this is a valid connection
    if (startConnection.value.portType === portType) {
      // Can't connect same port types
      cancelWireDrawing()
      return
    }
    
    // Get the end component and connection point
    const component = components.value.find(c => c.id === componentId)
    if (!component) return
    
    const config = componentRegistry[component.type]
    if (!config) return
    
    // Get the connection point position
    let connections
    if (config.getConnections) {
      // Use dynamic connections if available
      const dynamicConnections = config.getConnections(component.props)
      connections = portType === 'output' ? dynamicConnections.outputs : dynamicConnections.inputs
    } else {
      // Use static connections
      connections = portType === 'output' ? config.connections.outputs : config.connections.inputs
    }
    const connectionPoint = connections?.[portIndex]
    if (!connectionPoint) return
    
    // Calculate the actual connection point position
    const connectionPos = {
      x: component.x + connectionPoint.x,
      y: component.y + connectionPoint.y
    }
    
    // Ensure input/output are in correct order
    let inputConnection, outputConnection
    
    if (startConnection.value.portType === 'output') {
      outputConnection = startConnection.value
      inputConnection = {
        componentId,
        portIndex,
        portType,
        pos: connectionPos
      }
    } else {
      inputConnection = startConnection.value
      outputConnection = {
        componentId,
        portIndex,
        portType,
        pos: connectionPos
      }
    }
    
    // Add the final point at the actual connection position
    wirePoints.value.push(connectionPos)
    
    // Get the final points array
    let finalPoints = [...wirePoints.value]
    
    // If we started from an input port, reverse the points to match logical flow
    // (from output to input)
    if (startConnection.value.portType === 'input') {
      finalPoints = finalPoints.reverse()
    }
    
    // Create the wire with points in the correct logical direction
    const wire = {
      id: `wire_${Date.now()}`,
      points: finalPoints,
      startConnection: outputConnection,  // Always the output (source)
      endConnection: inputConnection      // Always the input (destination)
    }
    
    wires.value.push(wire)
    
    // Reset wire drawing state
    cancelWireDrawing()
  }

  // Cancel wire drawing
  function cancelWireDrawing() {
    drawingWire.value = false
    wirePoints.value = []
    startConnection.value = null
  }

  // Add a point to the wire being drawn
  function addPointToWire(pos) {
    if (!drawingWire.value) return
    wirePoints.value.push(pos)
  }

  // Get preview points for wire being drawn
  function getPreviewPoint(mousePos) {
    if (wirePoints.value.length === 0) return []
    
    const lastPoint = wirePoints.value[wirePoints.value.length - 1]
    const previewPoints = []
    
    // Snap to grid
    const snappedPos = {
      x: Math.round(mousePos.x / gridSize) * gridSize,
      y: Math.round(mousePos.y / gridSize) * gridSize
    }
    
    // Create orthogonal path based on current direction
    if (wireDirection.value === 'horizontal') {
      // Horizontal first
      if (snappedPos.x !== lastPoint.x) {
        previewPoints.push({ x: snappedPos.x, y: lastPoint.y })
      }
      if (snappedPos.x !== lastPoint.x || snappedPos.y !== lastPoint.y) {
        previewPoints.push(snappedPos)
      }
    } else {
      // Vertical first
      if (snappedPos.y !== lastPoint.y) {
        previewPoints.push({ x: lastPoint.x, y: snappedPos.y })
      }
      if (snappedPos.x !== lastPoint.x || snappedPos.y !== lastPoint.y) {
        previewPoints.push(snappedPos)
      }
    }
    
    return previewPoints
  }

  // Select/deselect a wire
  function selectWire(index, isMultiSelect = false) {
    if (!isMultiSelect) {
      selectedWires.value.clear()
    }
    
    if (selectedWires.value.has(index)) {
      selectedWires.value.delete(index)
    } else {
      selectedWires.value.add(index)
    }
  }

  // Delete selected wires
  function deleteSelectedWires() {
    // Sort indices in reverse order to avoid index shifting issues
    const indicesToDelete = Array.from(selectedWires.value).sort((a, b) => b - a)
    
    indicesToDelete.forEach(index => {
      wires.value.splice(index, 1)
    })
    
    selectedWires.value.clear()
  }

  // Update wire endpoints when components move
  function updateWireEndpoints(componentId, deltaX, deltaY) {
    wires.value.forEach(wire => {
      // Update start connection if it matches
      if (wire.startConnection.componentId === componentId) {
        wire.startConnection.pos.x += deltaX
        wire.startConnection.pos.y += deltaY
        if (wire.points.length > 0) {
          wire.points[0].x += deltaX
          wire.points[0].y += deltaY
        }
      }
      
      // Update end connection if it matches
      if (wire.endConnection.componentId === componentId) {
        wire.endConnection.pos.x += deltaX
        wire.endConnection.pos.y += deltaY
        if (wire.points.length > 0) {
          wire.points[wire.points.length - 1].x += deltaX
          wire.points[wire.points.length - 1].y += deltaY
        }
      }
    })
  }

  // Computed preview points for wire being drawn
  const previewPoints = computed(() => {
    if (!drawingWire.value || wirePoints.value.length === 0) return []
    
    const mousePos = currentMousePos.value || { x: 0, y: 0 }
    const preview = getPreviewPoint(mousePos)
    
    return [...wirePoints.value, ...preview]
  })

  return {
    // State
    wires,
    selectedWires,
    drawingWire,
    wirePoints,
    wireDirection,
    startConnection,
    currentMousePos,
    previewPoints,
    
    // Methods
    startWireDrawing,
    addWireWaypoint,
    completeWire,
    cancelWireDrawing,
    addPointToWire,
    selectWire,
    deleteSelectedWires,
    updateWireEndpoints
  }
}