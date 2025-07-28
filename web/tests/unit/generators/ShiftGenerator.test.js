import { describe, it, expect } from 'vitest'
import { ShiftGenerator } from '@/generators/ShiftGenerator'

describe('ShiftGenerator', () => {
  describe('generate()', () => {
    it('generates basic shift code with default values', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {}
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      expect(result.varName).toMatch(/^shft\d+$/)
      expect(result.code).toBe(`${result.varName} = arithmetic.BarrelShifter(bits=8, mode="logical_left", js_id="shift-1")`)
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('generates shift with custom bits', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {
          bits: 16
        }
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.BarrelShifter(bits=16, mode="logical_left", js_id="shift-1")`)
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {
          bits: 4,
          label: 'SHIFTER0'
        }
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toBe(`${result.varName} = arithmetic.BarrelShifter(label="SHIFTER0", bits=4, mode="logical_left", js_id="shift-1")`)
    })

    it('handles different shift modes', () => {
      const modes = [
        { mode: 'logical_left', expected: 'logical_left' },
        { mode: 'logical_right', expected: 'logical_right' },
        { mode: 'arithmetic_right', expected: 'arithmetic_right' }
      ]
      
      modes.forEach(({ mode, expected }) => {
        const componentData = {
          id: 'shift-1',
          type: 'shift',
          props: {
            bits: 8,
            mode: mode
          }
        }
        
        const generator = new ShiftGenerator(componentData)
        const result = generator.generate()
        
        expect(result.code).toContain(`mode="${expected}"`)
      })
    })

    it('generates unique variable names for multiple instances', () => {
      const data1 = {
        id: 'shift-1',
        type: 'shift',
        props: { label: 'SHIFT1' }
      }
      
      const data2 = {
        id: 'shift-2',
        type: 'shift',
        props: { label: 'SHIFT2' }
      }
      
      const gen1 = new ShiftGenerator(data1)
      const gen2 = new ShiftGenerator(data2)
      
      const result1 = gen1.generate()
      const result2 = gen2.generate()
      
      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^shft\d+$/)
      expect(result2.varName).toMatch(/^shft\d+$/)
    })

    it('handles all valid bit counts', () => {
      const bitCounts = [1, 4, 8, 16, 32]
      
      bitCounts.forEach(bits => {
        const componentData = {
          id: `shift-${bits}`,
          type: 'shift',
          props: {
            bits: bits
          }
        }
        
        const generator = new ShiftGenerator(componentData)
        const result = generator.generate()
        
        expect(result.code).toContain(`bits=${bits}`)
      })
    })

    it('escapes quotes in label', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {
          label: 'SHIFT "Test" Label'
        }
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      // Should escape the quotes in the label
      expect(result.code).toContain('label="SHIFT \\"Test\\" Label"')
    })

    it('handles missing props gracefully', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {
          label: 'SHIFT'
          // bits and mode are missing
        }
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      // Should use default values
      expect(result.code).toContain('bits=8')
      expect(result.code).toContain('mode="logical_left"')
    })

    it('generates code with consistent parameter order', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {
          label: 'TEST',
          bits: 4,
          mode: 'logical_right'
        }
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      // Parameters should be in order: label, bits, mode, js_id
      expect(result.code).toMatch(/arithmetic\.BarrelShifter\(label="TEST", bits=4, mode="logical_right", js_id="shift-1"\)/)
    })

    it('handles special characters in component id', () => {
      const componentData = {
        id: 'shift-test_123',
        type: 'shift',
        props: {
          bits: 8
        }
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      expect(result.code).toContain('js_id="shift-test_123"')
    })

    it('includes arithmetic import', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {}
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      expect(result.imports).toEqual(new Set(['arithmetic']))
    })

    it('handles empty label correctly', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {
          label: '',
          bits: 4,
          mode: 'arithmetic_right'
        }
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      // Should not include label parameter when empty
      expect(result.code).toBe(`${result.varName} = arithmetic.BarrelShifter(bits=4, mode="arithmetic_right", js_id="shift-1")`)
    })

    it('generates proper variable name prefix', () => {
      const componentData = {
        id: 'shift-1',
        type: 'shift',
        props: {}
      }
      
      const generator = new ShiftGenerator(componentData)
      const result = generator.generate()
      
      // Should use 'shft' as prefix to match GGL specification
      expect(result.varName).toMatch(/^shft\d+$/)
    })
  })
})