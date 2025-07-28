import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentIcon from '@/components/ComponentIcon.vue'

describe('ComponentIcon', () => {
  describe('Clock icon', () => {
    it('should render square wave path for clock component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'clock',
          size: 16
        }
      })

      const path = wrapper.find('path')
      expect(path.exists()).toBe(true)
      
      const pathData = path.attributes('d')
      expect(pathData).toBeDefined()
      expect(pathData).toContain('M') // Should start with move command
      expect(pathData).toContain('L') // Should contain line commands
      expect(pathData.split('L').length).toBeGreaterThan(8) // Should have multiple line segments for square wave
    })

    it('should use stroke-only (no fill) for clock icon', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'clock',
          size: 16
        }
      })

      const path = wrapper.find('path')
      expect(path.attributes('fill')).toBe('none')
    })

    it('should use consistent path for all sizes (fills viewBox)', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'clock',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'clock',
          size: 32
        }
      })

      const smallPath = smallWrapper.find('path').attributes('d')
      const largePath = largeWrapper.find('path').attributes('d')
      
      // Paths should be the same since we use fixed coordinates to fill the viewBox
      expect(smallPath).toBe(largePath)
      // But stroke width should still scale
      expect(smallWrapper.find('path').attributes('stroke-width')).not.toBe(
        largeWrapper.find('path').attributes('stroke-width')
      )
    })
  })

  describe('Constant icon', () => {
    it('should render "1" character as text for constant component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('1')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should use shared CSS class for consistent styling', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should scale font size for different icon sizes', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 32
        }
      })

      const smallText = smallWrapper.find('text')
      const largeText = largeWrapper.find('text')
      
      // Font sizes should be different for different icon sizes
      expect(smallText.attributes('font-size')).not.toBe(largeText.attributes('font-size'))
    })

    it('should use specified color for text fill', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16,
          color: '#ff0000'
        }
      })

      const text = wrapper.find('text')
      expect(text.attributes('fill')).toBe('#ff0000')
    })

    it('should center the text properly', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16
        }
      })

      const text = wrapper.find('text')
      // Text centering is handled by CSS class, but we can verify positioning
      expect(text.attributes('x')).toBe('30') // Center of viewBox
      expect(text.attributes('y')).toBe('15') // Center of viewBox
      expect(text.classes()).toContain('component-icon-text')
    })
  })

  describe('Subtract icon', () => {
    it('should render "-" character as text for subtract component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('-')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should use shared CSS class for consistent styling', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should scale font size for different icon sizes', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 32
        }
      })

      const smallText = smallWrapper.find('text')
      const largeText = largeWrapper.find('text')
      
      // Font sizes should be different for different icon sizes
      expect(smallText.attributes('font-size')).not.toBe(largeText.attributes('font-size'))
    })

    it('should use specified color for text fill', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16,
          color: '#ff0000'
        }
      })

      const text = wrapper.find('text')
      expect(text.attributes('fill')).toBe('#ff0000')
    })

    it('should center the text properly', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16
        }
      })

      const text = wrapper.find('text')
      // Text centering is handled by CSS class, but we can verify positioning
      expect(text.attributes('x')).toBe('30') // Center of viewBox
      expect(text.attributes('y')).toBe('15') // Center of viewBox
    })
  })

  describe('Adder icon', () => {
    it('should render "+" character as text for adder component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('+')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should use shared CSS class for consistent styling', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should scale font size for different icon sizes', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 32
        }
      })

      const smallText = smallWrapper.find('text')
      const largeText = largeWrapper.find('text')
      
      // Font sizes should be different for different icon sizes
      expect(smallText.attributes('font-size')).not.toBe(largeText.attributes('font-size'))
    })

    it('should use specified color for text fill', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16,
          color: '#00ff00'
        }
      })

      const text = wrapper.find('text')
      expect(text.attributes('fill')).toBe('#00ff00')
    })

    it('should center the text properly', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16
        }
      })

      const text = wrapper.find('text')
      // Text centering is handled by CSS class, but we can verify positioning
      expect(text.attributes('x')).toBe('30') // Center of viewBox
      expect(text.attributes('y')).toBe('15') // Center of viewBox
    })
  })

  describe('Multiply icon', () => {
    it('should render "*" character as text for multiply component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('*')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should use shared CSS class for consistent styling', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should scale font size for different icon sizes', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 32
        }
      })

      const smallText = smallWrapper.find('text')
      const largeText = largeWrapper.find('text')
      
      // Font sizes should be different for different icon sizes
      expect(smallText.attributes('font-size')).not.toBe(largeText.attributes('font-size'))
    })

    it('should use specified color for text fill', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16,
          color: '#00ff00'
        }
      })

      const text = wrapper.find('text')
      expect(text.attributes('fill')).toBe('#00ff00')
    })

    it('should center the text properly', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16
        }
      })

      const text = wrapper.find('text')
      // Text centering is handled by CSS class, but we can verify positioning
      expect(text.attributes('x')).toBe('30') // Center of viewBox
      expect(text.attributes('y')).toBe('15') // Center of viewBox
    })
  })

  describe('Divide icon', () => {
    it('should render "/" character as text for divide component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('/')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should use shared CSS class for consistent styling', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should scale font size for different icon sizes', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 32
        }
      })

      const smallText = smallWrapper.find('text')
      const largeText = largeWrapper.find('text')
      
      // Font sizes should be different for different icon sizes
      expect(smallText.attributes('font-size')).not.toBe(largeText.attributes('font-size'))
    })

    it('should use specified color for text fill', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16,
          color: '#ff00ff'
        }
      })

      const text = wrapper.find('text')
      expect(text.attributes('fill')).toBe('#ff00ff')
    })

    it('should center the text properly', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16
        }
      })

      const text = wrapper.find('text')
      // Text centering is handled by CSS class, but we can verify positioning
      expect(text.attributes('x')).toBe('30') // Center of viewBox
      expect(text.attributes('y')).toBe('15') // Center of viewBox
    })
  })

  describe('Shift icon', () => {
    it('should render "<<" character as text for shift component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('<<')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should use shared CSS class for consistent styling', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should scale font size for different icon sizes', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 32
        }
      })

      const smallText = smallWrapper.find('text')
      const largeText = largeWrapper.find('text')
      
      // Font sizes should be different for different icon sizes
      expect(smallText.attributes('font-size')).not.toBe(largeText.attributes('font-size'))
    })

    it('should use specified color for text fill', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16,
          color: '#00ffff'
        }
      })

      const text = wrapper.find('text')
      expect(text.attributes('fill')).toBe('#00ffff')
    })

    it('should center the text properly', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16
        }
      })

      const text = wrapper.find('text')
      // Text centering is handled by CSS class, but we can verify positioning
      expect(text.attributes('x')).toBe('30') // Center of viewBox
      expect(text.attributes('y')).toBe('15') // Center of viewBox
    })
  })

  describe('Compare icon', () => {
    it('should render "=" character as text for compare component', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.exists()).toBe(true)
      expect(text.text()).toBe('=')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should use shared CSS class for consistent styling', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16
        }
      })

      const text = wrapper.find('text')
      expect(text.classes()).toContain('component-icon-text')
    })

    it('should scale font size for different icon sizes', () => {
      const smallWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16
        }
      })

      const largeWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 32
        }
      })

      const smallText = smallWrapper.find('text')
      const largeText = largeWrapper.find('text')
      
      // Font sizes should be different for different icon sizes
      expect(smallText.attributes('font-size')).not.toBe(largeText.attributes('font-size'))
    })

    it('should use specified color for text fill', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16,
          color: '#ff0000'
        }
      })

      const text = wrapper.find('text')
      expect(text.attributes('fill')).toBe('#ff0000')
    })

    it('should center the text properly', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16
        }
      })

      const text = wrapper.find('text')
      // Text centering is handled by CSS class, but we can verify positioning
      expect(text.attributes('x')).toBe('30') // Center of viewBox
      expect(text.attributes('y')).toBe('15') // Center of viewBox
    })
  })

  describe('Text-based icons (shared functionality)', () => {
    it('should use same positioning for constant, adder, subtract, multiply, divide, shift, and compare', () => {
      const constantWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16
        }
      })

      const adderWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16
        }
      })

      const subtractWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16
        }
      })

      const multiplyWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16
        }
      })

      const divideWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16
        }
      })

      const shiftWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16
        }
      })

      const compareWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16
        }
      })

      const constantText = constantWrapper.find('text')
      const adderText = adderWrapper.find('text')
      const subtractText = subtractWrapper.find('text')
      const multiplyText = multiplyWrapper.find('text')
      const divideText = divideWrapper.find('text')
      const shiftText = shiftWrapper.find('text')
      const compareText = compareWrapper.find('text')
      
      // Should use same positioning
      expect(constantText.attributes('x')).toBe(adderText.attributes('x'))
      expect(constantText.attributes('y')).toBe(adderText.attributes('y'))
      expect(constantText.attributes('font-size')).toBe(adderText.attributes('font-size'))
      
      expect(constantText.attributes('x')).toBe(subtractText.attributes('x'))
      expect(constantText.attributes('y')).toBe(subtractText.attributes('y'))
      expect(constantText.attributes('font-size')).toBe(subtractText.attributes('font-size'))
      
      expect(constantText.attributes('x')).toBe(multiplyText.attributes('x'))
      expect(constantText.attributes('y')).toBe(multiplyText.attributes('y'))
      expect(constantText.attributes('font-size')).toBe(multiplyText.attributes('font-size'))
      
      expect(constantText.attributes('x')).toBe(divideText.attributes('x'))
      expect(constantText.attributes('y')).toBe(divideText.attributes('y'))
      expect(constantText.attributes('font-size')).toBe(divideText.attributes('font-size'))
      
      expect(constantText.attributes('x')).toBe(shiftText.attributes('x'))
      expect(constantText.attributes('y')).toBe(shiftText.attributes('y'))
      expect(constantText.attributes('font-size')).toBe(shiftText.attributes('font-size'))
      
      expect(constantText.attributes('x')).toBe(compareText.attributes('x'))
      expect(constantText.attributes('y')).toBe(compareText.attributes('y'))
      expect(constantText.attributes('font-size')).toBe(compareText.attributes('font-size'))
    })

    it('should use same CSS class for constant, adder, subtract, multiply, divide, shift, and compare', () => {
      const constantWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16
        }
      })

      const adderWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16
        }
      })

      const subtractWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16
        }
      })

      const multiplyWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16
        }
      })

      const divideWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16
        }
      })

      const shiftWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16
        }
      })

      const compareWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16
        }
      })

      const constantText = constantWrapper.find('text')
      const adderText = adderWrapper.find('text')
      const subtractText = subtractWrapper.find('text')
      const multiplyText = multiplyWrapper.find('text')
      const divideText = divideWrapper.find('text')
      const shiftText = shiftWrapper.find('text')
      const compareText = compareWrapper.find('text')
      
      // Should use same CSS class
      expect(constantText.classes()).toEqual(adderText.classes())
      expect(constantText.classes()).toEqual(subtractText.classes())
      expect(constantText.classes()).toEqual(multiplyText.classes())
      expect(constantText.classes()).toEqual(divideText.classes())
      expect(constantText.classes()).toEqual(shiftText.classes())
      expect(constantText.classes()).toEqual(compareText.classes())
      expect(constantText.classes()).toContain('component-icon-text')
    })
  })

  describe('SVG properties', () => {
    it('should set correct viewBox for clock, constant, adder, subtract, multiply, divide, shift, and compare icons', () => {
      const clockWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'clock',
          size: 16
        }
      })

      const constantWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'constant',
          size: 16
        }
      })

      const adderWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'adder',
          size: 16
        }
      })

      const subtractWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'subtract',
          size: 16
        }
      })

      const multiplyWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'multiply',
          size: 16
        }
      })

      const divideWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'divide',
          size: 16
        }
      })

      const shiftWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'shift',
          size: 16
        }
      })

      const compareWrapper = mount(ComponentIcon, {
        props: {
          componentType: 'compare',
          size: 16
        }
      })

      // All should use standard viewBox
      expect(clockWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
      expect(constantWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
      expect(adderWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
      expect(subtractWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
      expect(multiplyWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
      expect(divideWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
      expect(shiftWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
      expect(compareWrapper.find('svg').attributes('viewBox')).toBe('0 0 60 30')
    })

    it('should set correct size attributes', () => {
      const wrapper = mount(ComponentIcon, {
        props: {
          componentType: 'clock',
          size: 24
        }
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('24')
      expect(svg.attributes('height')).toBe('24')
    })
  })
})