import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConstantNode from '@/components/ConstantNode.vue'

describe('ConstantNode', () => {
  describe('value formatting', () => {
    it('should format decimal values correctly', () => {
      const wrapper = mount(ConstantNode, {
        props: {
          id: 'const1',
          x: 0,
          y: 0,
          value: 42,
          base: 10,
          bits: 8
        }
      })

      expect(wrapper.vm.formattedValue).toBe('42')
    })

    it('should format hexadecimal values correctly', () => {
      const wrapper = mount(ConstantNode, {
        props: {
          id: 'const1',
          x: 0,
          y: 0,
          value: 255,
          base: 16,
          bits: 8
        }
      })

      expect(wrapper.vm.formattedValue).toBe('0xFF')
    })

    it('should format binary values correctly', () => {
      const wrapper = mount(ConstantNode, {
        props: {
          id: 'const1',
          x: 0,
          y: 0,
          value: 5,
          base: 2,
          bits: 4
        }
      })

      expect(wrapper.vm.formattedValue).toBe('0b0101')
    })

    it('should handle null values gracefully', () => {
      const wrapper = mount(ConstantNode, {
        props: {
          id: 'const1',
          x: 0,
          y: 0,
          value: null,
          base: 10,
          bits: 8
        }
      })

      expect(wrapper.vm.formattedValue).toBe('0')
    })
  })

  describe('visual representation', () => {
    it('should render as rounded rectangle with outline only to distinguish from input', () => {
      const wrapper = mount(ConstantNode, {
        props: {
          id: 'const1',
          x: 0,
          y: 0
        }
      })

      const rect = wrapper.find('rect')
      expect(rect.attributes('fill')).toBe('none')
      expect(rect.attributes('rx')).toBe('3')
      expect(rect.attributes('ry')).toBe('3')
    })

    it('should have a single output connection point', () => {
      const wrapper = mount(ConstantNode, {
        props: {
          id: 'const1',
          x: 0,
          y: 0
        }
      })

      const outputConnections = wrapper.findAll('[data-type="output"]')
      expect(outputConnections.length).toBe(1)
    })
  })
})
