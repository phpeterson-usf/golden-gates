import { describe, it, expect } from 'vitest'
import { PriorityEncoderGenerator } from '@/generators/PriorityEncoderGenerator'

describe('PriorityEncoderGenerator', () => {
  describe('Code Generation', () => {
    it('generates basic priority encoder code', () => {
      const componentData = {
        id: 'priorityEncoder-1',
        type: 'priorityEncoder',
        props: {
          numInputs: 4,
          label: 'PE0'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toBe('priorityEncoder0')
      expect(result.code).toBe('priorityEncoder0 = plexers.PriorityEncoder(num_inputs=4, label="PE0")')
    })

    it('generates code with different input counts', () => {
      const componentData = {
        id: 'priorityEncoder-2',
        type: 'priorityEncoder',
        props: {
          numInputs: 8,
          label: 'PE1'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe('priorityEncoder1 = plexers.PriorityEncoder(num_inputs=8, label="PE1")')
    })

    it('handles minimum input count', () => {
      const componentData = {
        id: 'priorityEncoder-3',
        type: 'priorityEncoder',
        props: {
          numInputs: 2,
          label: 'PE_MIN'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe('priorityEncoder2 = plexers.PriorityEncoder(num_inputs=2, label="PE_MIN")')
    })

    it('handles maximum input count', () => {
      const componentData = {
        id: 'priorityEncoder-4',
        type: 'priorityEncoder',
        props: {
          numInputs: 16,
          label: 'PE_MAX'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe('priorityEncoder3 = plexers.PriorityEncoder(num_inputs=16, label="PE_MAX")')
    })

    it('uses default values when props are missing', () => {
      const componentData = {
        id: 'priorityEncoder-5',
        type: 'priorityEncoder',
        props: {}
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe('priorityEncoder4 = plexers.PriorityEncoder(num_inputs=4, label="PE")')
    })

    it('escapes quotes in labels', () => {
      const componentData = {
        id: 'priorityEncoder-6',
        type: 'priorityEncoder',
        props: {
          numInputs: 4,
          label: 'PE"special"'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe('priorityEncoder5 = plexers.PriorityEncoder(num_inputs=4, label="PE\\"special\\"")')
    })
  })
})