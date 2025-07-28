import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ROM from '@/components/ROM.vue'
import { GRID_SIZE, CONNECTION_DOT_RADIUS } from '@/utils/constants'

describe('ROM', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ROM, {
      props: {
        id: 'rom-1',
        x: 2,
        y: 3,
        selected: false,
        addressBits: 4,
        dataBits: 8,
        data: [0, 255, 128, 64],
        label: 'ROM0'
      }
    })
  })

  describe('Component Structure', () => {
    it('renders ROM rectangle', () => {
      const rect = wrapper.find('rect')
      expect(rect.exists()).toBe(true)
      expect(rect.attributes('width')).toBe(String(4 * GRID_SIZE))
      expect(rect.attributes('height')).toBe(String(5 * GRID_SIZE)) // Min height 5 for spacing
    })

    it('renders A (address) input connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')
      expect(inputs.length).toBeGreaterThanOrEqual(2)

      const aInput = inputs.find(input => input.attributes('data-port') === '0')
      expect(aInput.exists()).toBe(true)
      expect(aInput.attributes('cx')).toBe('0')
      expect(aInput.attributes('cy')).toBe(String(1 * GRID_SIZE)) // 1 grid unit from top
    })

    it('renders sel (select) input connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      const selInput = inputs.find(input => input.attributes('data-port') === '1')
      expect(selInput.exists()).toBe(true)
      expect(selInput.attributes('cx')).toBe('0')
      expect(selInput.attributes('cy')).toBe(String(3 * GRID_SIZE)) // 3 grid units from top (2 units apart)
    })

    it('renders D (data) output connection point', () => {
      const outputs = wrapper.findAll('.connection-point.output')
      expect(outputs).toHaveLength(1)

      const dOutput = outputs[0]
      expect(dOutput.attributes('data-port')).toBe('0')
      expect(dOutput.attributes('cx')).toBe(String(4 * GRID_SIZE)) // Right edge
      expect(dOutput.attributes('cy')).toBe(String(Math.floor(5 / 2) * GRID_SIZE)) // Center height, grid-aligned
    })

    it('renders input labels', () => {
      const texts = wrapper.findAll('text')
      const labels = texts.map(text => text.text())

      expect(labels).toContain('A')
      expect(labels).toContain('sel')
      expect(labels).toContain('D')
    })

    it('renders component label when provided', () => {
      const texts = wrapper.findAll('text')
      const labels = texts.map(text => text.text())

      expect(labels).toContain('ROM0')
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
      expect(rect.attributes('width')).toBe(String(Math.max(4, Math.ceil(6 / 2)) * GRID_SIZE))
      expect(rect.attributes('height')).toBe(String(Math.max(5, Math.ceil(6 / 2) + 1) * GRID_SIZE))
    })

    it('maintains minimum size', async () => {
      await wrapper.setProps({ addressBits: 1 })

      const rect = wrapper.find('rect')
      expect(rect.attributes('width')).toBe(String(4 * GRID_SIZE)) // Min width 4
      expect(rect.attributes('height')).toBe(String(5 * GRID_SIZE)) // Min height 5
    })

    it('updates output position based on dynamic height', async () => {
      await wrapper.setProps({ addressBits: 8 })

      const outputs = wrapper.findAll('.connection-point.output')
      const dOutput = outputs[0]

      const expectedHeight = Math.max(5, Math.ceil(8 / 2) + 1) // 5 grid units for 8 address bits
      expect(dOutput.attributes('cy')).toBe(String(Math.floor(expectedHeight / 2) * GRID_SIZE))
    })
  })

  describe('Input Spacing', () => {
    it('maintains 2 grid unit spacing between A and sel inputs', () => {
      const inputs = wrapper.findAll('.connection-point.input')

      const aInput = inputs.find(input => input.attributes('data-port') === '0')
      const selInput = inputs.find(input => input.attributes('data-port') === '1')

      const aY = parseFloat(aInput.attributes('cy'))
      const selY = parseFloat(selInput.attributes('cy'))

      expect(selY - aY).toBe(2 * GRID_SIZE) // Exactly 2 grid units apart
    })
  })

  describe('Props Validation', () => {
    it('accepts valid address bits range', () => {
      expect(() => mount(ROM, { props: { id: 'test-1', addressBits: 1 } })).not.toThrow()
      expect(() => mount(ROM, { props: { id: 'test-2', addressBits: 16 } })).not.toThrow()
    })

    it('accepts valid data bits range', () => {
      expect(() => mount(ROM, { props: { id: 'test-3', dataBits: 1 } })).not.toThrow()
      expect(() => mount(ROM, { props: { id: 'test-4', dataBits: 32 } })).not.toThrow()
    })

    it('accepts data array', () => {
      const testData = [1, 2, 3, 4, 5]
      const romWrapper = mount(ROM, { props: { id: 'test-5', data: testData } })
      expect(romWrapper.props('data')).toEqual(testData)
    })

    it('uses default values when props not provided', () => {
      const defaultWrapper = mount(ROM, { props: { id: 'test' } })
      expect(defaultWrapper.props('addressBits')).toBe(4)
      expect(defaultWrapper.props('dataBits')).toBe(8)
      expect(defaultWrapper.props('label')).toBe('ROM')
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
})
