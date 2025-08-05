import { describe, it, expect } from 'vitest'
import { PriorityEncoderGenerator } from '@/generators/PriorityEncoderGenerator'

describe('PriorityEncoderGenerator', () => {
  describe('Code Generation', () => {
    it('generates basic priority encoder code', () => {
      const componentData = {
        id: 'priorityEncoder-1',
        type: 'priorityEncoder',
        props: {
          selectorBits: 2,
          label: 'PE0'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toBe('priorityEncoder0')
      expect(result.code).toBe(
        'priorityEncoder0 = plexers.PriorityEncoder(label="PE0", selector_bits=2, js_id="priorityEncoder-1")'
      )
    })

    it('generates code with different selector bits', () => {
      const componentData = {
        id: 'priorityEncoder-2',
        type: 'priorityEncoder',
        props: {
          selectorBits: 3,
          label: 'PE1'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        'priorityEncoder1 = plexers.PriorityEncoder(label="PE1", selector_bits=3, js_id="priorityEncoder-2")'
      )
    })

    it('handles minimum selector bits', () => {
      const componentData = {
        id: 'priorityEncoder-3',
        type: 'priorityEncoder',
        props: {
          selectorBits: 1,
          label: 'PE_MIN'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        'priorityEncoder2 = plexers.PriorityEncoder(label="PE_MIN", selector_bits=1, js_id="priorityEncoder-3")'
      )
    })

    it('handles maximum selector bits', () => {
      const componentData = {
        id: 'priorityEncoder-4',
        type: 'priorityEncoder',
        props: {
          selectorBits: 4,
          label: 'PE_MAX'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        'priorityEncoder3 = plexers.PriorityEncoder(label="PE_MAX", selector_bits=4, js_id="priorityEncoder-4")'
      )
    })

    it('uses default values when props are missing', () => {
      const componentData = {
        id: 'priorityEncoder-5',
        type: 'priorityEncoder',
        props: {}
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        'priorityEncoder4 = plexers.PriorityEncoder(label="PE", selector_bits=2, js_id="priorityEncoder-5")'
      )
    })

    it('escapes quotes in labels', () => {
      const componentData = {
        id: 'priorityEncoder-6',
        type: 'priorityEncoder',
        props: {
          selectorBits: 2,
          label: 'PE"special"'
        }
      }

      const generator = new PriorityEncoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        'priorityEncoder5 = plexers.PriorityEncoder(label="PE\\"special\\"", selector_bits=2, js_id="priorityEncoder-6")'
      )
    })
  })
})
