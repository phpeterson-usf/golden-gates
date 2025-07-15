import { describe, it, expect } from 'vitest'
import { 
  GRID_SIZE, 
  DOT_SIZE, 
  CONNECTION_DOT_RADIUS, 
  COLORS, 
  STROKE_WIDTHS, 
  COMPONENT_DIMENSIONS 
} from '@/utils/constants'

describe('Constants', () => {
  describe('Basic constants', () => {
    it('should have correct GRID_SIZE', () => {
      expect(GRID_SIZE).toBe(15)
      expect(typeof GRID_SIZE).toBe('number')
    })

    it('should have correct DOT_SIZE', () => {
      expect(DOT_SIZE).toBe(2)
      expect(typeof DOT_SIZE).toBe('number')
    })

    it('should have correct CONNECTION_DOT_RADIUS', () => {
      expect(CONNECTION_DOT_RADIUS).toBe(3)
      expect(typeof CONNECTION_DOT_RADIUS).toBe('number')
    })
  })

  describe('COLORS object', () => {
    it('should have all required component colors', () => {
      expect(COLORS).toHaveProperty('componentFill')
      expect(COLORS).toHaveProperty('componentStroke')
      expect(COLORS).toHaveProperty('componentSelectedFill')
      expect(COLORS).toHaveProperty('componentSelectedStroke')
      expect(COLORS).toHaveProperty('componentHoverFill')
      
      // Verify they are strings (color values)
      expect(typeof COLORS.componentFill).toBe('string')
      expect(typeof COLORS.componentStroke).toBe('string')
      expect(typeof COLORS.componentSelectedFill).toBe('string')
      expect(typeof COLORS.componentSelectedStroke).toBe('string')
      expect(typeof COLORS.componentHoverFill).toBe('string')
    })

    it('should have all required connection colors', () => {
      expect(COLORS).toHaveProperty('connectionFill')
      expect(COLORS).toHaveProperty('connectionHoverFill')
      
      expect(typeof COLORS.connectionFill).toBe('string')
      expect(typeof COLORS.connectionHoverFill).toBe('string')
    })

    it('should have all required grid colors', () => {
      expect(COLORS).toHaveProperty('gridDot')
      expect(COLORS).toHaveProperty('canvasBackground')
      
      expect(typeof COLORS.gridDot).toBe('string')
      expect(typeof COLORS.canvasBackground).toBe('string')
    })

    it('should have all required wire colors', () => {
      expect(COLORS).toHaveProperty('wire')
      expect(COLORS).toHaveProperty('wireSelected')
      expect(COLORS).toHaveProperty('wirePreview')
      
      expect(typeof COLORS.wire).toBe('string')
      expect(typeof COLORS.wireSelected).toBe('string')
      expect(typeof COLORS.wirePreview).toBe('string')
    })

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/
      
      // Test some key colors that should be hex values
      expect(COLORS.componentStroke).toMatch(hexColorRegex)
      expect(COLORS.componentSelectedFill).toMatch(hexColorRegex)
      expect(COLORS.componentSelectedStroke).toMatch(hexColorRegex)
      expect(COLORS.componentHoverFill).toMatch(hexColorRegex)
      expect(COLORS.connectionHoverFill).toMatch(hexColorRegex)
      expect(COLORS.gridDot).toMatch(hexColorRegex)
      expect(COLORS.canvasBackground).toMatch(hexColorRegex)
      expect(COLORS.wire).toMatch(hexColorRegex)
      expect(COLORS.wireSelected).toMatch(hexColorRegex)
      expect(COLORS.wirePreview).toMatch(hexColorRegex)
    })

    it('should have specific expected color values', () => {
      // Test specific values to catch regressions
      expect(COLORS.componentFill).toBe('white')
      expect(COLORS.componentStroke).toBe('#475569')
      expect(COLORS.componentSelectedFill).toBe('#dbeafe')
      expect(COLORS.componentSelectedStroke).toBe('#3b82f6')
      expect(COLORS.connectionFill).toBe('black')
      expect(COLORS.canvasBackground).toBe('#ffffff')
    })
  })

  describe('STROKE_WIDTHS object', () => {
    it('should have all required stroke widths', () => {
      expect(STROKE_WIDTHS).toHaveProperty('normal')
      expect(STROKE_WIDTHS).toHaveProperty('selected')
      expect(STROKE_WIDTHS).toHaveProperty('wire')
      expect(STROKE_WIDTHS).toHaveProperty('wireSelected')
      
      // Verify they are numbers
      expect(typeof STROKE_WIDTHS.normal).toBe('number')
      expect(typeof STROKE_WIDTHS.selected).toBe('number')
      expect(typeof STROKE_WIDTHS.wire).toBe('number')
      expect(typeof STROKE_WIDTHS.wireSelected).toBe('number')
    })

    it('should have expected stroke width values', () => {
      expect(STROKE_WIDTHS.normal).toBe(2)
      expect(STROKE_WIDTHS.selected).toBe(3)
      expect(STROKE_WIDTHS.wire).toBe(2)
      expect(STROKE_WIDTHS.wireSelected).toBe(3)
    })

    it('should have selected stroke width greater than normal', () => {
      expect(STROKE_WIDTHS.selected).toBeGreaterThan(STROKE_WIDTHS.normal)
      expect(STROKE_WIDTHS.wireSelected).toBeGreaterThan(STROKE_WIDTHS.wire)
    })
  })

  describe('COMPONENT_DIMENSIONS object', () => {
    it('should have input component dimensions', () => {
      expect(COMPONENT_DIMENSIONS).toHaveProperty('input')
      expect(COMPONENT_DIMENSIONS.input).toHaveProperty('width')
      expect(COMPONENT_DIMENSIONS.input).toHaveProperty('height')
      
      expect(typeof COMPONENT_DIMENSIONS.input.width).toBe('number')
      expect(typeof COMPONENT_DIMENSIONS.input.height).toBe('number')
    })

    it('should have andGate component dimensions', () => {
      expect(COMPONENT_DIMENSIONS).toHaveProperty('andGate')
      expect(COMPONENT_DIMENSIONS.andGate).toHaveProperty('width')
      expect(COMPONENT_DIMENSIONS.andGate).toHaveProperty('height')
      expect(COMPONENT_DIMENSIONS.andGate).toHaveProperty('arcRadius')
      
      expect(typeof COMPONENT_DIMENSIONS.andGate.width).toBe('number')
      expect(typeof COMPONENT_DIMENSIONS.andGate.height).toBe('number')
      expect(typeof COMPONENT_DIMENSIONS.andGate.arcRadius).toBe('number')
    })

    it('should have input dimensions based on GRID_SIZE', () => {
      expect(COMPONENT_DIMENSIONS.input.width).toBe(GRID_SIZE)
      expect(COMPONENT_DIMENSIONS.input.height).toBe(GRID_SIZE)
    })

    it('should have expected andGate dimensions', () => {
      expect(COMPONENT_DIMENSIONS.andGate.width).toBe(60)
      expect(COMPONENT_DIMENSIONS.andGate.height).toBe(120)
      expect(COMPONENT_DIMENSIONS.andGate.arcRadius).toBe(30)
    })
  })

  describe('Relationships between constants', () => {
    it('should have CONNECTION_DOT_RADIUS appropriate for GRID_SIZE', () => {
      // Connection dot should be smaller than grid size
      expect(CONNECTION_DOT_RADIUS).toBeLessThan(GRID_SIZE)
      // But not too small to be visible
      expect(CONNECTION_DOT_RADIUS).toBeGreaterThan(0)
    })

    it('should have DOT_SIZE appropriate for GRID_SIZE', () => {
      expect(DOT_SIZE).toBeLessThan(GRID_SIZE)
      expect(DOT_SIZE).toBeGreaterThan(0)
    })

    it('should have consistent stroke width relationships', () => {
      // Selected strokes should be thicker than normal
      expect(STROKE_WIDTHS.selected).toBeGreaterThan(STROKE_WIDTHS.normal)
      expect(STROKE_WIDTHS.wireSelected).toBeGreaterThan(STROKE_WIDTHS.wire)
      
      // But not too much thicker
      expect(STROKE_WIDTHS.selected - STROKE_WIDTHS.normal).toBeLessThanOrEqual(2)
      expect(STROKE_WIDTHS.wireSelected - STROKE_WIDTHS.wire).toBeLessThanOrEqual(2)
    })
  })
})