import { describe, it, expect } from 'vitest'
import { RAMGenerator } from '@/generators/RAMGenerator'

describe('RAMGenerator', () => {
  describe('generate()', () => {
    it('generates basic RAM code with default values', () => {
      const componentData = {
        id: 'ram-1',
        type: 'ram',
        props: {}
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toMatch(/^ram\d+$/)
      expect(result.code).toBe(
        `${result.varName} = memory.RAM(address_bits=4, data_bits=8, js_id="ram-1")`
      )
      expect(result.imports).toEqual(new Set(['memory']))
    })

    it('generates RAM with custom address and data bits', () => {
      const componentData = {
        id: 'ram-2',
        type: 'ram',
        props: {
          addressBits: 6,
          dataBits: 16
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toMatch(/^ram\d+$/)
      expect(result.code).toBe(
        `${result.varName} = memory.RAM(address_bits=6, data_bits=16, js_id="ram-2")`
      )
      expect(result.imports).toEqual(new Set(['memory']))
    })

    it('generates RAM with custom label', () => {
      const componentData = {
        id: 'ram-3',
        type: 'ram',
        props: {
          label: 'MainMemory'
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toMatch(/^ram\d+$/)
      expect(result.code).toBe(
        `${result.varName} = memory.RAM(label="MainMemory", address_bits=4, data_bits=8, js_id="ram-3")`
      )
      expect(result.imports).toEqual(new Set(['memory']))
    })

    it('handles minimum address bits', () => {
      const componentData = {
        id: 'ram-4',
        type: 'ram',
        props: {
          addressBits: 1
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.RAM(address_bits=1, data_bits=8, js_id="ram-4")`
      )
    })

    it('handles maximum practical address bits', () => {
      const componentData = {
        id: 'ram-5',
        type: 'ram',
        props: {
          addressBits: 16
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.RAM(address_bits=16, data_bits=8, js_id="ram-5")`
      )
    })

    it('handles different data bit sizes', () => {
      const componentData = {
        id: 'ram-6',
        type: 'ram',
        props: {
          dataBits: 32
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.RAM(address_bits=4, data_bits=32, js_id="ram-6")`
      )
    })

    it('generates unique variable names for multiple instances', () => {
      const componentData1 = {
        id: 'ram-7',
        type: 'ram',
        props: {}
      }

      const componentData2 = {
        id: 'ram-8',
        type: 'ram',
        props: {}
      }

      const generator1 = new RAMGenerator(componentData1)
      const generator2 = new RAMGenerator(componentData2)

      const result1 = generator1.generate()
      const result2 = generator2.generate()

      expect(result1.varName).not.toBe(result2.varName)
      expect(result1.varName).toMatch(/^ram\d+$/)
      expect(result2.varName).toMatch(/^ram\d+$/)
    })

    it('includes js_id parameter for reactivity support', () => {
      const componentData = {
        id: 'ram-react-test',
        type: 'ram',
        props: {
          addressBits: 8,
          dataBits: 16
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toContain('js_id="ram-react-test"')
    })

    it('preserves special characters in labels', () => {
      const componentData = {
        id: 'ram-9',
        type: 'ram',
        props: {
          label: 'Cache_L1'
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.RAM(label="Cache_L1", address_bits=4, data_bits=8, js_id="ram-9")`
      )
    })

    it('handles empty label', () => {
      const componentData = {
        id: 'ram-10',
        type: 'ram',
        props: {
          label: ''
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.RAM(address_bits=4, data_bits=8, js_id="ram-10")`
      )
    })

    it('always imports memory module', () => {
      const componentData = {
        id: 'ram-11',
        type: 'ram',
        props: {
          addressBits: 12,
          dataBits: 24,
          label: 'TestRAM'
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      expect(result.imports).toEqual(new Set(['memory']))
      expect(result.imports.has('memory')).toBe(true)
    })
  })

  describe('parameter validation', () => {
    it('handles zero address bits gracefully', () => {
      const componentData = {
        id: 'ram-zero',
        type: 'ram',
        props: {
          addressBits: 0
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      // Should fallback to default or handle gracefully
      expect(result.code).toContain('memory.RAM')
      expect(result.imports).toEqual(new Set(['memory']))
    })

    it('handles zero data bits gracefully', () => {
      const componentData = {
        id: 'ram-zero-data',
        type: 'ram',
        props: {
          dataBits: 0
        }
      }

      const generator = new RAMGenerator(componentData)
      const result = generator.generate()

      // Should fallback to default or handle gracefully
      expect(result.code).toContain('memory.RAM')
      expect(result.imports).toEqual(new Set(['memory']))
    })
  })
})
