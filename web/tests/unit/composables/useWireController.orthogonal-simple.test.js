import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useWireController } from '@/composables/useWireController'

// Mock component registry
vi.mock('@/utils/componentRegistry', () => ({
  componentRegistry: {
    'and-gate': {
      connections: {
        inputs: [{ x: 0, y: 1 }, { x: 0, y: 2 }],
        outputs: [{ x: 3, y: 1.5 }]
      }
    },
    'input': {
      connections: {
        inputs: [],
        outputs: [{ x: 2, y: 1 }]
      }
    }
  }
}))

describe('useWireController - Orthogonal Routing Fix', () => {
  let wireController
  let mockComponents
  let mockCallbacks
  let mockCircuitManager

  beforeEach(() => {
    mockComponents = ref([
      { id: 'input1', type: 'input', x: 5, y: 5 },
      { id: 'and1', type: 'and-gate', x: 15, y: 10 }
    ])

    mockCallbacks = {
      wires: ref([]),
      wireJunctions: ref([]),
      addWire: vi.fn(),
      removeWire: vi.fn(),
      addWireJunction: vi.fn(),
      removeWireJunction: vi.fn()
    }

    mockCircuitManager = {
      activeCircuit: ref({
        components: mockComponents.value,
        wires: [],
        wireJunctions: []
      })
    }

    wireController = useWireController(
      mockComponents,
      15, // grid size
      mockCallbacks,
      mockCircuitManager
    )
  })

  /**
   * Helper function to check if all wire segments are orthogonal (no diagonals)
   */
  function assertNodiagonalSegments(points) {
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      
      const isHorizontal = p1.y === p2.y
      const isVertical = p1.x === p2.x
      
      if (!isHorizontal && !isVertical) {
        throw new Error(`Diagonal segment found: (${p1.x},${p1.y}) -> (${p2.x},${p2.y})`)
      }
    }
  }

  describe('fix for diagonal wire segments', () => {
    it('should prevent diagonal segments when completing wire directly', () => {
      // Start wire from input1 output (7, 6)
      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      
      // Complete directly to and1 input (15, 11) - different position
      wireController.completeWire('and1', 0, 'input')
      
      const wireCall = mockCallbacks.addWire.mock.calls[0][0]
      
      // Main test: verify no diagonal segments exist
      assertNodiagonalSegments(wireCall.points)
      
      // Should have more than 2 points (start and end) to create orthogonal routing
      expect(wireCall.points.length).toBeGreaterThan(2)
      
      // First and last points should be correct
      expect(wireCall.points[0]).toEqual({ x: 7, y: 6 })
      expect(wireCall.points[wireCall.points.length - 1]).toEqual({ x: 15, y: 11 })
    })

    it('should prevent diagonal segments with waypoints', () => {
      // Start wire
      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      
      // Add a waypoint
      wireController.addWireWaypoint({ x: 150, y: 90 })
      
      // Complete to different position
      wireController.completeWire('and1', 0, 'input')
      
      const wireCall = mockCallbacks.addWire.mock.calls[0][0]
      
      // Main test: verify no diagonal segments exist
      assertNodiagonalSegments(wireCall.points)
    })

    it('should prevent diagonal segments with multiple waypoints', () => {
      // Start wire
      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      
      // Add multiple waypoints
      wireController.addWireWaypoint({ x: 150, y: 90 })
      wireController.addWireWaypoint({ x: 150, y: 135 })
      wireController.addWireWaypoint({ x: 180, y: 135 })
      
      // Complete to final position
      wireController.completeWire('and1', 0, 'input')
      
      const wireCall = mockCallbacks.addWire.mock.calls[0][0]
      
      // Main test: verify no diagonal segments exist
      assertNodiagonalSegments(wireCall.points)
    })

    it('should handle edge case where final point equals last waypoint', () => {
      // Start wire
      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      
      // Add waypoint that matches the final connection point
      wireController.addWireWaypoint({ x: 225, y: 165 }) // Same as and1 input (15, 11)
      
      // Complete wire
      wireController.completeWire('and1', 0, 'input')
      
      const wireCall = mockCallbacks.addWire.mock.calls[0][0]
      
      // Should still have no diagonal segments
      assertNodiagonalSegments(wireCall.points)
      
      // Should end at correct position
      expect(wireCall.points[wireCall.points.length - 1]).toEqual({ x: 15, y: 11 })
    })

    it('should handle rotated gates correctly', () => {
      // Test with a component that might have rotated connection points
      mockComponents.value.push({
        id: 'rotated_gate',
        type: 'and-gate', 
        x: 20, 
        y: 15,
        props: { rotation: 90 }
      })

      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      wireController.completeWire('rotated_gate', 0, 'input')
      
      const wireCall = mockCallbacks.addWire.mock.calls[0][0]
      
      // Main test: verify no diagonal segments exist even with rotation
      assertNodiagonalSegments(wireCall.points)
    })
  })

  describe('preserve existing behavior', () => {
    it('should maintain wire start and end positions', () => {
      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      wireController.completeWire('and1', 0, 'input')
      
      const wireCall = mockCallbacks.addWire.mock.calls[0][0]
      
      // First point should be start connection
      expect(wireCall.points[0]).toEqual({ x: 7, y: 6 })
      // Last point should be end connection  
      expect(wireCall.points[wireCall.points.length - 1]).toEqual({ x: 15, y: 11 })
    })

    it('should create proper wire objects', () => {
      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      wireController.completeWire('and1', 0, 'input')
      
      const wireCall = mockCallbacks.addWire.mock.calls[0][0]
      
      expect(wireCall).toHaveProperty('id')
      expect(wireCall).toHaveProperty('points')
      expect(wireCall).toHaveProperty('startConnection')
      expect(wireCall).toHaveProperty('endConnection')
      expect(Array.isArray(wireCall.points)).toBe(true)
    })

    it('should handle wire cancellation', () => {
      wireController.startWireDrawing('input1', 0, 'output', { x: 105, y: 90 })
      wireController.cancelWireDrawing()
      
      expect(wireController.drawingWire.value).toBe(false)
      expect(wireController.wirePoints.value).toHaveLength(0)
    })
  })
})