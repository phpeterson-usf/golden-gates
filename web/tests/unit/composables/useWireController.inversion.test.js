import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useWireController } from '@/composables/useWireController'

// Mock component registry with inverted input support
vi.mock('@/utils/componentRegistry', () => ({
  componentRegistry: {
    'and-gate': {
      getConnections: props => {
        const numInputs = props?.numInputs || 2
        const invertedInputs = props?.invertedInputs || []

        const inputs = []
        for (let i = 0; i < numInputs; i++) {
          const isInverted = invertedInputs.includes(i)
          const x = isInverted ? -1 : 0 // Move left 1 grid unit for inverted inputs
          inputs.push({ name: String(i), x, y: i * 2 })
        }

        return {
          inputs,
          outputs: [{ name: '0', x: 3, y: 1 }]
        }
      }
    },
    'or-gate': {
      getConnections: props => {
        const numInputs = props?.numInputs || 2
        const invertedInputs = props?.invertedInputs || []

        const inputs = []
        for (let i = 0; i < numInputs; i++) {
          const isInverted = invertedInputs.includes(i)
          const x = isInverted ? -1 : 0
          inputs.push({ name: String(i), x, y: i * 2 })
        }

        return {
          inputs,
          outputs: [{ name: '0', x: 3, y: 1 }]
        }
      }
    },
    input: {
      connections: {
        inputs: [],
        outputs: [{ x: 2, y: 1 }]
      }
    }
  }
}))

