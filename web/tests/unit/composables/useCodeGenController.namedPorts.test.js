import { describe, it, expect, beforeEach } from 'vitest'
import { useCodeGenController } from '@/composables/useCodeGenController'
import { componentRegistry } from '@/utils/componentRegistry'

describe('Named Ports Code Generation', () => {
  let codeGenController

  beforeEach(() => {
    codeGenController = useCodeGenController()
  })

  describe('requiresNamedPorts property', () => {
    it('components with requiresNamedPorts always use named ports', () => {
      // Verify decoder has the property
      expect(componentRegistry.decoder.requiresNamedPorts).toBe(true)
      expect(componentRegistry.register.requiresNamedPorts).toBe(true)
      
      // Components without the property
      expect(componentRegistry.input?.requiresNamedPorts).toBeUndefined()
      expect(componentRegistry.output?.requiresNamedPorts).toBeUndefined()
    })

    it('generates named ports for decoder regardless of port count', () => {
      const components = [
        {
          id: 'input-1',
          type: 'input',
          x: 0,
          y: 0,
          props: { bits: 2, label: 'IN' }
        },
        {
          id: 'decoder-1',
          type: 'decoder',
          x: 4,
          y: 0,
          props: { numOutputs: 4, label: 'DEC' }
        }
      ]

      const wires = [
        {
          startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 5, y: 8 }, portIndex: 0, portType: 'input' }
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

      // Decoder should use named input even though it only has one input
      expect(code).toContain('decoder0.input("sel")')
    })

    it('generates named ports for register', () => {
      const components = [
        {
          id: 'register-1',
          type: 'register',
          x: 4,
          y: 0,
          props: { bits: 8, label: 'REG' }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 10,
          y: 3,
          props: { bits: 8, label: 'Q' }
        }
      ]

      const wires = [
        {
          startConnection: { pos: { x: 8, y: 3 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 10, y: 3 }, portIndex: 0, portType: 'input' }
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

      // Register should use named output
      expect(code).toContain('reg0.output("Q")')
    })

    it('generates named ports for priority encoder regardless of port count', () => {
      const components = [
        {
          id: 'input-1',
          type: 'input',
          x: 0,
          y: 0,
          props: { bits: 1, label: 'IN' }
        },
        {
          id: 'priorityEncoder-1',
          type: 'priorityEncoder',
          x: 4,
          y: 0,
          props: { numInputs: 4, label: 'PE' }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 10,
          y: 0,
          props: { bits: 2, label: 'INUM' }
        }
      ]

      const wires = [
        {
          startConnection: { pos: { x: 1, y: 0 }, portIndex: 0, portType: 'output' },
          endConnection: { pos: { x: 4, y: 1 }, portIndex: 0, portType: 'input' }
        },
        {
          startConnection: { pos: { x: 7, y: 3 }, portIndex: 0, portType: 'output' },
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

      // Priority encoder should use named input and output
      expect(code).toContain('priorityEncoder0.input("0")')
      expect(code).toContain('priorityEncoder0.output("inum")')
    })

    it('components without requiresNamedPorts use simple connections when single port', () => {
      const components = [
        {
          id: 'input-1',
          type: 'input',
          x: 0,
          y: 0,
          props: { label: 'A' }
        },
        {
          id: 'not-1',
          type: 'not-gate',
          x: 4,
          y: 0,
          props: { label: 'NOT' }
        },
        {
          id: 'output-1',
          type: 'output',
          x: 8,
          y: 0,
          props: { label: 'Y' }
        }
      ]

      // Get actual connection positions from component registry
      const inputConfig = componentRegistry.input
      const notConfig = componentRegistry['not-gate']
      const outputConfig = componentRegistry.output
      
      const inputConnections = inputConfig.connections || { outputs: [{ x: 1, y: 0 }] }
      const notConnections = notConfig.connections || { inputs: [{ x: 0, y: 0 }], outputs: [{ x: 1, y: 0 }] }
      const outputConnections = outputConfig.connections || { inputs: [{ x: 0, y: 0 }] }
      
      const wires = [
        {
          startConnection: { 
            pos: { x: 0 + inputConnections.outputs[0].x, y: 0 + inputConnections.outputs[0].y }, 
            portIndex: 0, 
            portType: 'output' 
          },
          endConnection: { 
            pos: { x: 4 + notConnections.inputs[0].x, y: 0 + notConnections.inputs[0].y }, 
            portIndex: 0, 
            portType: 'input' 
          }
        },
        {
          startConnection: { 
            pos: { x: 4 + notConnections.outputs[0].x, y: 0 + notConnections.outputs[0].y }, 
            portIndex: 0, 
            portType: 'output' 
          },
          endConnection: { 
            pos: { x: 8 + outputConnections.inputs[0].x, y: 0 + outputConnections.inputs[0].y }, 
            portIndex: 0, 
            portType: 'input' 
          }
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

      // NOT gate has single input/output, so no named ports needed
      expect(code).toContain('circuit0.connect(input0, not0)')
      expect(code).toContain('circuit0.connect(not0, output0)')
      expect(code).not.toContain('.input(')
      expect(code).not.toContain('.output(')
    })

    it('handles mixed component types correctly', () => {
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
          props: { numOutputs: 4 }
        },
        {
          id: 'not-1',
          type: 'not-gate',
          x: 10,
          y: 0,
          props: {}
        }
      ]

      // Get decoder connections
      const decoderConnections = componentRegistry.decoder.getConnections({ numOutputs: 4 })
      const notConnections = componentRegistry['not-gate'].connections || { inputs: [{ x: 0, y: 0 }] }
      
      const wires = [
        {
          startConnection: { 
            pos: { x: 1, y: 0 }, 
            portIndex: 0, 
            portType: 'output' 
          },
          endConnection: { 
            pos: { x: 4 + decoderConnections.inputs[0].x, y: 0 + decoderConnections.inputs[0].y }, 
            portIndex: 0, 
            portType: 'input' 
          }
        },
        {
          startConnection: { 
            pos: { x: 4 + decoderConnections.outputs[0].x, y: 0 + decoderConnections.outputs[0].y }, 
            portIndex: 0, 
            portType: 'output' 
          },
          endConnection: { 
            pos: { x: 10 + notConnections.inputs[0].x, y: 0 + notConnections.inputs[0].y }, 
            portIndex: 0, 
            portType: 'input' 
          }
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

      // Decoder uses named ports
      expect(code).toContain('decoder0.input("sel")')
      expect(code).toContain('decoder0.output("0")')
      
      // NOT gate uses simple connection
      expect(code).toContain(', not0)')
    })
  })
})