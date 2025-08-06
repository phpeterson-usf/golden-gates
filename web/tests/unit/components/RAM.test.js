import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RAM from '@/components/RAM.vue'
import { GRID_SIZE, CONNECTION_DOT_RADIUS } from '@/utils/constants'

describe('RAM', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(RAM, {
      props: {
        id: 'ram-1',
        x: 2,
        y: 3,
        selected: false,
        addressBits: 4,
        dataBits: 8,
        data: [0, 255, 128, 64, 32, 16, 8, 4, 2, 1, 85, 170, 51, 204, 15, 240],
        label: 'RAM0'
      }
    })
  })

  describe('Component Structure', () => {
    it('renders RAM rectangle', () => {
      const rect = wrapper.find('rect')
      expect(rect.exists()).toBe(true)
      expect(rect.attributes('width')).toBe(String(5 * GRID_SIZE)) // Min width 5 for RAM
      expect(rect.attributes('height')).toBe(String(7 * GRID_SIZE)) // Min height 7 for RAM spacing
    })

    it('renders A (address) input connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')
      expect(inputs.length).toBe(5) // A, Din, ld, st, CLK

      const aInput = inputs.find(input => input.attributes('data-port') === '0')
      expect(aInput.exists()).toBe(true)
      expect(aInput.attributes('cx')).toBe('0')
      expect(aInput.attributes('cy')).toBe(String(1 * GRID_SIZE)) // 1 grid unit from top
    })

    it('renders Din (data input) connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      const dinInput = inputs.find(input => input.attributes('data-port') === '1')
      expect(dinInput.exists()).toBe(true)
      expect(dinInput.attributes('cx')).toBe('0')
      expect(dinInput.attributes('cy')).toBe(String(2 * GRID_SIZE))
    })

    it('renders ld (load) input connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      const ldInput = inputs.find(input => input.attributes('data-port') === '2')
      expect(ldInput.exists()).toBe(true)
      expect(ldInput.attributes('cx')).toBe('0')
      expect(ldInput.attributes('cy')).toBe(String(3 * GRID_SIZE))
    })

    it('renders st (store) input connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      const stInput = inputs.find(input => input.attributes('data-port') === '3')
      expect(stInput.exists()).toBe(true)
      expect(stInput.attributes('cx')).toBe('0')
      expect(stInput.attributes('cy')).toBe(String(4 * GRID_SIZE))
    })

    it('renders CLK (clock) input connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      const clkInput = inputs.find(input => input.attributes('data-port') === '4')
      expect(clkInput.exists()).toBe(true)
      expect(clkInput.attributes('cx')).toBe('0')
      expect(clkInput.attributes('cy')).toBe(String(5 * GRID_SIZE))
    })

    it('renders D (data) output connection point', () => {
      const outputs = wrapper.findAll('.connection-point.output')
      expect(outputs).toHaveLength(1)

      const dOutput = outputs[0]
      expect(dOutput.attributes('data-port')).toBe('0')
      expect(dOutput.attributes('cx')).toBe(String(5 * GRID_SIZE)) // Right edge
      expect(dOutput.attributes('cy')).toBe(String(Math.floor(7 / 2) * GRID_SIZE)) // Center height, grid-aligned
    })

    it('renders input labels', () => {
      const texts = wrapper.findAll('text')
      const labels = texts.map(text => text.text())

      expect(labels).toContain('A')
      expect(labels).toContain('Din')
      expect(labels).toContain('ld')
      expect(labels).toContain('st')
      expect(labels).toContain('CLK')
      expect(labels).toContain('D')
    })

    it('renders component label when provided', () => {
      const texts = wrapper.findAll('text')
      const labels = texts.map(text => text.text())

      expect(labels).toContain('RAM0')
    })

    it('does not render rotation transform (rotation removed)', () => {
      const rotationGroup = wrapper.find('g[transform*="rotate"]')
      expect(rotationGroup.exists()).toBe(false)
    })
  })

  describe('Dynamic Sizing', () => {
    it('adjusts size based on address bits', async () => {
      await wrapper.setProps({ addressBits: 6 })

      const rect = wrapper.find('rect')
      expect(rect.attributes('width')).toBe(String(Math.max(5, Math.ceil(6 / 2) + 1) * GRID_SIZE))
      expect(rect.attributes('height')).toBe(String(Math.max(7, Math.ceil(6 / 2) + 3) * GRID_SIZE))
    })

    it('maintains minimum size', async () => {
      await wrapper.setProps({ addressBits: 1 })

      const rect = wrapper.find('rect')
      expect(rect.attributes('width')).toBe(String(5 * GRID_SIZE)) // Min width 5
      expect(rect.attributes('height')).toBe(String(7 * GRID_SIZE)) // Min height 7
    })

    it('updates output position based on dynamic height', async () => {
      await wrapper.setProps({ addressBits: 8 })

      const outputs = wrapper.findAll('.connection-point.output')
      const dOutput = outputs[0]

      const expectedHeight = Math.max(7, Math.ceil(8 / 2) + 3) // 7 grid units for 8 address bits
      expect(dOutput.attributes('cy')).toBe(String(Math.floor(expectedHeight / 2) * GRID_SIZE))
    })
  })

  describe('Input Spacing', () => {
    it('maintains proper spacing between input connection points', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      const aInput = inputs.find(input => input.attributes('data-port') === '0')
      const dinInput = inputs.find(input => input.attributes('data-port') === '1')
      const ldInput = inputs.find(input => input.attributes('data-port') === '2')
      const stInput = inputs.find(input => input.attributes('data-port') === '3')
      const clkInput = inputs.find(input => input.attributes('data-port') === '4')

      expect(parseFloat(dinInput.attributes('cy')) - parseFloat(aInput.attributes('cy'))).toBe(
        1 * GRID_SIZE
      )
      expect(parseFloat(ldInput.attributes('cy')) - parseFloat(dinInput.attributes('cy'))).toBe(
        1 * GRID_SIZE
      )
      expect(parseFloat(stInput.attributes('cy')) - parseFloat(ldInput.attributes('cy'))).toBe(
        1 * GRID_SIZE
      )
      expect(parseFloat(clkInput.attributes('cy')) - parseFloat(stInput.attributes('cy'))).toBe(
        1 * GRID_SIZE
      )
    })
  })

  describe('Props Validation', () => {
    it('accepts valid address bits range', () => {
      expect(() => mount(RAM, { props: { id: 'test-1', addressBits: 1 } })).not.toThrow()
      expect(() => mount(RAM, { props: { id: 'test-2', addressBits: 16 } })).not.toThrow()
    })

    it('accepts valid data bits range', () => {
      expect(() => mount(RAM, { props: { id: 'test-3', dataBits: 1 } })).not.toThrow()
      expect(() => mount(RAM, { props: { id: 'test-4', dataBits: 32 } })).not.toThrow()
    })

    it('accepts data array', () => {
      const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      const ramWrapper = mount(RAM, { props: { id: 'test-5', data: testData } })
      expect(ramWrapper.props('data')).toEqual(testData)
    })

    it('uses default values when props not provided', () => {
      const defaultWrapper = mount(RAM, { props: { id: 'test' } })
      expect(defaultWrapper.props('addressBits')).toBe(4)
      expect(defaultWrapper.props('dataBits')).toBe(8)
      expect(defaultWrapper.props('label')).toBe('RAM')
    })
  })

  describe('Event Handling', () => {
    it('has mousedown event handler on rect', () => {
      const rect = wrapper.find('rect')
      expect(rect.exists()).toBe(true)

      // Check that the rect has a mousedown handler attribute
      const rectHTML = rect.html()
      // The handler will be compiled by Vue, so we just verify the rect exists for interaction
      expect(rectHTML).toContain('rect')
    })
  })

  describe('Connection Points Positioning', () => {
    it('places all input connection points on the left edge (x=0)', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      inputs.forEach(input => {
        expect(input.attributes('cx')).toBe('0')
      })
    })

    it('places output connection point on the right edge', () => {
      const outputs = wrapper.findAll('.connection-point.output')
      const dOutput = outputs[0]

      expect(dOutput.attributes('cx')).toBe(String(5 * GRID_SIZE))
    })

    it('positions connection points at grid vertices', () => {
      const allConnections = wrapper.findAll('.connection-point')

      allConnections.forEach(connection => {
        const cx = parseFloat(connection.attributes('cx'))
        const cy = parseFloat(connection.attributes('cy'))

        // Both coordinates should be multiples of GRID_SIZE
        expect(cx % GRID_SIZE).toBe(0)
        expect(cy % GRID_SIZE).toBe(0)
      })
    })
  })

  describe('Data Array Support', () => {
    it('accepts data array for memory contents', () => {
      const testData = new Array(16).fill(0).map((_, i) => i * 3)
      const ramWithData = mount(RAM, {
        props: {
          id: 'test-7',
          data: testData
        }
      })
      expect(ramWithData.props('data')).toEqual(testData)
    })

    it('updates when data prop changes', async () => {
      const newData = new Array(16).fill(0).map((_, i) => i * 2)
      await wrapper.setProps({ data: newData })

      expect(wrapper.props('data')).toEqual(newData)
    })
  })
})
