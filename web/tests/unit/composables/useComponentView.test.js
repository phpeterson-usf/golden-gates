import { describe, it, expect, vi } from 'vitest'
import { reactive } from 'vue'
import { useComponentView } from '@/composables/useComponentView'
import { COLORS, STROKE_WIDTHS } from '@/utils/constants'

describe('useComponentView', () => {
  // Helper function to create mock props
  const createMockProps = (overrides = {}) => ({
    id: 'test-component',
    x: 100,
    y: 200,
    selected: false,
    ...overrides
  })

  // Helper function to create mock emit
  const createMockEmit = () => vi.fn()

  describe('computed properties', () => {
    describe('fillColor', () => {
      it('should return normal fill color when not selected', () => {
        const props = createMockProps({ selected: false })
        const emit = createMockEmit()
        
        const { fillColor } = useComponentView(props, emit)
        
        expect(fillColor.value).toBe(COLORS.componentFill)
      })

      it('should return selected fill color when selected', () => {
        const props = createMockProps({ selected: true })
        const emit = createMockEmit()
        
        const { fillColor } = useComponentView(props, emit)
        
        expect(fillColor.value).toBe(COLORS.componentSelectedFill)
      })
    })

    describe('strokeColor', () => {
      it('should return normal stroke color when not selected', () => {
        const props = createMockProps({ selected: false })
        const emit = createMockEmit()
        
        const { strokeColor } = useComponentView(props, emit)
        
        expect(strokeColor.value).toBe(COLORS.componentStroke)
      })

      it('should return selected stroke color when selected', () => {
        const props = createMockProps({ selected: true })
        const emit = createMockEmit()
        
        const { strokeColor } = useComponentView(props, emit)
        
        expect(strokeColor.value).toBe(COLORS.componentSelectedStroke)
      })
    })

    describe('strokeWidth', () => {
      it('should return normal stroke width when not selected', () => {
        const props = createMockProps({ selected: false })
        const emit = createMockEmit()
        
        const { strokeWidth } = useComponentView(props, emit)
        
        expect(strokeWidth.value).toBe(STROKE_WIDTHS.normal)
      })

      it('should return selected stroke width when selected', () => {
        const props = createMockProps({ selected: true })
        const emit = createMockEmit()
        
        const { strokeWidth } = useComponentView(props, emit)
        
        expect(strokeWidth.value).toBe(STROKE_WIDTHS.selected)
      })
    })
  })

  describe('handleMouseDown', () => {
    it('should emit startDrag event with correct data', () => {
      const props = createMockProps({
        id: 'test-component',
        x: 100,
        y: 200
      })
      const emit = createMockEmit()
      
      const { handleMouseDown } = useComponentView(props, emit)
      
      // Create a mock event with the necessary properties
      const mockEvent = {
        clientX: 150,
        clientY: 250,
        target: {
          closest: vi.fn(() => ({
            createSVGPoint: vi.fn(() => ({
              x: 0,
              y: 0,
              matrixTransform: vi.fn(() => ({ x: 150, y: 250 }))
            })),
            getScreenCTM: vi.fn(() => ({
              inverse: vi.fn()
            })),
            querySelector: vi.fn(() => null) // No zoom transform
          }))
        }
      }
      
      handleMouseDown(mockEvent)
      
      expect(emit).toHaveBeenCalledWith('startDrag', {
        id: 'test-component',
        offsetX: 50, // 150 - 100
        offsetY: 50, // 250 - 200
        event: mockEvent
      })
    })

    it('should handle zoom scaling correctly', () => {
      const props = createMockProps({
        id: 'test-component',
        x: 100,
        y: 200
      })
      const emit = createMockEmit()
      
      const { handleMouseDown } = useComponentView(props, emit)
      
      // Create a mock event with zoom scaling
      const mockEvent = {
        clientX: 150,
        clientY: 250,
        target: {
          closest: vi.fn(() => ({
            createSVGPoint: vi.fn(() => ({
              x: 0,
              y: 0,
              matrixTransform: vi.fn(() => ({ x: 300, y: 500 })) // Scaled coordinates
            })),
            getScreenCTM: vi.fn(() => ({
              inverse: vi.fn()
            })),
            querySelector: vi.fn(() => ({
              getAttribute: vi.fn(() => 'scale(2)') // 2x zoom
            }))
          }))
        }
      }
      
      handleMouseDown(mockEvent)
      
      expect(emit).toHaveBeenCalledWith('startDrag', {
        id: 'test-component',
        offsetX: 50, // (300 / 2) - 100
        offsetY: 50, // (500 / 2) - 200
        event: mockEvent
      })
    })

    it('should handle missing zoom transform gracefully', () => {
      const props = createMockProps({
        id: 'test-component',
        x: 100,
        y: 200
      })
      const emit = createMockEmit()
      
      const { handleMouseDown } = useComponentView(props, emit)
      
      // Create a mock event without zoom transform
      const mockEvent = {
        clientX: 150,
        clientY: 250,
        target: {
          closest: vi.fn(() => ({
            createSVGPoint: vi.fn(() => ({
              x: 0,
              y: 0,
              matrixTransform: vi.fn(() => ({ x: 150, y: 250 }))
            })),
            getScreenCTM: vi.fn(() => ({
              inverse: vi.fn()
            })),
            querySelector: vi.fn(() => null) // No transform group
          }))
        }
      }
      
      handleMouseDown(mockEvent)
      
      expect(emit).toHaveBeenCalledWith('startDrag', {
        id: 'test-component',
        offsetX: 50,
        offsetY: 50,
        event: mockEvent
      })
    })
  })

  describe('return values', () => {
    it('should return all expected properties', () => {
      const props = createMockProps()
      const emit = createMockEmit()
      
      const result = useComponentView(props, emit)
      
      expect(result).toHaveProperty('handleMouseDown')
      expect(result).toHaveProperty('fillColor')
      expect(result).toHaveProperty('strokeColor')
      expect(result).toHaveProperty('strokeWidth')
      
      expect(typeof result.handleMouseDown).toBe('function')
      expect(result.fillColor).toBeDefined()
      expect(result.strokeColor).toBeDefined()
      expect(result.strokeWidth).toBeDefined()
    })
  })

  describe('reactivity', () => {
    it('should update colors when selected prop changes', async () => {
      const props = reactive(createMockProps({ selected: false }))
      const emit = createMockEmit()
      
      const { fillColor, strokeColor, strokeWidth } = useComponentView(props, emit)
      
      // Initially not selected
      expect(fillColor.value).toBe(COLORS.componentFill)
      expect(strokeColor.value).toBe(COLORS.componentStroke)
      expect(strokeWidth.value).toBe(STROKE_WIDTHS.normal)
      
      // Change to selected
      props.selected = true
      
      // Should update reactively
      expect(fillColor.value).toBe(COLORS.componentSelectedFill)
      expect(strokeColor.value).toBe(COLORS.componentSelectedStroke)
      expect(strokeWidth.value).toBe(STROKE_WIDTHS.selected)
    })
  })
})