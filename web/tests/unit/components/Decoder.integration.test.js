import { describe, it, expect, beforeEach } from 'vitest'
import { useCodeGenController } from '@/composables/useCodeGenController'
import { componentRegistry } from '@/utils/componentRegistry'

describe('Decoder Integration', () => {
  let codeGenController

  beforeEach(() => {
    codeGenController = useCodeGenController()
  })

  describe('Component Registry', () => {
    it('has decoder properly configured', () => {
      const config = componentRegistry.decoder
      expect(config).toBeDefined()
      expect(config.label).toBe('Decoder')
      expect(config.requiresNamedPorts).toBe(true)
      expect(config.defaultProps).toEqual({
        selectorBits: 2,
        label: 'DEC',
        selectorPosition: 'bottom',
        rotation: 0
      })
    })

    it('generates correct connections for decoder', () => {
      const config = componentRegistry.decoder
      const connections = config.getConnections({ selectorBits: 2 })

      expect(connections.inputs).toHaveLength(1)
      expect(connections.inputs[0]).toEqual({
        name: 'sel',
        x: 1,
        y: 8
      })

      expect(connections.outputs).toHaveLength(4)
      expect(connections.outputs[0]).toEqual({ name: '0', x: 2, y: 1 })
      expect(connections.outputs[1]).toEqual({ name: '1', x: 2, y: 3 })
      expect(connections.outputs[2]).toEqual({ name: '2', x: 2, y: 5 })
      expect(connections.outputs[3]).toEqual({ name: '3', x: 2, y: 7 })
    })

    it('calculates correct dimensions', () => {
      const config = componentRegistry.decoder

      // Test with 4 outputs (2 selector bits)
      let dims = config.getDimensions({ selectorBits: 2 })
      expect(dims.width).toBe(30) // 2 * GRID_SIZE (15)
      expect(dims.height).toBe(120) // 8 * GRID_SIZE

      // Test with 2 outputs (1 selector bit)
      dims = config.getDimensions({ selectorBits: 1 })
      expect(dims.width).toBe(30)
      expect(dims.height).toBe(60) // Minimum 4 grid units * 15

      // Test with 8 outputs (3 selector bits)
      dims = config.getDimensions({ selectorBits: 3 })
      expect(dims.width).toBe(30)
      expect(dims.height).toBe(240) // ((8-1)*2 + 2) * GRID_SIZE
    })
  })

  describe('Code Generation with Connections', () => {
    it('generates correct code for decoder with named ports', () => {
      const components = [
        {
          id: 'input-1',
          type: 'input',
          x: 0,
          y: 0,
          props: { bits: 2, label: 'SEL' }
        },
        {
          id: 'decoder-1',
          type: 'decoder',
          x: 4,
          y: 0,
          props: { selectorBits: 2, label: 'DEC0' }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 10,
          y: 0,
          props: { bits: 1, label: 'OUT0' }
        }
      ]

      const wires = [
        {
          startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 5, y: 8 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 6, y: 1 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 10, y: 0 }, portIndex: 0, portType: 'input' }
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

      // Check decoder instantiation
      expect(code).toContain(
        'decoder0 = plexers.Decoder(label="DEC0", selector_bits=2, js_id="decoder-1")'
      )

      // Check connections use named ports
      expect(code).toContain('circuit0.connect(input0, decoder0.input("sel"))')
      expect(code).toContain('circuit0.connect(decoder0.output("0"), output0)')
    })

    it('generates connections for all decoder outputs', () => {
      const components = [
        {
          id: 'decoder-1',
          type: 'decoder',
          x: 4,
          y: 0,
          props: { selectorBits: 2, label: 'DEC' }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 10,
          y: 0,
          props: { label: 'O0' }
        },
        {
          id: 'output-2',
          type: 'output',
          x: 10,
          y: 2,
          props: { label: 'O1' }
        },
        {
          id: 'output-3',
          type: 'output',
          x: 10,
          y: 4,
          props: { label: 'O2' }
        }
      ]

      const wires = [
        {
          startConnection: { pos: { x: 6, y: 1 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 10, y: 0 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 6, y: 3 }, portIndex: 1, portType: 'output' },
          endConnection: { pos: { x: 10, y: 2 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 6, y: 5 }, portIndex: 2, portType: 'output' },
          endConnection: { pos: { x: 10, y: 4 }, portIndex: 0, portType: 'input' }
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

      // Check all output connections
      expect(code).toContain('circuit0.connect(decoder0.output("0"), output0)')
      expect(code).toContain('circuit0.connect(decoder0.output("1"), output1)')
      expect(code).toContain('circuit0.connect(decoder0.output("2"), output2)')
    })
  })

  describe('Property Validation', () => {
    it('validates selectorBits property', () => {
      const config = componentRegistry.decoder

      // Valid range
      expect(config.defaultProps.selectorBits).toBe(2)

      // Component should handle edge cases
      const minConnections = config.getConnections({ selectorBits: 1 })
      expect(minConnections.outputs).toHaveLength(2)

      const maxConnections = config.getConnections({ selectorBits: 4 })
      expect(maxConnections.outputs).toHaveLength(16)
    })
  })
})
