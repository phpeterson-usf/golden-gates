import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Decoder from '@/components/Decoder.vue'
import { GRID_SIZE, CONNECTION_DOT_RADIUS } from '@/utils/constants'

describe('Decoder', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Decoder, {
      props: {
        id: 'decoder-1',
        x: 2,
        y: 3,
        selected: false,
        numOutputs: 4,
        label: 'DEC0',
        rotation: 0
      }
    })
  })

  describe('Component Structure', () => {
    it('renders decoder rectangle', () => {
      const rect = wrapper.find('rect')
      expect(rect.exists()).toBe(true)
      expect(rect.attributes('width')).toBe(String(4 * GRID_SIZE))
      expect(rect.attributes('height')).toBe(String(8 * GRID_SIZE)) // (4-1)*2 + 2 = 8
    })

    it('renders selector input connection point', () => {
      const inputs = wrapper.findAll('.connection-point.input')
      expect(inputs).toHaveLength(1)
      
      const selInput = inputs[0]
      expect(selInput.attributes('cx')).toBe(String(GRID_SIZE * 2)) // Center of 4-unit wide
      expect(selInput.attributes('cy')).toBe('0')
      expect(selInput.attributes('data-port')).toBe('0')
    })

    it('renders correct number of output connection points', () => {
      const outputs = wrapper.findAll('.connection-point.output')
      expect(outputs).toHaveLength(4)
      
      // Check first and last output positions
      expect(outputs[0].attributes('cx')).toBe(String(4 * GRID_SIZE))
      expect(outputs[0].attributes('cy')).toBe(String(GRID_SIZE)) // First at y=1
      expect(outputs[0].attributes('data-port')).toBe('0')
      
      expect(outputs[3].attributes('cy')).toBe(String(7 * GRID_SIZE)) // Last at y=7 (1 + 3*2)
      expect(outputs[3].attributes('data-port')).toBe('3')
    })

    it('does not render port labels', () => {
      const texts = wrapper.findAll('text')
      // Should only have the component label, no port labels
      expect(texts).toHaveLength(1)
      expect(texts[0].text()).toBe('DEC0')
    })

    it('renders component label when provided', () => {
      const label = wrapper.find('.component-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('DEC0')
    })

    it('does not render label when empty', async () => {
      await wrapper.setProps({ label: '' })
      const label = wrapper.find('.component-label')
      expect(label.exists()).toBe(false)
    })
  })

  describe('Dynamic Output Count', () => {
    it('renders 2 outputs minimum', async () => {
      await wrapper.setProps({ numOutputs: 2 })
      const outputs = wrapper.findAll('.connection-point.output')
      expect(outputs).toHaveLength(2)
      
      // Height should be minimum 4 grid units
      const rect = wrapper.find('rect')
      expect(rect.attributes('height')).toBe(String(4 * GRID_SIZE))
    })

    it('renders up to 16 outputs maximum', async () => {
      await wrapper.setProps({ numOutputs: 16 })
      const outputs = wrapper.findAll('.connection-point.output')
      expect(outputs).toHaveLength(16)
      
      // Height should be (16-1)*2 + 2 = 32 grid units
      const rect = wrapper.find('rect')
      expect(rect.attributes('height')).toBe(String(32 * GRID_SIZE))
    })

    it('maintains 2 grid unit spacing between outputs', async () => {
      await wrapper.setProps({ numOutputs: 3 })
      const outputs = wrapper.findAll('.connection-point.output')
      
      const y0 = parseInt(outputs[0].attributes('cy'))
      const y1 = parseInt(outputs[1].attributes('cy'))
      const y2 = parseInt(outputs[2].attributes('cy'))
      
      expect(y1 - y0).toBe(2 * GRID_SIZE)
      expect(y2 - y1).toBe(2 * GRID_SIZE)
    })
  })

  describe('Grid Alignment', () => {
    it('aligns all connection points to grid vertices', async () => {
      await wrapper.setProps({ numOutputs: 5 })
      
      // Check selector input
      const input = wrapper.find('.connection-point.input')
      const inputX = parseInt(input.attributes('cx'))
      const inputY = parseInt(input.attributes('cy'))
      expect(inputX % GRID_SIZE).toBe(0)
      expect(inputY % GRID_SIZE).toBe(0)
      
      // Check all outputs
      const outputs = wrapper.findAll('.connection-point.output')
      outputs.forEach(output => {
        const x = parseInt(output.attributes('cx'))
        const y = parseInt(output.attributes('cy'))
        expect(x % GRID_SIZE).toBe(0)
        expect(y % GRID_SIZE).toBe(0)
      })
    })
  })

  describe('Component Position', () => {
    it('positions decoder at correct grid coordinates', () => {
      const g = wrapper.find('g')
      expect(g.attributes('transform')).toBe(`translate(${2 * GRID_SIZE}, ${3 * GRID_SIZE})`)
    })

    it('updates position when props change', async () => {
      await wrapper.setProps({ x: 5, y: 7 })
      const g = wrapper.find('g')
      expect(g.attributes('transform')).toBe(`translate(${5 * GRID_SIZE}, ${7 * GRID_SIZE})`)
    })
  })

  describe('Rotation', () => {
    it('applies rotation transform', async () => {
      await wrapper.setProps({ rotation: 90 })
      const rotationGroup = wrapper.findAll('g')[1] // Second g element has rotation
      expect(rotationGroup.attributes('transform')).toContain('rotate(90')
    })

    it('rotates around component center', async () => {
      await wrapper.setProps({ rotation: 180 })
      const rotationGroup = wrapper.findAll('g')[1]
      const centerX = 4 * GRID_SIZE / 2
      const centerY = 8 * GRID_SIZE / 2
      expect(rotationGroup.attributes('transform')).toBe(`rotate(180, ${centerX}, ${centerY})`)
    })
  })

  describe('Selection State', () => {
    it('changes visual appearance when selected', async () => {
      await wrapper.setProps({ selected: true })
      const rect = wrapper.find('rect')
      // Selected state is indicated by stroke width, not CSS class
      expect(rect.attributes('stroke-width')).toBe('3')
    })

    it('reverts visual appearance when deselected', async () => {
      await wrapper.setProps({ selected: true })
      await wrapper.setProps({ selected: false })
      const rect = wrapper.find('rect')
      expect(rect.attributes('stroke-width')).toBe('2')
    })
  })

  describe('Interaction', () => {
    it('responds to mousedown events', async () => {
      // Component should have handleMouseDown from composable
      expect(wrapper.vm.handleMouseDown).toBeDefined()
      expect(typeof wrapper.vm.handleMouseDown).toBe('function')
    })

    it('has draggable component setup', () => {
      // Verify component uses the draggable composable
      expect(wrapper.vm.fillColor).toBeDefined()
      expect(wrapper.vm.strokeColor).toBeDefined()
      expect(wrapper.vm.strokeWidth).toBeDefined()
      expect(wrapper.vm.componentClasses).toBeDefined()
    })
  })

  describe('Data Attributes', () => {
    it('sets correct data attributes on connection points', () => {
      const input = wrapper.find('.connection-point.input')
      expect(input.attributes('data-component-id')).toBe('decoder-1')
      expect(input.attributes('data-type')).toBe('input')
      expect(input.attributes('data-port')).toBe('0')
      
      const outputs = wrapper.findAll('.connection-point.output')
      outputs.forEach((output, index) => {
        expect(output.attributes('data-component-id')).toBe('decoder-1')
        expect(output.attributes('data-type')).toBe('output')
        expect(output.attributes('data-port')).toBe(String(index))
      })
    })
  })
})