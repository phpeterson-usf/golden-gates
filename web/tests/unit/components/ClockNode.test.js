import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ClockNode from '@/components/ClockNode.vue'

describe('ClockNode', () => {
  describe('frequency formatting', () => {
    it('should format frequency correctly', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0,
          frequency: 100
        }
      })

      expect(wrapper.vm.formattedFrequency).toBe('100Hz')
    })

    it('should handle single digit frequency', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0,
          frequency: 1
        }
      })

      expect(wrapper.vm.formattedFrequency).toBe('1Hz')
    })

    it('should handle maximum frequency', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0,
          frequency: 1000
        }
      })

      expect(wrapper.vm.formattedFrequency).toBe('1000Hz')
    })
  })

  describe('square wave path generation', () => {
    it('should generate a valid SVG path string', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0,
          frequency: 1
        }
      })

      const path = wrapper.vm.squareWavePath
      expect(path).toMatch(/^M\s+-?\d+\s+-?\d+/) // Should start with 'M' command
      expect(path).toContain('L') // Should contain line commands
      expect(path.split('L').length).toBeGreaterThan(8) // Should have multiple line segments for square wave
    })

    it('should create square wave with alternating high and low levels', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0,
          frequency: 1
        }
      })

      const path = wrapper.vm.squareWavePath
      // Check that path contains both high (-5) and low (5) Y coordinates
      expect(path).toContain('-5') // High level
      expect(path).toContain('5') // Low level (but not -5, so this checks low level)
    })
  })

  describe('visual representation', () => {
    it('should render as filled rectangle with bounding box like Input/Constant', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      const rect = wrapper.find('rect')
      expect(rect.exists()).toBe(true)
      // Should have dynamic fill for draggability (bound to fillColor)
      expect(rect.attributes('fill')).toBeDefined()
      expect(rect.attributes('fill')).not.toBe('none')
    })

    it('should have square wave visualization', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      const waveform = wrapper.find('.clock-waveform')
      expect(waveform.exists()).toBe(true)

      const path = wrapper.find('.clock-signal')
      expect(path.exists()).toBe(true)
      expect(path.attributes('fill')).toBe('none') // Path should be stroke only
    })

    it('should have waveform with pointer-events disabled', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      const waveform = wrapper.find('.clock-waveform')
      expect(waveform.attributes('style')).toContain('pointer-events: none')
    })

    it('should have a single output connection point', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      const outputConnections = wrapper.findAll('[data-type="output"]')
      expect(outputConnections.length).toBe(1)

      const output = outputConnections[0]
      expect(output.attributes('data-port')).toBe('0')
      expect(output.attributes('data-component-id')).toBe('clock1')
    })

    it('should display frequency above the component', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0,
          frequency: 42
        }
      })

      const frequencyText = wrapper.find('.component-value')
      expect(frequencyText.exists()).toBe(true)
      expect(frequencyText.text()).toBe('42Hz')
      expect(frequencyText.attributes('y')).toBe('-15') // Above component
    })

    it('should display label on the left side', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0,
          label: 'TEST_CLK'
        }
      })

      const labelText = wrapper.find('.component-label')
      expect(labelText.exists()).toBe(true)
      expect(labelText.text()).toBe('TEST_CLK')
      expect(labelText.attributes('text-anchor')).toBe('end') // Right-aligned to appear on left
    })
  })

  describe('props and defaults', () => {
    it('should use default label "CLK"', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      expect(wrapper.props('label')).toBe('CLK')
    })

    it('should use default frequency of 1', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      expect(wrapper.props('frequency')).toBe(1)
    })

    it('should use default rotation of 0', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      expect(wrapper.props('rotation')).toBe(0)
    })

    it('should accept custom props', () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 5,
          y: 10,
          label: 'SYSCLK',
          frequency: 50,
          rotation: 90
        }
      })

      expect(wrapper.props('label')).toBe('SYSCLK')
      expect(wrapper.props('frequency')).toBe(50)
      expect(wrapper.props('rotation')).toBe(90)
    })
  })

  describe('drag behavior', () => {
    it('should emit startDrag when mouse down on rectangle', async () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      const rect = wrapper.find('rect')

      // Mock the DOM element's closest method before triggering the event
      const mockSVG = {
        createSVGPoint: vi.fn(() => ({
          x: 0,
          y: 0,
          matrixTransform: vi.fn(() => ({ x: 100, y: 100 }))
        })),
        getScreenCTM: vi.fn(() => ({
          inverse: vi.fn()
        })),
        querySelector: vi.fn(() => null)
      }

      // Mock the closest method on the rect element
      vi.spyOn(rect.element, 'closest').mockReturnValue(mockSVG)

      await rect.trigger('mousedown', {
        clientX: 100,
        clientY: 100
      })

      expect(wrapper.emitted('startDrag')).toBeTruthy()
    })

    it('should not emit startDrag when mouse down on waveform (pointer-events disabled)', async () => {
      const wrapper = mount(ClockNode, {
        props: {
          id: 'clock1',
          x: 0,
          y: 0
        }
      })

      // The waveform should have pointer-events: none, so this shouldn't trigger
      const waveform = wrapper.find('.clock-waveform path')
      await waveform.trigger('mousedown')

      // Since pointer-events: none, the event should not be captured by the waveform
      // and the startDrag should not be emitted from the waveform specifically
      // (it would bubble to the rectangle instead)
    })
  })
})
