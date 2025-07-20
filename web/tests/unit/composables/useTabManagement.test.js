import { describe, it, expect, vi } from 'vitest'
import { useTabManagement } from '../../../src/composables/useTabManagement'

describe('useTabManagement', () => {
  describe('hasCircuitUnsavedWork', () => {
    it('should detect unsaved components correctly', () => {
      const { hasCircuitUnsavedWork } = useTabManagement()

      const mockCircuitManager = {
        getCircuit: vi.fn().mockReturnValue({
          id: 'circuit_1',
          components: [{ id: 'comp1', type: 'and' }],
          wires: []
        })
      }

      const result = hasCircuitUnsavedWork('circuit_1', mockCircuitManager)
      expect(result).toBe(true)
      expect(mockCircuitManager.getCircuit).toHaveBeenCalledWith('circuit_1')
    })

    it('should detect unsaved wires correctly', () => {
      const { hasCircuitUnsavedWork } = useTabManagement()

      const mockCircuitManager = {
        getCircuit: vi.fn().mockReturnValue({
          id: 'circuit_1',
          components: [],
          wires: [{ id: 'wire1', from: 'comp1', to: 'comp2' }]
        })
      }

      const result = hasCircuitUnsavedWork('circuit_1', mockCircuitManager)
      expect(result).toBe(true)
      expect(mockCircuitManager.getCircuit).toHaveBeenCalledWith('circuit_1')
    })

    it('should return false for empty circuit', () => {
      const { hasCircuitUnsavedWork } = useTabManagement()

      const mockCircuitManager = {
        getCircuit: vi.fn().mockReturnValue({
          id: 'circuit_1',
          components: [],
          wires: []
        })
      }

      const result = hasCircuitUnsavedWork('circuit_1', mockCircuitManager)
      expect(result).toBe(false)
      expect(mockCircuitManager.getCircuit).toHaveBeenCalledWith('circuit_1')
    })

    it('should return false for non-existent circuit', () => {
      const { hasCircuitUnsavedWork } = useTabManagement()

      const mockCircuitManager = {
        getCircuit: vi.fn().mockReturnValue(null)
      }

      const result = hasCircuitUnsavedWork('non-existent', mockCircuitManager)
      expect(result).toBe(false)
      expect(mockCircuitManager.getCircuit).toHaveBeenCalledWith('non-existent')
    })

    it('should handle malformed circuit data gracefully', () => {
      const { hasCircuitUnsavedWork } = useTabManagement()

      const mockCircuitManager = {
        getCircuit: vi.fn().mockReturnValue({
          id: 'circuit_1'
          // Missing components and wires properties
        })
      }

      const result = hasCircuitUnsavedWork('circuit_1', mockCircuitManager)
      expect(result).toBeFalsy()
      expect(mockCircuitManager.getCircuit).toHaveBeenCalledWith('circuit_1')
    })
  })

  describe('tab scrolling functionality', () => {
    it('should initialize with correct default state', () => {
      const { showScrollButtons, canScrollLeft, canScrollRight } = useTabManagement()

      expect(showScrollButtons.value).toBe(false)
      expect(canScrollLeft.value).toBe(false)
      expect(canScrollRight.value).toBe(false)
    })
  })
})
