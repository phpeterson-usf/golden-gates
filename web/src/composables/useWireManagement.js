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
  const wireJunctions = ref([])  // Track all junction points

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
        portIndex,
        portType,
        pos: connectionPos
      }
    } else {
      inputConnection = startConnection.value
      outputConnection = {
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
    
    // If this was a junction connection, add the junction point
    if (startConnection.value.isJunction) {
      wireJunctions.value.push({
        pos: startConnection.value.junctionPos,
        sourceWireIndex: startConnection.value.sourceWireIndex,
        connectedWireId: wire.id
      })
    }
    
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

  // Find the closest grid vertex on a wire to a given point
  function findClosestGridPointOnWire(wireIndex, mousePos) {
    const wire = wires.value[wireIndex]
    if (!wire || wire.points.length < 2) return null
    
    let closestPoint = null
    let minDistance = Infinity
    
    // Check each segment of the wire
    for (let i = 0; i < wire.points.length - 1; i++) {
      const p1 = wire.points[i]
      const p2 = wire.points[i + 1]
      
      // Find grid points along this segment
      const isHorizontal = p1.y === p2.y
      const isVertical = p1.x === p2.x
      
      if (isHorizontal) {
        // Check grid vertices along horizontal segment
        const y = p1.y
        const minX = Math.min(p1.x, p2.x)
        const maxX = Math.max(p1.x, p2.x)
        
        // Round to nearest grid vertex
        const gridX = Math.round(mousePos.x / gridSize) * gridSize
        
        // Check if this grid point is on the segment
        if (gridX >= minX && gridX <= maxX) {
          const distance = Math.abs(mousePos.x - gridX) + Math.abs(mousePos.y - y)
          if (distance < minDistance) {
            minDistance = distance
            closestPoint = { x: gridX, y: y }
          }
        }
      } else if (isVertical) {
        // Check grid vertices along vertical segment
        const x = p1.x
        const minY = Math.min(p1.y, p2.y)
        const maxY = Math.max(p1.y, p2.y)
        
        // Round to nearest grid vertex
        const gridY = Math.round(mousePos.y / gridSize) * gridSize
        
        // Check if this grid point is on the segment
        if (gridY >= minY && gridY <= maxY) {
          const distance = Math.abs(mousePos.x - x) + Math.abs(mousePos.y - gridY)
          if (distance < minDistance) {
            minDistance = distance
            closestPoint = { x: x, y: gridY }
          }
        }
      }
    }
    
    // Only return if we found a point close enough (within one grid unit)
    return (closestPoint && minDistance <= gridSize) ? closestPoint : null
  }

  // Start drawing a wire from a junction on an existing wire
  function startWireFromJunction(wireIndex, junctionPos) {
    const wire = wires.value[wireIndex]
    if (!wire) return
    
    // Use the original wire's source as our source
    startConnection.value = {
      ...wire.startConnection,
      pos: junctionPos  // But start drawing from the junction position
    }
    
    // Initialize wire drawing from the junction point
    drawingWire.value = true
    wirePoints.value = [junctionPos]
    wireDirection.value = 'horizontal'
    
    // Store that this is a junction connection
    startConnection.value.isJunction = true
    startConnection.value.sourceWireIndex = wireIndex
    startConnection.value.junctionPos = junctionPos
  }

  // Complete a wire at a junction on an existing wire
  function completeWireAtJunction(wireIndex, junctionPos) {
    if (!drawingWire.value || !startConnection.value) return
    
    const targetWire = wires.value[wireIndex]
    if (!targetWire) return
    
    // Can't connect to the same wire we started from
    if (startConnection.value.sourceWireIndex === wireIndex) {
      cancelWireDrawing()
      return
    }
    
    // We need to determine if we started from an input or output
    if (startConnection.value.portType === 'input') {
      // Started from an input (like T), so we're connecting T to the wire's source
      // The wire should go FROM the target wire's source TO our input
      
      // Add the junction point as the final point
      wirePoints.value.push(junctionPos)
      
      // Create a wire from the target wire's source to our input
      const wire = {
        id: `wire_${Date.now()}`,
        points: [...wirePoints.value].reverse(), // Reverse points for correct direction
        startConnection: targetWire.startConnection,  // Use target wire's source
        endConnection: startConnection.value  // Our input is the destination
      }
      
      wires.value.push(wire)
      
      // Add junction point
      wireJunctions.value.push({
        pos: junctionPos,
        sourceWireIndex: wireIndex,
        connectedWireId: wire.id
      })
    } else {
      // Started from an output, connecting to a wire is not typically done
      // but if it is, it would mean connecting our output to the wire's destination
      console.warn('Connecting from output to wire junction - unusual case')
      cancelWireDrawing()
      return
    }
    
    // Reset wire drawing state
    cancelWireDrawing()
  }

  // Select/deselect a wire
  // This function is replaced in CircuitCanvas to use the selection composable

  // Clean up junctions when wires are deleted
  function cleanupJunctionsForDeletedWires(deletedIndices, deletedWireIds) {
    wireJunctions.value = wireJunctions.value.filter(junction => {
      // Remove junctions that were created from deleted wires
      const isSourceDeleted = deletedIndices.includes(junction.sourceWireIndex)
      // Remove junctions that connect to deleted wires
      const isConnectedDeleted = deletedWireIds.includes(junction.connectedWireId)
      
      return !isSourceDeleted && !isConnectedDeleted
    })
  }

  // Delete selected wires
  function deleteSelectedWires() {
    // Sort indices in reverse order to avoid index shifting issues
    const indicesToDelete = Array.from(selectedWires.value).sort((a, b) => b - a)
    
    // Get the wire IDs that will be deleted
    const deletedWireIds = indicesToDelete.map(index => wires.value[index]?.id).filter(id => id)
    
    indicesToDelete.forEach(index => {
      wires.value.splice(index, 1)
    })
    
    // Clean up junctions
    cleanupJunctionsForDeletedWires(indicesToDelete, deletedWireIds)
    
    selectedWires.value.clear()
  }

  // Update wire endpoints when components move
  function updateWireEndpoints(component, deltaX, deltaY) {
    // Get component's connection points
    const config = componentRegistry[component.type]
    if (!config) return
    
    // Get all connection points for this component
    let connections
    if (config.getConnections) {
      connections = config.getConnections(component.props)
    } else {
      connections = config.connections
    }
    
    // Calculate old positions of all connection points
    const oldOutputPositions = (connections.outputs || []).map(conn => ({
      x: component.x - deltaX + conn.x,
      y: component.y - deltaY + conn.y
    }))
    
    const oldInputPositions = (connections.inputs || []).map(conn => ({
      x: component.x - deltaX + conn.x,
      y: component.y - deltaY + conn.y
    }))
    
    wires.value.forEach(wire => {
      // Check if start connection matches any output position
      const startMatchIndex = oldOutputPositions.findIndex(pos => 
        pos.x === wire.startConnection.pos.x && 
        pos.y === wire.startConnection.pos.y
      )
      
      if (startMatchIndex !== -1 && wire.startConnection.portIndex === startMatchIndex) {
        wire.startConnection.pos.x += deltaX
        wire.startConnection.pos.y += deltaY
        if (wire.points.length > 0) {
          wire.points[0].x += deltaX
          wire.points[0].y += deltaY
        }
      }
      
      // Check if end connection matches any input position
      const endMatchIndex = oldInputPositions.findIndex(pos => 
        pos.x === wire.endConnection.pos.x && 
        pos.y === wire.endConnection.pos.y
      )
      
      if (endMatchIndex !== -1 && wire.endConnection.portIndex === endMatchIndex) {
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
    wireJunctions,
    
    // Methods
    startWireDrawing,
    addWireWaypoint,
    completeWire,
    cancelWireDrawing,
    addPointToWire,
    deleteSelectedWires,
    updateWireEndpoints,
    findClosestGridPointOnWire,
    startWireFromJunction,
    completeWireAtJunction,
    cleanupJunctionsForDeletedWires
  }
}