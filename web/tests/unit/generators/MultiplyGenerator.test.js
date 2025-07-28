import { describe, it, expect } from 'vitest'
import { MultiplyGenerator } from '@/generators/MultiplyGenerator'

describe('MultiplyGenerator', () => {
  describe('generate()', () => {
    it('generates basic multiply code with default bits', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {}
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      expect(result.varName).toMatch(/^mul\d+$/)
      expect(result.code).toBe(`${result.varName} = arithmetic.Multiply(bits=8, js_id="multiply-1")`)
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('generates multiply with custom bits', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {
          bits: 16
        }
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Multiply(bits=16, js_id="multiply-1")`)
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {
          bits: 4,
          label: 'MUL0'
        }
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Multiply(label="MUL0", bits=4, js_id="multiply-1")`)
    })

    it('generates unique variable names for multiple instances', () => {
      const data1 = {
        id: 'multiply-1',
        type: 'multiply',
        props: { label: 'MUL1' }
      }
      
      const data2 = {
        id: 'multiply-2',
        type: 'multiply',
        props: { label: 'MUL2' }
      }
      
      const gen1 = new MultiplyGenerator(data1)
      const gen2 = new MultiplyGenerator(data2)
      
      const result1 = gen1.generate()
      const result2 = gen2.generate()
      
      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^mul\d+$/)
      expect(result2.varName).toMatch(/^mul\d+$/)
    })

    it('handles all valid bit counts', () => {
      const bitCounts = [1, 4, 8, 16, 32]
      
      bitCounts.forEach(bits => {
        const componentData = {
          id: `multiply-${bits}`,
          type: 'multiply',
          props: {
            bits: bits
          }
        }
        
        const generator = new MultiplyGenerator(componentData)
        const result = generator.generate()
        
        expect(result.code).toContain(`bits=${bits}`)
      })
    })

    it('escapes quotes in label', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {
          label: 'MUL "Test" Label'
        }
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      // Should escape the quotes in the label
      expect(result.code).toContain('label="MUL \\"Test\\" Label"')
    })

    it('handles missing bits prop gracefully', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {
          label: 'MUL'
          // bits is missing
        }
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      // Should use default bits of 8
      expect(result.code).toContain('bits=8')
    })

    it('generates code with consistent parameter order', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {
          label: 'TEST',
          bits: 4
        }
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      // Parameters should be in order: label="TEST", bits=4, js_id="multiply-1"
      expect(result.code).toMatch(/arithmetic\.Multiply\(label="TEST", bits=4, js_id="multiply-1"\)/)
    })

    it('handles special characters in component id', () => {
      const componentData = {
        id: 'multiply-test_123',
        type: 'multiply',
        props: {
          bits: 8
        }
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toContain('js_id="multiply-test_123"')
    })

    it('includes arithmetic import', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {}
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('handles empty label correctly', () => {
      const componentData = {
        id: 'multiply-1',
        type: 'multiply',
        props: {
          label: '',
          bits: 4
        }
      }
      
      const generator = new MultiplyGenerator(componentData)
      const result = generator.generate()
      
      // Should not include label parameter when empty
      expect(result.code).toBe(`${result.varName} = arithmetic.Multiply(bits=4, js_id="multiply-1")`)
    })
  })
})