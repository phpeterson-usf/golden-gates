/**
 * Shared composable for components that use selectorBits to determine number of ports
 * Used by components like PriorityEncoder, Decoder, and potentially Multiplexer
 */
export function useSelectorBits() {
  
  /**
   * Standard selectorBits prop definition
   * Can be used by components that need selectorBits functionality
   */
  const selectorBitsProp = {
    selectorBits: {
      type: Number,
      default: 2,
      validator: (value) => value >= 1 && value <= 8 // 2^1=2 to 2^8=256 ports
    }
  }

  /**
   * Create computed properties for components based on selectorBits
   * @returns {Object} Computed properties object
   */
  function createSelectorBitsComputed() {
    return {
      // Number of inputs for PriorityEncoder
      numInputs() {
        return Math.pow(2, this.selectorBits)
      },
      
      // Number of outputs for Decoder  
      numOutputs() {
        return Math.pow(2, this.selectorBits)
      },
      
      // Generic number of ports calculation
      numPorts() {
        return Math.pow(2, this.selectorBits)
      }
    }
  }

  /**
   * Calculate component height based on port count and spacing
   * @param {number} numPorts - Number of ports
   * @param {number} portSpacing - Grid units between ports (default: 2)
   * @param {number} minHeight - Minimum component height (default: 4)
   * @param {number} margin - Top/bottom margin (default: 2)
   * @returns {number} Total component height in grid units
   */
  function calculatePortBasedHeight(numPorts, portSpacing = 2, minHeight = 4, margin = 2) {
    const baseHeight = (numPorts - 1) * portSpacing
    return Math.max(baseHeight + margin, minHeight)
  }

  /**
   * Get port position Y coordinate
   * @param {number} portIndex - 0-based port index
   * @param {number} portSpacing - Grid units between ports (default: 2)
   * @param {number} topMargin - Top margin in grid units (default: 1)
   * @returns {number} Y coordinate in grid units
   */
  function getPortY(portIndex, portSpacing = 2, topMargin = 1) {
    return topMargin + portIndex * portSpacing
  }

  return {
    selectorBitsProp,
    createSelectorBitsComputed,
    calculatePortBasedHeight,
    getPortY
  }
}