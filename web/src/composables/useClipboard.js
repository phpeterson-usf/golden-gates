import { ref, computed } from 'vue'

/**
 * Clipboard Controller - Manages clipboard operations for circuit components
 * Provides both internal clipboard state and OS clipboard integration
 */
export function useClipboard() {
  // Internal clipboard state
  const internalClipboard = ref(null)
  const clipboardVersion = ref('1.0')

  // Clipboard operation state
  const lastOperation = ref(null) // 'copy', 'cut', or null
  const operationTimestamp = ref(null)

  // Check if clipboard has data
  const hasClipboardData = computed(() => {
    return (
      internalClipboard.value !== null &&
      internalClipboard.value.elements &&
      (internalClipboard.value.elements.components.length > 0 ||
        internalClipboard.value.elements.wires.length > 0 ||
        internalClipboard.value.elements.junctions.length > 0)
    )
  })

  /**
   * Serialize circuit elements to clipboard format
   * @param {Object} elements - { components, wires, junctions }
   * @returns {Object} Serialized clipboard data
   */
  function serializeElements(elements) {
    const { components = [], wires = [], junctions = [] } = elements

    // Calculate bounds for relative positioning
    const bounds = calculateBounds(components, wires)

    // Serialize components with relative positioning
    const serializedComponents = components.map(component => ({
      ...component,
      // Store relative position from top-left corner of selection
      x: component.x - bounds.minX,
      y: component.y - bounds.minY,
      // Deep clone props to avoid reference issues
      props: JSON.parse(JSON.stringify(component.props || {}))
    }))

    // Serialize wires with relative positioning
    const serializedWires = wires.map(wire => ({
      ...wire,
      // Adjust wire points relative to bounds
      points: wire.points.map(point => ({
        x: point.x - bounds.minX,
        y: point.y - bounds.minY
      })),
      // Store only position and port type - connections will be resolved by geometry
      startConnection:
        wire.startConnection && wire.startConnection.pos
          ? {
              pos: {
                x: wire.startConnection.pos.x - bounds.minX,
                y: wire.startConnection.pos.y - bounds.minY
              },
              portType: wire.startConnection.portType
            }
          : null,
      endConnection:
        wire.endConnection && wire.endConnection.pos
          ? {
              pos: {
                x: wire.endConnection.pos.x - bounds.minX,
                y: wire.endConnection.pos.y - bounds.minY
              },
              portType: wire.endConnection.portType
            }
          : null
    }))

    // Serialize junctions with relative positioning
    const serializedJunctions = junctions.map(junction => ({
      ...junction,
      pos: {
        x: junction.pos.x - bounds.minX,
        y: junction.pos.y - bounds.minY
      }
    }))

    return {
      version: clipboardVersion.value,
      elements: {
        components: serializedComponents,
        wires: serializedWires,
        junctions: serializedJunctions
      },
      bounds: {
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
        originalBounds: bounds
      },
      timestamp: Date.now(),
      operation: lastOperation.value
    }
  }

  /**
   * Deserialize clipboard data back to circuit elements
   * @param {Object} clipboardData - Serialized clipboard data
   * @param {Object} pastePosition - { x, y } position to paste at
   * @returns {Object} Deserialized elements with new IDs
   */
  function deserializeElements(clipboardData, pastePosition = { x: 0, y: 0 }) {
    if (!clipboardData || !clipboardData.elements) {
      return { components: [], wires: [], junctions: [] }
    }

    const { components = [], wires = [], junctions = [] } = clipboardData.elements

    // Generate ID mappings for components and wires
    const componentIdMap = new Map()
    const wireIdMap = new Map()

    // Deserialize components with new IDs and adjusted positions
    const deserializedComponents = components.map(component => {
      const newId = generateUniqueId(component.type)
      componentIdMap.set(component.id, newId)

      return {
        ...component,
        id: newId,
        x: component.x + pastePosition.x,
        y: component.y + pastePosition.y,
        props: JSON.parse(JSON.stringify(component.props || {}))
      }
    })

    // Deserialize wires with new IDs and adjusted positions
    const deserializedWires = wires.map(wire => {
      const newId = generateUniqueWireId()
      wireIdMap.set(wire.id, newId)

      return {
        ...wire,
        id: newId,
        points: wire.points.map(point => ({
          x: point.x + pastePosition.x,
          y: point.y + pastePosition.y
        })),
        // Preserve connection positions - connections will be resolved by geometry
        startConnection: wire.startConnection
          ? {
              pos: {
                x: wire.startConnection.pos.x + pastePosition.x,
                y: wire.startConnection.pos.y + pastePosition.y
              },
              portType: wire.startConnection.portType
            }
          : null,
        endConnection: wire.endConnection
          ? {
              pos: {
                x: wire.endConnection.pos.x + pastePosition.x,
                y: wire.endConnection.pos.y + pastePosition.y
              },
              portType: wire.endConnection.portType
            }
          : null
      }
    })

    // Deserialize junctions with adjusted positions and wire references
    const deserializedJunctions = junctions.map(junction => ({
      ...junction,
      pos: {
        x: junction.pos.x + pastePosition.x,
        y: junction.pos.y + pastePosition.y
      },
      // Note: Wire indices will need to be updated by the caller
      // based on where the wires are inserted in the circuit
      connectedWireId: wireIdMap.get(junction.connectedWireId) || junction.connectedWireId
    }))

    return {
      components: deserializedComponents,
      wires: deserializedWires,
      junctions: deserializedJunctions,
      idMappings: {
        components: componentIdMap,
        wires: wireIdMap
      }
    }
  }

  /**
   * Calculate bounding box for a set of components and wires
   * @param {Array} components - Array of component objects
   * @param {Array} wires - Array of wire objects
   * @returns {Object} Bounds { minX, minY, maxX, maxY }
   */
  function calculateBounds(components, wires) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    // Include component positions
    components.forEach(component => {
      minX = Math.min(minX, component.x)
      minY = Math.min(minY, component.y)
      maxX = Math.max(maxX, component.x)
      maxY = Math.max(maxY, component.y)
    })

    // Include wire points
    wires.forEach(wire => {
      wire.points.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })
    })

    // Handle empty selection
    if (minX === Infinity) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    }

    return { minX, minY, maxX, maxY }
  }

  // Legacy updateConnectionReferences function removed - connections now resolved by geometry

  /**
   * Generate unique component ID
   * @param {string} type - Component type
   * @returns {string} Unique ID
   */
  function generateUniqueId(type) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${type}_${timestamp}_${random}`
  }

  /**
   * Generate unique wire ID
   * @returns {string} Unique wire ID
   */
  function generateUniqueWireId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `wire_${timestamp}_${random}`
  }

  /**
   * Copy elements to internal clipboard
   * @param {Object} elements - { components, wires, junctions }
   * @returns {Object} Serialized clipboard data
   */
  function copyToClipboard(elements) {
    lastOperation.value = 'copy'
    operationTimestamp.value = Date.now()
    const serializedData = serializeElements(elements)
    internalClipboard.value = serializedData

    return serializedData
  }

  /**
   * Cut elements to internal clipboard
   * @param {Object} elements - { components, wires, junctions }
   * @returns {Object} Serialized clipboard data
   */
  function cutToClipboard(elements) {
    lastOperation.value = 'cut'
    operationTimestamp.value = Date.now()
    const serializedData = serializeElements(elements)
    internalClipboard.value = serializedData

    return serializedData
  }

  /**
   * Paste elements from internal clipboard
   * @param {Object} pastePosition - { x, y } position to paste at
   * @returns {Object} Deserialized elements or null if no clipboard data
   */
  function pasteFromClipboard(pastePosition = { x: 0, y: 0 }) {
    if (!internalClipboard.value) {
      return null
    }

    return deserializeElements(internalClipboard.value, pastePosition)
  }

  /**
   * Get clipboard data for OS clipboard integration
   * @returns {string} JSON string of clipboard data
   */
  function getClipboardDataForOS() {
    if (!internalClipboard.value) {
      return null
    }

    return JSON.stringify(internalClipboard.value)
  }

  /**
   * Set clipboard data from OS clipboard
   * @param {string} jsonData - JSON string of clipboard data
   * @returns {boolean} Success status
   */
  function setClipboardDataFromOS(jsonData) {
    try {
      const parsedData = JSON.parse(jsonData)

      // Validate data structure
      if (parsedData.version && parsedData.elements) {
        internalClipboard.value = parsedData
        lastOperation.value = parsedData.operation || 'copy'
        operationTimestamp.value = parsedData.timestamp || Date.now()
        return true
      }
    } catch (error) {
      console.warn('Failed to parse clipboard data from OS:', error)
    }

    return false
  }

  /**
   * Clear clipboard data
   */
  function clearClipboard() {
    internalClipboard.value = null
    lastOperation.value = null
    operationTimestamp.value = null
  }

  /**
   * Check if clipboard data is from a cut operation
   * @returns {boolean} True if last operation was cut
   */
  function isCutOperation() {
    return lastOperation.value === 'cut'
  }

  /**
   * Get clipboard statistics
   * @returns {Object} Statistics about clipboard contents
   */
  function getClipboardStats() {
    if (!internalClipboard.value) {
      return { components: 0, wires: 0, junctions: 0 }
    }

    const { elements } = internalClipboard.value
    return {
      components: elements.components?.length || 0,
      wires: elements.wires?.length || 0,
      junctions: elements.junctions?.length || 0,
      operation: lastOperation.value,
      timestamp: operationTimestamp.value
    }
  }

  return {
    // State
    hasClipboardData,

    // Core operations
    copyToClipboard,
    cutToClipboard,
    pasteFromClipboard,
    clearClipboard,

    // OS clipboard integration
    getClipboardDataForOS,
    setClipboardDataFromOS,

    // Utility functions
    serializeElements,
    deserializeElements,
    calculateBounds,
    generateUniqueId,
    generateUniqueWireId,
    isCutOperation,
    getClipboardStats
  }
}
