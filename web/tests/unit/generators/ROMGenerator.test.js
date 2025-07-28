import { describe, it, expect } from 'vitest'
import { ROMGenerator } from '@/generators/ROMGenerator'

describe('ROMGenerator', () => {
  describe('generate()', () => {
    it('generates basic ROM code with default values', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {}
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      expect(result.varName).toMatch(/^rom\d+$/)
      // Default 4 address bits = 16 cells, all filled with 0
      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=4, data_bits=8, data=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], js_id="rom-1")`
      )
      expect(result.imports).toEqual(new Set(['memory']))
    })

    it('generates ROM with custom address and data bits', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 6,
          dataBits: 16
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      // 6 address bits = 64 cells, all filled with 0
      const expectedZeros = new Array(64).fill(0).join(', ')
      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=6, data_bits=16, data=[${expectedZeros}], js_id="rom-1")`
      )
    })

    it('includes label when provided', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 4,
          dataBits: 8,
          label: 'MainROM'
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.ROM(label="MainROM", address_bits=4, data_bits=8, data=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], js_id="rom-1")`
      )
    })

    it('includes data array when provided', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 4,
          dataBits: 8,
          data: [0, 255, 128, 64, 32, 16, 8, 4]
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      // 4 address bits = 16 cells, first 8 from data, rest padded with 0
      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=4, data_bits=8, data=[0, 255, 128, 64, 32, 16, 8, 4, 0, 0, 0, 0, 0, 0, 0, 0], js_id="rom-1")`
      )
    })

    it('handles empty data array', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          data: []
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      // Empty data still gets padded to full address space
      expect(result.code).toContain('data=[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]')
    })

    it('handles large data values (32-bit)', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 2,
          dataBits: 32,
          data: [0x02a502b3, 0x02b282b3, 0x02c50333, 0x00628533]
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      // Use the correct decimal values for these hex numbers
      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=2, data_bits=32, data=[44368563, 45253299, 46465843, 6456627], js_id="rom-1")`
      )
    })

    it('truncates data array to match address space', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 2, // Only 4 cells (2^2)
          dataBits: 8,
          data: [1, 2, 3, 4, 5, 6, 7, 8] // 8 values, should truncate to 4
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=2, data_bits=8, data=[1, 2, 3, 4], js_id="rom-1")`
      )
    })

    it('pads data array to match address space', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 3, // 8 cells (2^3)
          dataBits: 8,
          data: [1, 2, 3] // Only 3 values, should pad to 8
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=3, data_bits=8, data=[1, 2, 3, 0, 0, 0, 0, 0], js_id="rom-1")`
      )
    })

    it('clamps data values to maximum for data bits', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 2,
          dataBits: 4, // Max value should be 15 (2^4 - 1)
          data: [10, 20, 30, 40] // Values > 15 should be clamped
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=2, data_bits=4, data=[10, 15, 15, 15], js_id="rom-1")`
      )
    })

    it('handles negative values by clamping to 0', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {
          addressBits: 2,
          dataBits: 8,
          data: [-5, 0, 10, -1]
        }
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      expect(result.code).toBe(
        `${result.varName} = memory.ROM(address_bits=2, data_bits=8, data=[0, 0, 10, 0], js_id="rom-1")`
      )
    })

    it('generates unique variable names for multiple ROMs', () => {
      const componentData1 = { id: 'rom-1', type: 'rom', props: {} }
      const componentData2 = { id: 'rom-2', type: 'rom', props: {} }

      const generator1 = new ROMGenerator(componentData1)
      const generator2 = new ROMGenerator(componentData2)

      const result1 = generator1.generate()
      const result2 = generator2.generate()

      expect(result1.varName).not.toBe(result2.varName)
    })

    it('always includes memory import', () => {
      const componentData = {
        id: 'rom-1',
        type: 'rom',
        props: {}
      }

      const generator = new ROMGenerator(componentData)
      const result = generator.generate()

      expect(result.imports).toEqual(new Set(['memory']))
    })
  })
})
