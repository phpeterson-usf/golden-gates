import { describe, it, expect } from 'vitest'
import { DecoderGenerator } from '@/generators/DecoderGenerator'

describe('DecoderGenerator', () => {
  describe('generate()', () => {
    it('generates basic decoder code with default outputs', () => {
      const componentData = {
        id: 'decoder-1',
        type: 'decoder',
        props: {}
      }

      const generator = new DecoderGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toMatch(/^decoder\d+$/)
      expect(result.code).toBe(
        `${result.varName} = plexers.Decoder(num_outputs=4, js_id="decoder-1")`
      )
      expect(result.imports).toBeUndefined() // No imports needed for decoder
    })

    it('generates decoder with custom number of outputs', () => {
      const componentData = {
        id: 'decoder-1',
        type: 'decoder',
        props: {
          numOutputs: 8
        }
      }

      const generator = new DecoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = plexers.Decoder(num_outputs=8, js_id="decoder-1")`
      )
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'decoder-1',
        type: 'decoder',
        props: {
          numOutputs: 4,
          label: 'DEC0'
        }
      }

      const generator = new DecoderGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = plexers.Decoder(label="DEC0", num_outputs=4, js_id="decoder-1")`
      )
    })

    it('generates unique variable names for multiple instances', () => {
      const data1 = {
        id: 'decoder-1',
        type: 'decoder',
        props: { label: 'D1' }
      }

      const data2 = {
        id: 'decoder-2',
        type: 'decoder',
        props: { label: 'D2' }
      }

      const gen1 = new DecoderGenerator(data1)
      const gen2 = new DecoderGenerator(data2)

      const result1 = gen1.generate()
      const result2 = gen2.generate()

      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^decoder\d+$/)
      expect(result2.varName).toMatch(/^decoder\d+$/)
    })

    it('handles all valid output counts', () => {
      const outputCounts = [2, 4, 8, 16]

      outputCounts.forEach(count => {
        const componentData = {
          id: `decoder-${count}`,
          type: 'decoder',
          props: {
            numOutputs: count
          }
        }

        const generator = new DecoderGenerator(componentData)
        const result = generator.generate()

        expect(result.code).toContain(`num_outputs=${count}`)
      })
    })

    it('escapes quotes in label', () => {
      const componentData = {
        id: 'decoder-1',
        type: 'decoder',
        props: {
          label: 'DEC "Test" Label'
        }
      }

      const generator = new DecoderGenerator(componentData)
      const result = generator.generate()

      // Should escape the quotes in the label
      expect(result.code).toContain('label="DEC \\"Test\\" Label"')
    })
  })
})
