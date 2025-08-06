import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useClipboard } from '@/composables/useClipboard'
import {
  mockCircuitElements,
  mockClipboardData,
  testUtils
} from '../../fixtures/clipboard-test-data'

describe('useClipboard', () => {
  let clipboard

  beforeEach(() => {
    clipboard = useClipboard()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with empty clipboard state', () => {
      expect(clipboard.hasClipboardData.value).toBe(false)
    })

    it('should provide all required methods', () => {
      expect(typeof clipboard.copyToClipboard).toBe('function')
      expect(typeof clipboard.cutToClipboard).toBe('function')
      expect(typeof clipboard.pasteFromClipboard).toBe('function')
      expect(typeof clipboard.clearClipboard).toBe('function')
      expect(typeof clipboard.serializeElements).toBe('function')
      expect(typeof clipboard.deserializeElements).toBe('function')
    })
  })

  describe('serializeElements', () => {
    it('should serialize empty elements', () => {
      const result = clipboard.serializeElements(mockCircuitElements.empty)

      expect(result).toMatchObject({
        version: '1.0',
        elements: {
          components: [],
          wires: [],
          junctions: []
        },
        bounds: {
          width: 0,
          height: 0
        }
      })
      expect(result.timestamp).toBeTypeOf('number')
    })

    it('should serialize single component with relative positioning', () => {
      const result = clipboard.serializeElements(mockCircuitElements.singleComponent)

      expect(result.elements.components).toHaveLength(1)
      expect(result.elements.components[0]).toMatchObject({
        id: 'input_1_1234567890',
        type: 'input',
        x: 0, // Relative to bounds.minX
        y: 0, // Relative to bounds.minY
        props: {
          label: 'A',
          bits: 1,
          base: 2,
          value: 0
        }
      })
    })

    it('should serialize complex circuit with all elements', () => {
      const result = clipboard.serializeElements(mockCircuitElements.complexCircuit)

      expect(result.elements.components).toHaveLength(5)
      expect(result.elements.wires).toHaveLength(2)
      expect(result.elements.junctions).toHaveLength(2)
    })

    it('should calculate bounds correctly', () => {
      const elements = {
        components: [
          testUtils.createMockComponent('input', { x: 10, y: 20 }),
          testUtils.createMockComponent('output', { x: 30, y: 40 })
        ],
        wires: [
          testUtils.createMockWire({
            points: [
              { x: 5, y: 15 },
              { x: 35, y: 45 }
            ]
          })
        ],
        junctions: []
      }

      const result = clipboard.serializeElements(elements)

      expect(result.bounds.originalBounds).toEqual({
        minX: 5,
        minY: 15,
        maxX: 35,
        maxY: 45
      })
    })

    it('should handle components with deep cloned props', () => {
      const component = testUtils.createMockComponent('splitter', {
        props: {
          splits: [{ low: 0, high: 3 }]
        }
      })

      const result = clipboard.serializeElements({
        components: [component],
        wires: [],
        junctions: []
      })

      // Modify original props
      component.props.splits[0].low = 999

      // Serialized props should be unchanged
      expect(result.elements.components[0].props.splits[0].low).toBe(0)
    })
  })

  describe('deserializeElements', () => {
    it('should deserialize empty clipboard data', () => {
      const clipboardData = {
        version: '1.0',
        elements: { components: [], wires: [], junctions: [] }
      }

      const result = clipboard.deserializeElements(clipboardData)

      expect(result).toEqual({
        components: [],
        wires: [],
        junctions: [],
        idMappings: {
          components: new Map(),
          wires: new Map()
        }
      })
    })

    it('should deserialize with new unique IDs', () => {
      const originalId = 'input_1_1234567890'
      const clipboardData = {
        version: '1.0',
        elements: {
          components: [
            {
              id: originalId,
              type: 'input',
              x: 0,
              y: 0,
              props: { label: 'A' }
            }
          ],
          wires: [],
          junctions: []
        }
      }

      const result = clipboard.deserializeElements(clipboardData)

      expect(result.components).toHaveLength(1)
      expect(result.components[0].id).not.toBe(originalId)
      expect(result.components[0].id).toMatch(/^input_\d+_[a-z0-9]+$/)
      expect(result.idMappings.components.get(originalId)).toBe(result.components[0].id)
    })

    it('should apply paste position correctly', () => {
      const pastePosition = { x: 10, y: 20 }
      const clipboardData = {
        version: '1.0',
        elements: {
          components: [
            {
              id: 'input_1_1234567890',
              type: 'input',
              x: 5,
              y: 7,
              props: { label: 'A' }
            }
          ],
          wires: [],
          junctions: []
        }
      }

      const result = clipboard.deserializeElements(clipboardData, pastePosition)

      expect(result.components[0].x).toBe(15) // 5 + 10
      expect(result.components[0].y).toBe(27) // 7 + 20
    })

    it('should preserve wire connection positions for geometry-based connections', () => {
      const clipboardData = {
        version: '1.0',
        elements: {
          components: [
            {
              id: 'input_1_1234567890',
              type: 'input',
              x: 5,
              y: 10,
              props: { label: 'A' }
            }
          ],
          wires: [
            {
              id: 'wire_1_1234567890',
              points: [
                { x: 0, y: 0 },
                { x: 10, y: 0 }
              ],
              startConnection: {
                pos: { x: 7, y: 11 }, // Input component output position (5+2, 10+1)
                portType: 'output'
              },
              endConnection: {
                pos: { x: 15, y: 5 }, // Some destination position
                portType: 'input'
              }
            }
          ],
          junctions: []
        }
      }

      const pastePosition = { x: 10, y: 20 }
      const result = clipboard.deserializeElements(clipboardData, pastePosition)

      // Check that positions are adjusted by paste offset
      expect(result.wires[0].startConnection.pos.x).toBe(17) // 7 + 10
      expect(result.wires[0].startConnection.pos.y).toBe(31) // 11 + 20
      expect(result.wires[0].endConnection.pos.x).toBe(25) // 15 + 10
      expect(result.wires[0].endConnection.pos.y).toBe(25) // 5 + 20

      // Check that port types are preserved
      expect(result.wires[0].startConnection.portType).toBe('output')
      expect(result.wires[0].endConnection.portType).toBe('input')
    })

    it('should handle invalid clipboard data gracefully', () => {
      const result = clipboard.deserializeElements(null)

      expect(result).toEqual({
        components: [],
        wires: [],
        junctions: []
      })
    })
  })

  describe('copyToClipboard', () => {
    it('should copy elements to internal clipboard', () => {
      const elements = mockCircuitElements.singleComponent

      const result = clipboard.copyToClipboard(elements)

      expect(clipboard.hasClipboardData.value).toBe(true)
      expect(result.operation).toBe('copy')
      expect(result.elements.components).toHaveLength(1)
    })

    it('should update clipboard stats', () => {
      clipboard.copyToClipboard(mockCircuitElements.simpleCircuit)

      const stats = clipboard.getClipboardStats()
      expect(stats.components).toBe(3)
      expect(stats.wires).toBe(2)
      expect(stats.junctions).toBe(0)
      expect(stats.operation).toBe('copy')
    })
  })

  describe('cutToClipboard', () => {
    it('should cut elements to internal clipboard', () => {
      const elements = mockCircuitElements.singleComponent

      const result = clipboard.cutToClipboard(elements)

      expect(clipboard.hasClipboardData.value).toBe(true)
      expect(result.operation).toBe('cut')
      expect(clipboard.isCutOperation()).toBe(true)
    })
  })

  describe('pasteFromClipboard', () => {
    it('should paste from internal clipboard', () => {
      // First copy something
      clipboard.copyToClipboard(mockCircuitElements.singleComponent)

      const pastePosition = { x: 5, y: 10 }
      const result = clipboard.pasteFromClipboard(pastePosition)

      expect(result.components).toHaveLength(1)
      expect(result.components[0].x).toBe(5) // 0 + 5
      expect(result.components[0].y).toBe(10) // 0 + 10
      expect(result.components[0].id).not.toBe('input_1_1234567890')
    })

    it('should return null when clipboard is empty', () => {
      const result = clipboard.pasteFromClipboard()

      expect(result).toBe(null)
    })
  })

  describe('OS clipboard integration', () => {
    it('should get clipboard data for OS clipboard', () => {
      clipboard.copyToClipboard(mockCircuitElements.singleComponent)

      const osData = clipboard.getClipboardDataForOS()

      expect(osData).toBeTypeOf('string')
      expect(JSON.parse(osData)).toMatchObject({
        version: '1.0',
        elements: {
          components: expect.any(Array),
          wires: expect.any(Array),
          junctions: expect.any(Array)
        }
      })
    })

    it('should set clipboard data from OS clipboard', () => {
      const jsonData = JSON.stringify(mockClipboardData.validClipboard)

      const result = clipboard.setClipboardDataFromOS(jsonData)

      expect(result).toBe(true)
      expect(clipboard.hasClipboardData.value).toBe(true)
    })

    it('should handle invalid OS clipboard data', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = clipboard.setClipboardDataFromOS('invalid json')

      expect(result).toBe(false)
      expect(clipboard.hasClipboardData.value).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse clipboard data from OS:',
        expect.any(SyntaxError)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('utility functions', () => {
    describe('calculateBounds', () => {
      it('should calculate bounds for components only', () => {
        const components = [
          testUtils.createMockComponent('input', { x: 10, y: 20 }),
          testUtils.createMockComponent('output', { x: 30, y: 5 })
        ]

        const bounds = clipboard.calculateBounds(components, [])

        expect(bounds).toEqual({
          minX: 10,
          minY: 5,
          maxX: 30,
          maxY: 20
        })
      })

      it('should calculate bounds for wires only', () => {
        const wires = [
          testUtils.createMockWire({
            points: [
              { x: 5, y: 15 },
              { x: 25, y: 35 }
            ]
          })
        ]

        const bounds = clipboard.calculateBounds([], wires)

        expect(bounds).toEqual({
          minX: 5,
          minY: 15,
          maxX: 25,
          maxY: 35
        })
      })

      it('should handle empty elements', () => {
        const bounds = clipboard.calculateBounds([], [])

        expect(bounds).toEqual({
          minX: 0,
          minY: 0,
          maxX: 0,
          maxY: 0
        })
      })
    })

    describe('ID generation', () => {
      it('should generate unique component IDs', () => {
        const id1 = clipboard.generateUniqueId('input')
        const id2 = clipboard.generateUniqueId('input')

        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^input_\d+_[a-z0-9]+$/)
        expect(id2).toMatch(/^input_\d+_[a-z0-9]+$/)
      })

      it('should generate unique wire IDs', () => {
        const id1 = clipboard.generateUniqueWireId()
        const id2 = clipboard.generateUniqueWireId()

        expect(id1).not.toBe(id2)
        expect(id1).toMatch(/^wire_\d+_[a-z0-9]+$/)
        expect(id2).toMatch(/^wire_\d+_[a-z0-9]+$/)
      })
    })
  })

  describe('clipboard state management', () => {
    it('should clear clipboard', () => {
      clipboard.copyToClipboard(mockCircuitElements.singleComponent)
      expect(clipboard.hasClipboardData.value).toBe(true)

      clipboard.clearClipboard()

      expect(clipboard.hasClipboardData.value).toBe(false)
      expect(clipboard.getClipboardStats().components).toBe(0)
    })

    it('should track operation type', () => {
      clipboard.copyToClipboard(mockCircuitElements.singleComponent)
      expect(clipboard.isCutOperation()).toBe(false)

      clipboard.cutToClipboard(mockCircuitElements.singleComponent)
      expect(clipboard.isCutOperation()).toBe(true)
    })

    it('should provide clipboard statistics', () => {
      clipboard.copyToClipboard(mockCircuitElements.complexCircuit)

      const stats = clipboard.getClipboardStats()
      expect(stats).toMatchObject({
        components: 5,
        wires: 2,
        junctions: 2,
        operation: 'copy',
        timestamp: expect.any(Number)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle components with no props', () => {
      const elements = {
        components: [
          {
            id: 'test_component',
            type: 'test',
            x: 0,
            y: 0
            // No props property
          }
        ],
        wires: [],
        junctions: []
      }

      const result = clipboard.serializeElements(elements)

      expect(result.elements.components[0].props).toEqual({})
    })

    it('should handle wires with no connections', () => {
      const elements = {
        components: [],
        wires: [
          {
            id: 'test_wire',
            points: [
              { x: 0, y: 0 },
              { x: 10, y: 0 }
            ]
            // No startConnection or endConnection
          }
        ],
        junctions: []
      }

      const result = clipboard.serializeElements(elements)

      expect(result.elements.wires[0].startConnection).toBe(null)
      expect(result.elements.wires[0].endConnection).toBe(null)
    })

    it('should handle large coordinates', () => {
      const elements = {
        components: [testUtils.createMockComponent('input', { x: 1000000, y: 2000000 })],
        wires: [],
        junctions: []
      }

      const result = clipboard.serializeElements(elements)

      expect(result.elements.components[0].x).toBe(0) // Relative to bounds
      expect(result.elements.components[0].y).toBe(0)
    })
  })
})
