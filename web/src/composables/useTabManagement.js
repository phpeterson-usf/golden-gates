import { ref, nextTick } from 'vue'

/**
 * Composable for managing circuit tab scrolling and navigation
 */
export function useTabManagement() {
  // Tab scrolling state
  const showScrollButtons = ref(false)
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)
  const tabsContainer = ref(null)

  /**
   * Scroll tabs in the specified direction
   */
  function scrollTabs(direction) {
    const container = tabsContainer.value
    if (!container) return

    const scrollAmount = 120 // pixels to scroll
    const currentScroll = container.scrollLeft

    if (direction === 'left') {
      container.scrollTo({
        left: Math.max(0, currentScroll - scrollAmount),
        behavior: 'smooth'
      })
    } else {
      container.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }

    // Update scroll button states after a brief delay
    setTimeout(() => updateScrollButtonStates(), 100)
  }

  /**
   * Update the state of scroll buttons based on container scroll position
   */
  function updateScrollButtonStates() {
    const container = tabsContainer.value
    if (!container) {
      showScrollButtons.value = false
      return
    }

    const { scrollLeft, scrollWidth, clientWidth } = container

    // Show scroll buttons if content is wider than container
    showScrollButtons.value = scrollWidth > clientWidth

    // Update individual button states
    canScrollLeft.value = scrollLeft > 0
    canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1 // -1 for rounding
  }

  /**
   * Check if we need to show scroll buttons (call on mount/resize)
   */
  function checkTabOverflow() {
    nextTick(() => {
      updateScrollButtonStates()
    })
  }

  /**
   * Check if a circuit has unsaved work
   */
  function hasCircuitUnsavedWork(circuitId, circuitManager) {
    const circuit = circuitManager.getCircuit(circuitId)
    if (!circuit) return false

    // Check if circuit has any components or wires
    const hasComponents = circuit.components && circuit.components.length > 0
    const hasWires = circuit.wires && circuit.wires.length > 0

    return hasComponents || hasWires
  }

  return {
    // State
    showScrollButtons,
    canScrollLeft,
    canScrollRight,
    tabsContainer,

    // Methods
    scrollTabs,
    updateScrollButtonStates,
    checkTabOverflow,
    hasCircuitUnsavedWork
  }
}
