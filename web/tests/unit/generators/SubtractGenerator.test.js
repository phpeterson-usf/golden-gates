import { describe, it, expect } from 'vitest'
import { SubtractGenerator } from '@/generators/SubtractGenerator'

describe('SubtractGenerator', () => {
  describe('generate()', () => {
    it('generates basic subtract code with default bits', () => {
      const componentData = {
        id: 'subtract-1',
        type: 'subtract',
        props: {}
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      expect(result.varName).toMatch(/^sub\d+$/)
      expect(result.code).toBe(`${result.varName} = arithmetic.Subtract(bits=8, js_id="subtract-1")`)
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('generates subtract with custom bits', () => {
      const componentData = {
        id: 'subtract-1',
        type: 'subtract',
        props: {
          bits: 16
        }
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Subtract(bits=16, js_id="subtract-1")`)
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'subtract-1',
        type: 'subtract',
        props: {
          bits: 4,
          label: 'SUB0'
        }
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Subtract(label="SUB0", bits=4, js_id="subtract-1")`)
    })

    it('generates unique variable names for multiple instances', () => {
      const data1 = {
        id: 'subtract-1',
        type: 'subtract',
        props: { label: 'SUB1' }
      }
      
      const data2 = {
        id: 'subtract-2',
        type: 'subtract',
        props: { label: 'SUB2' }
      }
      
      const gen1 = new SubtractGenerator(data1)
      const gen2 = new SubtractGenerator(data2)
      
      const result1 = gen1.generate()
      const result2 = gen2.generate()
      
      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^sub\d+$/)
      expect(result2.varName).toMatch(/^sub\d+$/)
    })

    it('handles all valid bit counts', () => {
      const bitCounts = [1, 4, 8, 16, 32]
      
      bitCounts.forEach(bits => {
        const componentData = {
          id: `subtract-${bits}`,
          type: 'subtract',
          props: {
            bits: bits
          }
        }
        
        const generator = new SubtractGenerator(componentData)
        const result = generator.generate()
        
        expect(result.code).toContain(`bits=${bits}`)
      })
    })

    it('escapes quotes in label', () => {
      const componentData = {
        id: 'subtract-1',
        type: 'subtract',
        props: {
          label: 'SUB "Test" Label'
        }
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      // Should escape the quotes in the label
      expect(result.code).toContain('label="SUB \\"Test\\" Label"')
    })

    it('handles missing bits prop gracefully', () => {
      const componentData = {
        id: 'subtract-1',
        type: 'subtract',
        props: {
          label: 'SUB'
          // bits is missing
        }
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      // Should use default bits of 8
      expect(result.code).toContain('bits=8')
    })

    it('generates code with consistent parameter order', () => {
      const componentData = {
        id: 'subtract-1',
        type: 'subtract',
        props: {
          label: 'TEST',
          bits: 4
        }
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      // Parameters should be in order: label, bits, js_id
      expect(result.code).toMatch(/arithmetic\.Subtract\(label="TEST", bits=4, js_id="subtract-1"\)/)
    })

    it('handles special characters in component id', () => {
      const componentData = {
        id: 'subtract-test_123',
        type: 'subtract',
        props: {
          bits: 8
        }
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toContain('js_id="subtract-test_123"')
    })

    it('includes arithmetic import', () => {
      const componentData = {
        id: 'subtract-1',
        type: 'subtract',
        props: {}
      }
      
      const generator = new SubtractGenerator(componentData)
      const result = generator.generate()
      
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })
  })
})