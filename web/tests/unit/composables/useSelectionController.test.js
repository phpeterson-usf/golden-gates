import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

// Mock the component registry
vi.mock('../../../src/utils/componentRegistry', () => ({
  componentRegistry: {
    and: { center: { x: 0, y: 0 } },
    or: { center: { x: 0, y: 0 } },
    not: { center: { x: 0, y: 0 } },
    xor: { center: { x: 0, y: 0 } }
  }
}))

// Mock constants
vi.mock('../../../src/utils/constants', () => ({
  GRID_SIZE: 20
}))

import { useSelectionController } from '../../../src/composables/useSelectionController.js'

describe('useSelectionController - Rubber-band Selection Fix', () => {
  let components, wires, selectionController

  beforeEach(() => {
    // Mock components at different positions
    components = ref([
      { id: 'comp1', type: 'and', x: 2, y: 2 },    // Position (2*20, 2*20) = (40, 40)
      { id: 'comp2', type: 'or', x: 6, y: 2 },     // Position (6*20, 2*20) = (120, 40)
      { id: 'comp3', type: 'not', x: 2, y: 6 },    // Position (2*20, 6*20) = (40, 120)
      { id: 'comp4', type: 'xor', x: 6, y: 6 }     // Position (6*20, 6*20) = (120, 120)
    ])

    // Mock wires
    wires = ref([
      { id: 'wire1', points: [{ x: 1, y: 1 }, { x: 3, y: 1 }] }, // Wire from (20,20) to (60,20)
      { id: 'wire2', points: [{ x: 5, y: 5 }, { x: 7, y: 5 }] }  // Wire from (100,100) to (140,100)
    ])

    selectionController = useSelectionController(components, wires)
  })

  describe('Single-select mode (normal rubber-band)', () => {
    it('should select components that are within the rectangle', () => {
      // Start selection at (0, 0) - clearExisting=true (single-select mode)
      selectionController.startSelection({ x: 0, y: 0 }, true)
      
      // Expand to include comp1 at (40, 40)
      selectionController.updateSelectionEnd({ x: 80, y: 80 })

      // comp1 should be selected
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp2')).toBe(false)
      expect(selectionController.selectedComponents.value.has('comp3')).toBe(false)
      expect(selectionController.selectedComponents.value.has('comp4')).toBe(false)
    })

    it('CRITICAL: should deselect components when rubber-band area shrinks', () => {
      // Start selection at (0, 0)
      selectionController.startSelection({ x: 0, y: 0 }, true)
      
      // First, expand to include both comp1 and comp2
      selectionController.updateSelectionEnd({ x: 160, y: 80 })

      // Both comp1 and comp2 should be selected
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp2')).toBe(true)
      expect(selectionController.selectedComponents.value.size).toBe(2)

      // Now shrink the selection to only include comp1
      selectionController.updateSelectionEnd({ x: 80, y: 80 })

      // Only comp1 should be selected now (comp2 should be deselected)
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp2')).toBe(false)
      expect(selectionController.selectedComponents.value.size).toBe(1)
    })

    it('should deselect all components when rubber-band becomes very small', () => {
      // Start selection at (0, 0)
      selectionController.startSelection({ x: 0, y: 0 }, true)
      
      // Expand to include comp1
      selectionController.updateSelectionEnd({ x: 80, y: 80 })
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)

      // Shrink to a very small area that doesn't include any components
      selectionController.updateSelectionEnd({ x: 10, y: 10 })

      // No components should be selected
      expect(selectionController.selectedComponents.value.size).toBe(0)
    })

    it('should handle expanding and shrinking dynamically', () => {
      selectionController.startSelection({ x: 0, y: 0 }, true)
      
      // Step 1: Select comp1 only
      selectionController.updateSelectionEnd({ x: 80, y: 80 })
      expect(selectionController.selectedComponents.value.size).toBe(1)
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)

      // Step 2: Expand to include comp1 and comp2
      selectionController.updateSelectionEnd({ x: 160, y: 80 })
      expect(selectionController.selectedComponents.value.size).toBe(2)
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp2')).toBe(true)

      // Step 3: Expand to include all 4 components
      selectionController.updateSelectionEnd({ x: 160, y: 160 })
      expect(selectionController.selectedComponents.value.size).toBe(4)

      // Step 4: Shrink back to just comp1 and comp3 (left column)
      selectionController.updateSelectionEnd({ x: 80, y: 160 })
      expect(selectionController.selectedComponents.value.size).toBe(2)
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp3')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp2')).toBe(false)
      expect(selectionController.selectedComponents.value.has('comp4')).toBe(false)
    })
  })

  describe('Multi-select mode (with Shift/Ctrl)', () => {
    it('should preserve existing selection and add new components in multi-select mode', () => {
      // First, manually select comp1
      selectionController.selectComponent('comp1')
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.size).toBe(1)

      // Start multi-select rubber-band (clearExisting=false)
      selectionController.startSelection({ x: 100, y: 0 }, false)
      
      // Expand to include comp2
      selectionController.updateSelectionEnd({ x: 160, y: 80 })

      // Both comp1 (from before) and comp2 (from rubber-band) should be selected
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp2')).toBe(true)
      expect(selectionController.selectedComponents.value.size).toBe(2)
    })

    it('should maintain previous selection when rubber-band area shrinks in multi-select mode', () => {
      // First, manually select comp1
      selectionController.selectComponent('comp1')
      
      // Start multi-select rubber-band
      selectionController.startSelection({ x: 100, y: 0 }, false)
      
      // Expand to include comp2 and comp4
      selectionController.updateSelectionEnd({ x: 160, y: 160 })
      expect(selectionController.selectedComponents.value.size).toBe(3) // comp1, comp2, comp4

      // Shrink to only include comp2 in the rubber-band
      selectionController.updateSelectionEnd({ x: 160, y: 80 })

      // comp1 should still be selected (from before), comp2 should be selected (in rectangle)
      // comp4 should not be selected (no longer in rectangle)
      expect(selectionController.selectedComponents.value.has('comp1')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp2')).toBe(true)
      expect(selectionController.selectedComponents.value.has('comp4')).toBe(false)
      expect(selectionController.selectedComponents.value.size).toBe(2)
    })
  })

  describe('Wire selection', () => {
    it('should deselect wires when they are no longer in the rubber-band area', () => {
      // Start selection to include both wires
      selectionController.startSelection({ x: 0, y: 0 }, true)
      selectionController.updateSelectionEnd({ x: 200, y: 200 })
      
      // Both wires should be selected
      expect(selectionController.selectedWires.value.size).toBe(2)

      // Shrink to only include the first wire
      selectionController.updateSelectionEnd({ x: 80, y: 80 })

      // Only first wire should be selected
      expect(selectionController.selectedWires.value.size).toBe(1)
      expect(selectionController.selectedWires.value.has(0)).toBe(true)
      expect(selectionController.selectedWires.value.has(1)).toBe(false)
    })
  })

  describe('Selection cleanup', () => {
    it('should clean up state when selection ends', () => {
      selectionController.startSelection({ x: 0, y: 0 }, true)
      selectionController.updateSelectionEnd({ x: 80, y: 80 })
      
      // Verify selection is active
      expect(selectionController.isSelecting.value).toBe(true)
      
      // End selection
      selectionController.endSelection()
      
      // Verify state is cleaned up
      expect(selectionController.isSelecting.value).toBe(false)
    })
  })
})