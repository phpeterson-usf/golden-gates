import { describe, it, expect } from 'vitest'
import { ClockGenerator } from '@/generators/ClockGenerator'

describe('ClockGenerator', () => {
  describe('generate()', () => {
    it('generates basic clock code with default frequency', () => {
      const componentData = {
        id: 'clock-1',
        type: 'clock',
        props: {}
      }

      const generator = new ClockGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toMatch(/^clk\d+$/)
      expect(result.code).toBe(`${result.varName} = io.Clock(frequency=1, js_id="clock-1")`)
      expect(result.imports).toBeUndefined() // No imports needed for clock
    })

    it('generates clock with custom frequency', () => {
      const componentData = {
        id: 'clock-1',
        type: 'clock',
        props: {
          frequency: 100
        }
      }

      const generator = new ClockGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(`${result.varName} = io.Clock(frequency=100, js_id="clock-1")`)
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'clock-1',
        type: 'clock',
        props: {
          frequency: 50,
          label: 'SYSCLK'
        }
      }

      const generator = new ClockGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = io.Clock(label="SYSCLK", frequency=50, js_id="clock-1")`
      )
    })

    it('generates unique variable names for multiple instances', () => {
      const data1 = {
        id: 'clock-1',
        type: 'clock',
        props: { label: 'CLK1' }
      }

      const data2 = {
        id: 'clock-2',
        type: 'clock',
        props: { label: 'CLK2' }
      }

      const gen1 = new ClockGenerator(data1)
      const gen2 = new ClockGenerator(data2)

      const result1 = gen1.generate()
      const result2 = gen2.generate()

      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^clk\d+$/)
      expect(result2.varName).toMatch(/^clk\d+$/)
    })

    it('handles all valid frequency values', () => {
      const frequencies = [1, 10, 100, 500, 1000]

      frequencies.forEach(freq => {
        const componentData = {
          id: `clock-${freq}`,
          type: 'clock',
          props: {
            frequency: freq
          }
        }

        const generator = new ClockGenerator(componentData)
        const result = generator.generate()

        expect(result.code).toContain(`frequency=${freq}`)
      })
    })

    it('escapes quotes in label', () => {
      const componentData = {
        id: 'clock-1',
        type: 'clock',
        props: {
          label: 'CLK "Main" Signal'
        }
      }

      const generator = new ClockGenerator(componentData)
      const result = generator.generate()

      // Should escape the quotes in the label
      expect(result.code).toContain('label="CLK \\"Main\\" Signal"')
    })

    it('handles edge case frequency values', () => {
      // Test minimum frequency
      const minData = {
        id: 'clock-min',
        type: 'clock',
        props: { frequency: 1 }
      }

      const minGenerator = new ClockGenerator(minData)
      const minResult = minGenerator.generate()
      expect(minResult.code).toContain('frequency=1')

      // Test maximum frequency
      const maxData = {
        id: 'clock-max',
        type: 'clock',
        props: { frequency: 1000 }
      }

      const maxGenerator = new ClockGenerator(maxData)
      const maxResult = maxGenerator.generate()
      expect(maxResult.code).toContain('frequency=1000')
    })

    it('handles missing frequency prop gracefully', () => {
      const componentData = {
        id: 'clock-1',
        type: 'clock',
        props: {
          label: 'CLK'
          // frequency is missing
        }
      }

      const generator = new ClockGenerator(componentData)
      const result = generator.generate()

      // Should use default frequency of 1
      expect(result.code).toContain('frequency=1')
    })

    it('generates code with consistent parameter order', () => {
      const componentData = {
        id: 'clock-1',
        type: 'clock',
        props: {
          label: 'TEST',
          frequency: 42
        }
      }

      const generator = new ClockGenerator(componentData)
      const result = generator.generate()

      // Label should come first, then frequency, then js_id
      expect(result.code).toMatch(/io\.Clock\(label="TEST", frequency=42, js_id="clock-1"\)/)
    })

    it('handles special characters in component id', () => {
      const componentData = {
        id: 'clock-test_123',
        type: 'clock',
        props: {
          frequency: 10
        }
      }

      const generator = new ClockGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toContain('js_id="clock-test_123"')
    })
  })
})
