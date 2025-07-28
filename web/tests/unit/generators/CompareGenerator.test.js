import { describe, it, expect } from 'vitest'
import { CompareGenerator } from '@/generators/CompareGenerator'

describe('CompareGenerator', () => {
  describe('generate()', () => {
    it('generates basic compare code with default bits', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {}
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      expect(result.varName).toMatch(/^comp\d+$/)
      expect(result.code).toBe(`${result.varName} = arithmetic.Comparator(bits=8, js_id="compare-1")`)
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('generates compare with custom bits', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {
          bits: 16
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Comparator(bits=16, js_id="compare-1")`)
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {
          bits: 4,
          label: 'COMP0'
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.Comparator(label="COMP0", bits=4, js_id="compare-1")`)
    })

    it('generates unique variable names for multiple instances', () => {
      const data1 = {
        id: 'compare-1',
        type: 'compare',
        props: { label: 'COMP1' }
      }
      
      const data2 = {
        id: 'compare-2',
        type: 'compare',
        props: { label: 'COMP2' }
      }
      
      const gen1 = new CompareGenerator(data1)
      const gen2 = new CompareGenerator(data2)
      
      const result1 = gen1.generate()
      const result2 = gen2.generate()
      
      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^comp\d+$/)
      expect(result2.varName).toMatch(/^comp\d+$/)
    })

    it('handles all valid bit counts', () => {
      const bitCounts = [1, 4, 8, 16, 32]
      
      bitCounts.forEach(bits => {
        const componentData = {
          id: `compare-${bits}`,
          type: 'compare',
          props: {
            bits: bits
          }
        }
        
        const generator = new CompareGenerator(componentData)
        const result = generator.generate()
        
        expect(result.code).toContain(`bits=${bits}`)
      })
    })

    it('escapes quotes in label', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {
          label: 'COMP "Test" Label'
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      // Should escape the quotes in the label
      expect(result.code).toContain('label="COMP \\"Test\\" Label"')
    })

    it('handles missing bits prop gracefully', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {
          label: 'COMP'
          // bits is missing
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      // Should use default bits of 8
      expect(result.code).toContain('bits=8')
    })

    it('generates code with consistent parameter order', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {
          label: 'TEST',
          bits: 4
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      // Parameters should be in order: label="TEST", bits=4, js_id="compare-1"
      expect(result.code).toMatch(/arithmetic\.Comparator\(label="TEST", bits=4, js_id="compare-1"\)/)
    })

    it('handles special characters in component id', () => {
      const componentData = {
        id: 'compare-test_123',
        type: 'compare',
        props: {
          bits: 8
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toContain('js_id="compare-test_123"')
    })

    it('includes arithmetic import', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {}
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('handles empty label correctly', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {
          label: '',
          bits: 4
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      // Should not include label parameter when empty
      expect(result.code).toBe(`${result.varName} = arithmetic.Comparator(bits=4, js_id="compare-1")`)
    })

    it('generates correct class name Comparator', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {
          label: 'COMP',
          bits: 8
        }
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      // Should use arithmetic.Comparator (not Compare)
      expect(result.code).toContain('arithmetic.Comparator(')
    })

    it('generates proper variable name prefix', () => {
      const componentData = {
        id: 'compare-1',
        type: 'compare',
        props: {}
      }
      
      const generator = new CompareGenerator(componentData)
      const result = generator.generate()
      
      // Should use 'comp' as prefix to match GGL specification
      expect(result.varName).toMatch(/^comp\d+$/)
    })
  })
})