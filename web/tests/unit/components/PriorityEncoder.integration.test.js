import { describe, it, expect, beforeEach } from 'vitest'
import { useCodeGenController } from '@/composables/useCodeGenController'
import { componentRegistry } from '@/utils/componentRegistry'

describe('PriorityEncoder Integration', () => {
  let codeGenController

  beforeEach(() => {
    codeGenController = useCodeGenController()
  })

  describe('Component Registry', () => {
    it('has priority encoder properly configured', () => {
      const config = componentRegistry.priorityEncoder
      expect(config).toBeDefined()
      expect(config.label).toBe('Priority Encoder')
      expect(config.requiresNamedPorts).toBe(true)
      expect(config.defaultProps).toEqual({
        selectorBits: 2,
        label: 'PE',
        rotation: 0
      })
    })

    it('generates correct connections for priority encoder', () => {
      const config = componentRegistry.priorityEncoder
      const connections = config.getConnections({ selectorBits: 2 })

      // Should have 4 inputs
      expect(connections.inputs).toHaveLength(4)
      expect(connections.inputs[0]).toEqual({ name: '0', x: 0, y: 1 })
      expect(connections.inputs[1]).toEqual({ name: '1', x: 0, y: 3 })
      expect(connections.inputs[2]).toEqual({ name: '2', x: 0, y: 5 })
      expect(connections.inputs[3]).toEqual({ name: '3', x: 0, y: 7 })

      // Should have exactly 2 outputs (inum and any)
      expect(connections.outputs).toHaveLength(2)
      expect(connections.outputs[0]).toEqual({ name: 'inum', x: 3, y: 3 }) // 1/3 of height=8
      expect(connections.outputs[1]).toEqual({ name: 'any', x: 3, y: 5 }) // 2/3 of height=8
    })

    it('calculates correct dimensions', () => {
      const config = componentRegistry.priorityEncoder

      // Test with 4 inputs (2 selector bits)
      let dims = config.getDimensions({ selectorBits: 2 })
      expect(dims.width).toBe(45) // 3 * GRID_SIZE (15)
      expect(dims.height).toBe(120) // 8 * GRID_SIZE

      // Test with 2 inputs (1 selector bit)
      dims = config.getDimensions({ selectorBits: 1 })
      expect(dims.width).toBe(45)
      expect(dims.height).toBe(90) // Minimum 6 grid units * 15

      // Test with 8 inputs (3 selector bits)
      dims = config.getDimensions({ selectorBits: 3 })
      expect(dims.width).toBe(45)
      expect(dims.height).toBe(240) // ((8-1)*2 + 2) * GRID_SIZE = 16 * 15
    })
  })

  describe('Code Generation with Connections', () => {
    it('generates correct code for priority encoder with named ports', () => {
      const components = [
        {
          id: 'input-1',
          type: 'input',
          x: 0,
          y: 0,
          props: { bits: 1, label: 'IN0' }
        },
        {
          id: 'input-2',
          type: 'input',
          x: 0,
          y: 2,
          props: { bits: 1, label: 'IN1' }
        },
        {
          id: 'priorityEncoder-1',
          type: 'priorityEncoder',
          x: 4,
          y: 0,
          props: { selectorBits: 2, label: 'PE0' }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 10,
          y: 0,
          props: { bits: 2, label: 'INUM' }
        },
        {
          id: 'output-2',
          type: 'output',
          x: 10,
          y: 2,
          props: { bits: 1, label: 'ANY' }
        }
      ]

      const wires = [
        {
          startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 4, y: 1 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 1, y: 2 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 4, y: 3 }, portIndex: 1, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 7, y: 3 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 10, y: 0 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 7, y: 5 }, portIndex: 1, portType: 'output' },
          endConnection: { pos: { x: 10, y: 2 }, portIndex: 0, portType: 'input' }
        }
      ]

      const result = codeGenController.generateGglProgram(
        components,
        wires,
        [],
        {},
        {},
        null,
        false
      )
      const code = result.code

      // Check priority encoder instantiation
      expect(code).toContain(
        'priorityEncoder0 = plexers.PriorityEncoder(label="PE0", selector_bits=2, js_id="priorityEncoder-1")'
      )

      // Check connections use named ports
      expect(code).toContain('circuit0.connect(input0, priorityEncoder0.input("0"))')
      expect(code).toContain('circuit0.connect(input1, priorityEncoder0.input("1"))')
      expect(code).toContain('circuit0.connect(priorityEncoder0.output("inum"), output0)')
      expect(code).toContain('circuit0.connect(priorityEncoder0.output("any"), output1)')
    })

    it('generates connections for all priority encoder inputs and outputs', () => {
      const components = [
        {
          id: 'priorityEncoder-1',
          type: 'priorityEncoder',
          x: 4,
          y: 0,
          props: { selectorBits: 2, label: 'PE' }
        },
        {
          id: 'input-1',
          type: 'input',
          x: 0,
          y: 0,
          props: { label: 'I0' }
        },
        {
          id: 'input-2',
          type: 'input',
          x: 0,
          y: 2,
          props: { label: 'I1' }
        },
        {
          id: 'input-3',
          type: 'input',
          x: 0,
          y: 4,
          props: { label: 'I2' }
        },
        {
          id: 'input-4',
          type: 'input',
          x: 0,
          y: 6,
          props: { label: 'I3' }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 10,
          y: 0,
          props: { label: 'INUM' }
        },
        {
          id: 'output-2',
          type: 'output',
          x: 10,
          y: 2,
          props: { label: 'ANY' }
        }
      ]

      const wires = [
        {
          startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 4, y: 1 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 1, y: 2 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 4, y: 3 }, portIndex: 1, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 1, y: 4 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 4, y: 5 }, portIndex: 2, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 1, y: 6 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 4, y: 7 }, portIndex: 3, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 7, y: 3 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 10, y: 0 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 7, y: 5 }, portIndex: 1, portType: 'output' },
          endConnection: { pos: { x: 10, y: 2 }, portIndex: 0, portType: 'input' }
        }
      ]

      const result = codeGenController.generateGglProgram(
        components,
        wires,
        [],
        {},
        {},
        null,
        false
      )
      const code = result.code

      // Check all input connections
      expect(code).toContain('circuit0.connect(input0, priorityEncoder0.input("0"))')
      expect(code).toContain('circuit0.connect(input1, priorityEncoder0.input("1"))')
      expect(code).toContain('circuit0.connect(input2, priorityEncoder0.input("2"))')
      expect(code).toContain('circuit0.connect(input3, priorityEncoder0.input("3"))')

      // Check all output connections
      expect(code).toContain('circuit0.connect(priorityEncoder0.output("inum"), output0)')
      expect(code).toContain('circuit0.connect(priorityEncoder0.output("any"), output1)')
    })
  })

  describe('Property Validation', () => {
    it('validates selectorBits property', () => {
      const config = componentRegistry.priorityEncoder

      // Valid range
      expect(config.defaultProps.selectorBits).toBe(2)

      // Component should handle edge cases
      const minConnections = config.getConnections({ selectorBits: 1 })
      expect(minConnections.inputs).toHaveLength(2)
      expect(minConnections.outputs).toHaveLength(2) // Always inum and any

      const maxConnections = config.getConnections({ selectorBits: 4 })
      expect(maxConnections.inputs).toHaveLength(16)
      expect(maxConnections.outputs).toHaveLength(2) // Always inum and any
    })
  })
})
