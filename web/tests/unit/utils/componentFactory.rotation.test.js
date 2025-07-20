import { describe, it, expect, vi } from 'vitest'
import { createGateRegistryEntry } from '@/utils/componentFactory'

// Mock gate definition
vi.mock('@/config/gateDefinitions', () => ({
  getGateDefinition: vi.fn().mockReturnValue(null) // Use default behavior for testing
}))

describe('componentFactory - Rotation Support', () => {
  let gateEntry

  beforeEach(() => {
    gateEntry = createGateRegistryEntry('and', {})
  })

  describe('standardGateConnections with rotation', () => {
    it('should return original positions for 0 degree rotation', () => {
      const props = {
        numInputs: 2,
        invertedInputs: [],
        rotation: 0
      }

      const connections = gateEntry.getConnections(props)

      expect(connections.inputs).toEqual([
        { name: '0', x: 0, y: 0 },
        { name: '1', x: 0, y: 2 }
      ])
      expect(connections.outputs).toEqual([{ name: '0', x: 3, y: 1 }])
    })

    it('should rotate input positions for 90 degree rotation', () => {
      const props = {
        numInputs: 2,
        invertedInputs: [],
        rotation: 90
      }

      const connections = gateEntry.getConnections(props)

      // For 90° rotation around output point (3, 1):
      // Input 0: (0, 0) -> rotated around (3, 1) -> (4, -2)
      // Input 1: (0, 2) -> rotated around (3, 1) -> (2, -2)
      expect(connections.inputs).toEqual([
        { name: '0', x: 4, y: -2 }, // 90° rotation of (0,0) around (3,1)
        { name: '1', x: 2, y: -2 } // 90° rotation of (0,2) around (3,1)
      ])

      // Output stays at rotation center
      expect(connections.outputs).toEqual([{ name: '0', x: 3, y: 1 }])
    })

    it('should rotate input positions for 180 degree rotation', () => {
      const props = {
        numInputs: 2,
        invertedInputs: [],
        rotation: 180
      }

      const connections = gateEntry.getConnections(props)

      // For 180° rotation around output point (3, 1):
      // Input 0: (0, 0) -> rotated around (3, 1) -> (6, 2)
      // Input 1: (0, 2) -> rotated around (3, 1) -> (6, 0)
      expect(connections.inputs).toEqual([
        { name: '0', x: 6, y: 2 }, // 180° rotation of (0,0) around (3,1)
        { name: '1', x: 6, y: 0 } // 180° rotation of (0,2) around (3,1)
      ])

      expect(connections.outputs).toEqual([{ name: '0', x: 3, y: 1 }])
    })

    it('should rotate input positions for 270 degree rotation', () => {
      const props = {
        numInputs: 2,
        invertedInputs: [],
        rotation: 270
      }

      const connections = gateEntry.getConnections(props)

      // For 270° rotation around output point (3, 1):
      // Input 0: (0, 0) -> rotated around (3, 1) -> (2, 4)
      // Input 1: (0, 2) -> rotated around (3, 1) -> (4, 4)
      expect(connections.inputs).toEqual([
        { name: '0', x: 2, y: 4 }, // 270° rotation of (0,0) around (3,1)
        { name: '1', x: 4, y: 4 } // 270° rotation of (0,2) around (3,1)
      ])

      expect(connections.outputs).toEqual([{ name: '0', x: 3, y: 1 }])
    })

    it('should handle rotation with inverted inputs', () => {
      const props = {
        numInputs: 2,
        invertedInputs: [0], // Invert first input
        rotation: 90
      }

      const connections = gateEntry.getConnections(props)

      // Input 0 is inverted (x = -1 instead of 0) before rotation
      // Input 0: (-1, 0) -> rotated 90° around (3, 1) -> (4, -3)
      // Input 1: (0, 2) -> rotated 90° around (3, 1) -> (2, -2)
      expect(connections.inputs).toEqual([
        { name: '0', x: 4, y: -3 }, // 90° rotation of (-1,0) around (3,1)
        { name: '1', x: 2, y: -2 } // 90° rotation of (0,2) around (3,1)
      ])
    })

    it('should handle single input gate rotation', () => {
      const props = {
        numInputs: 1,
        invertedInputs: [],
        rotation: 90
      }

      const connections = gateEntry.getConnections(props)

      // Single input gate has output at (3, 1)
      // Input 0: (0, 0) -> rotated 90° around (3, 1) -> (4, -2)
      expect(connections.inputs).toEqual([{ name: '0', x: 4, y: -2 }])

      expect(connections.outputs).toEqual([{ name: '0', x: 3, y: 1 }])
    })

    it('should handle three input gate rotation', () => {
      const props = {
        numInputs: 3,
        invertedInputs: [],
        rotation: 90
      }

      const connections = gateEntry.getConnections(props)

      // Three input gate has output at (3, 2) (center of 0, 2, 4)
      // Input 0: (0, 0) -> rotated 90° around (3, 2) -> (5, -1)
      // Input 1: (0, 2) -> rotated 90° around (3, 2) -> (3, -1)
      // Input 2: (0, 4) -> rotated 90° around (3, 2) -> (1, -1)
      expect(connections.inputs).toEqual([
        { name: '0', x: 5, y: -1 }, // 90° rotation of (0,0) around (3,2)
        { name: '1', x: 3, y: -1 }, // 90° rotation of (0,2) around (3,2)
        { name: '2', x: 1, y: -1 } // 90° rotation of (0,4) around (3,2)
      ])

      expect(connections.outputs).toEqual([{ name: '0', x: 3, y: 2 }])
    })

    it('should handle undefined rotation as 0 degrees', () => {
      const props = {
        numInputs: 2,
        invertedInputs: []
        // rotation is undefined
      }

      const connections = gateEntry.getConnections(props)

      // Should behave same as rotation: 0
      expect(connections.inputs).toEqual([
        { name: '0', x: 0, y: 0 },
        { name: '1', x: 0, y: 2 }
      ])
    })

    it('should handle invalid rotation angles', () => {
      const props = {
        numInputs: 2,
        invertedInputs: [],
        rotation: 45 // Invalid angle
      }

      const connections = gateEntry.getConnections(props)

      // Should behave same as rotation: 0 for invalid angles
      expect(connections.inputs).toEqual([
        { name: '0', x: 0, y: 0 },
        { name: '1', x: 0, y: 2 }
      ])
    })
  })

  describe('rotation edge cases', () => {
    it('should handle rotation with complex inverted inputs array', () => {
      const props = {
        numInputs: 4,
        invertedInputs: [0, 2], // Invert inputs 0 and 2
        rotation: 180
      }

      const connections = gateEntry.getConnections(props)

      // 4 inputs have output at center (3, 3)
      // Input 0: (-1, 0) -> 180° rotation around (3, 3) -> (7, 6)
      // Input 1: (0, 2)  -> 180° rotation around (3, 3) -> (6, 4)
      // Input 2: (-1, 4) -> 180° rotation around (3, 3) -> (7, 2)
      // Input 3: (0, 6)  -> 180° rotation around (3, 3) -> (6, 0)
      expect(connections.inputs).toEqual([
        { name: '0', x: 7, y: 6 }, // inverted and rotated
        { name: '1', x: 6, y: 4 }, // not inverted, rotated
        { name: '2', x: 7, y: 2 }, // inverted and rotated
        { name: '3', x: 6, y: 0 } // not inverted, rotated
      ])
    })

    it('should maintain integer coordinates after rotation', () => {
      const props = {
        numInputs: 2,
        invertedInputs: [],
        rotation: 90
      }

      const connections = gateEntry.getConnections(props)

      // All coordinates should be integers
      connections.inputs.forEach(input => {
        expect(Number.isInteger(input.x)).toBe(true)
        expect(Number.isInteger(input.y)).toBe(true)
      })

      connections.outputs.forEach(output => {
        expect(Number.isInteger(output.x)).toBe(true)
        expect(Number.isInteger(output.y)).toBe(true)
      })
    })
  })
})
