import { describe, it, expect } from 'vitest'
import { DivideGenerator } from '@/generators/DivideGenerator'

describe('DivideGenerator', () => {
  describe('generate()', () => {
    it('generates basic divide code with default bits', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {}
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      expect(result.varName).toMatch(/^div\d+$/)
      expect(result.code).toBe(`${result.varName} = arithmetic.Divide(bits=8, js_id="divide-1")`)
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('generates divide with custom bits', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {
          bits: 16
        }
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Divide(bits=16, js_id="divide-1")`)
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {
          bits: 4,
          label: 'DIV0'
        }
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Divide(label="DIV0", bits=4, js_id="divide-1")`)
    })

    it('generates unique variable names for multiple instances', () => {
      const data1 = {
        id: 'divide-1',
        type: 'divide',
        props: { label: 'DIV1' }
      }
      
      const data2 = {
        id: 'divide-2',
        type: 'divide',
        props: { label: 'DIV2' }
      }
      
      const gen1 = new DivideGenerator(data1)
      const gen2 = new DivideGenerator(data2)
      
      const result1 = gen1.generate()
      const result2 = gen2.generate()
      
      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^div\d+$/)
      expect(result2.varName).toMatch(/^div\d+$/)
    })

    it('handles all valid bit counts', () => {
      const bitCounts = [1, 4, 8, 16, 32]
      
      bitCounts.forEach(bits => {
        const componentData = {
          id: `divide-${bits}`,
          type: 'divide',
          props: {
            bits: bits
          }
        }
        
        const generator = new DivideGenerator(componentData)
        const result = generator.generate()
        
        expect(result.code).toContain(`bits=${bits}`)
      })
    })

    it('escapes quotes in label', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {
          label: 'DIV "Test" Label'
        }
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      // Should escape the quotes in the label
      expect(result.code).toContain('label="DIV \\"Test\\" Label"')
    })

    it('handles missing bits prop gracefully', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {
          label: 'DIV'
          // bits is missing
        }
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      // Should use default bits of 8
      expect(result.code).toContain('bits=8')
    })

    it('generates code with consistent parameter order', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {
          label: 'TEST',
          bits: 4
        }
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      // Parameters should be in order: label="TEST", bits=4, js_id="divide-1"
      expect(result.code).toMatch(/arithmetic\.Divide\(label="TEST", bits=4, js_id="divide-1"\)/)
    })

    it('handles special characters in component id', () => {
      const componentData = {
        id: 'divide-test_123',
        type: 'divide',
        props: {
          bits: 8
        }
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toContain('js_id="divide-test_123"')
    })

    it('includes arithmetic import', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {}
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('handles empty label correctly', () => {
      const componentData = {
        id: 'divide-1',
        type: 'divide',
        props: {
          label: '',
          bits: 4
        }
      }
      
      const generator = new DivideGenerator(componentData)
      const result = generator.generate()
      
      // Should not include label parameter when empty
      expect(result.code).toBe(`${result.varName} = arithmetic.Divide(bits=4, js_id="divide-1")`)
    })
  })
})