describe('useWireController - Input Inversion', () => {
  let wireController
  let mockComponents
  let mockCallbacks
  let mockCircuitManager

  beforeEach(() => {
    mockComponents = ref([
      { id: 'input1', type: 'input', x: 5, y: 5 },
      {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] } // Initially no inverted inputs
      }
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

    // Set up initial wire connection from input1 to and1 input 0
    wireController.wires.value = [
      {
        id: 'wire1',
        points: [
          { x: 7, y: 6 },
          { x: 10, y: 5 }
        ], // input1 output to and1 input 0
        startConnection: { portIndex: 0, portType: 'output', pos: { x: 7, y: 6 } },
        endConnection: { portIndex: 0, portType: 'input', pos: { x: 10, y: 5 } }
      }
    ]
  })

  describe('updateWireEndpointsForPropertyChange', () => {
    it('should update wire endpoints when input is inverted', () => {
      // Create old and new component states
      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] } // Invert input 0
      }

      // Update wire endpoints
      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Check that wire endpoint moved left by 1 grid unit
      const wire = wireController.wires.value[0]
      expect(wire.endConnection.pos).toEqual({ x: 9, y: 5 }) // 10 + (-1) = 9
      expect(wire.points[1]).toEqual({ x: 9, y: 5 }) // Last point should also update
    })

    it('should update wire endpoints when input is un-inverted', () => {
      // Start with inverted input
      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] } // Remove inversion
      }

      // Set up wire at inverted position initially
      wireController.wires.value[0].endConnection.pos = { x: 9, y: 5 }
      wireController.wires.value[0].points[1] = { x: 9, y: 5 }

      // Update wire endpoints
      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Check that wire endpoint moved right back to normal position
      const wire = wireController.wires.value[0]
      expect(wire.endConnection.pos).toEqual({ x: 10, y: 5 }) // 10 + 0 = 10
      expect(wire.points[1]).toEqual({ x: 10, y: 5 })
    })

    it('should handle multiple input inversions', () => {
      // Add second wire to input 1
      wireController.wires.value.push({
        id: 'wire2',
        points: [
          { x: 7, y: 8 },
          { x: 10, y: 7 }
        ], // to input 1
        startConnection: { portIndex: 0, portType: 'output', pos: { x: 7, y: 8 } },
        endConnection: { portIndex: 1, portType: 'input', pos: { x: 10, y: 7 } }
      })

      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0, 1] } // Invert both inputs
      }

      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Check that both wire endpoints moved
      expect(wireController.wires.value[0].endConnection.pos).toEqual({ x: 9, y: 5 })
      expect(wireController.wires.value[1].endConnection.pos).toEqual({ x: 9, y: 7 })
    })

    it('should handle partial inversion changes', () => {
      // Add second wire to input 1
      wireController.wires.value.push({
        id: 'wire2',
        points: [
          { x: 7, y: 8 },
          { x: 10, y: 7 }
        ],
        startConnection: { portIndex: 0, portType: 'output', pos: { x: 7, y: 8 } },
        endConnection: { portIndex: 1, portType: 'input', pos: { x: 10, y: 7 } }
      })

      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] } // Input 0 inverted
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [1] } // Switch to input 1 inverted
      }

      // Set initial positions
      wireController.wires.value[0].endConnection.pos = { x: 9, y: 5 } // inverted
      wireController.wires.value[0].points[1] = { x: 9, y: 5 }

      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Input 0 should move back to normal position
      expect(wireController.wires.value[0].endConnection.pos).toEqual({ x: 10, y: 5 })
      // Input 1 should move to inverted position
      expect(wireController.wires.value[1].endConnection.pos).toEqual({ x: 9, y: 7 })
    })

    it('should not affect output connections', () => {
      // Add wire from and1 output
      wireController.wires.value.push({
        id: 'wire_output',
        points: [
          { x: 13, y: 6 },
          { x: 16, y: 6 }
        ],
        startConnection: { portIndex: 0, portType: 'output', pos: { x: 13, y: 6 } },
        endConnection: { portIndex: 0, portType: 'input', pos: { x: 16, y: 6 } }
      })

      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] }
      }

      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Output wire should remain unchanged
      const outputWire = wireController.wires.value.find(w => w.id === 'wire_output')
      expect(outputWire.startConnection.pos).toEqual({ x: 13, y: 6 })
    })

    it('should handle components with no connections gracefully', () => {
      const oldComponent = {
        id: 'unknown',
        type: 'unknown-type',
        x: 5,
        y: 5,
        props: {}
      }

      const newComponent = {
        id: 'unknown',
        type: 'unknown-type',
        x: 5,
        y: 5,
        props: { someProperty: 'changed' }
      }

      // Should not throw error
      expect(() => {
        wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)
      }).not.toThrow()
    })

    it('should match wires by exact position and port index', () => {
      // Add wire to wrong position (should not be affected)
      wireController.wires.value.push({
        id: 'wire_wrong_pos',
        points: [
          { x: 7, y: 8 },
          { x: 11, y: 5 }
        ], // Wrong X position
        startConnection: { portIndex: 0, portType: 'output', pos: { x: 7, y: 8 } },
        endConnection: { portIndex: 0, portType: 'input', pos: { x: 11, y: 5 } } // Wrong pos
      })

      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] }
      }

      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Correct wire should be updated
      expect(wireController.wires.value[0].endConnection.pos).toEqual({ x: 9, y: 5 })
      // Wrong position wire should remain unchanged
      expect(wireController.wires.value[1].endConnection.pos).toEqual({ x: 11, y: 5 })
    })

    it('should handle single-point wires', () => {
      // Create wire with only one point
      wireController.wires.value[0].points = [{ x: 10, y: 5 }]

      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] }
      }

      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Connection pos should update but no point update attempted
      expect(wireController.wires.value[0].endConnection.pos).toEqual({ x: 9, y: 5 })
      expect(wireController.wires.value[0].points).toHaveLength(1)
    })
  })

  describe('integration with existing wire functionality', () => {
    it('should work with junction cleanup', () => {
      // Add junction
      wireController.wireJunctions.value.push({
        pos: { x: 8, y: 5 },
        sourceWireIndex: 0,
        connectedWireId: 'other-wire'
      })

      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] }
      }

      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Wire should update and junctions should remain intact
      expect(wireController.wires.value[0].endConnection.pos).toEqual({ x: 9, y: 5 })
      expect(wireController.wireJunctions.value).toHaveLength(1)
    })

    it('should work with wire selection', () => {
      wireController.selectedWires.value.add(0)

      const oldComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [] }
      }

      const newComponent = {
        id: 'and1',
        type: 'and-gate',
        x: 10,
        y: 5,
        props: { numInputs: 2, invertedInputs: [0] }
      }

      wireController.updateWireEndpointsForPropertyChange(oldComponent, newComponent)

      // Wire should update and selection should remain
      expect(wireController.wires.value[0].endConnection.pos).toEqual({ x: 9, y: 5 })
      expect(wireController.selectedWires.value.has(0)).toBe(true)
    })
  })
})
