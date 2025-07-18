// Global test setup for Vitest
import { config } from '@vue/test-utils'

// Configure Vue Test Utils globally
config.global.mocks = {
  // Add global mocks if needed
}

// Mock window.matchMedia for components that might use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock SVG methods that might be used in components
global.SVGElement = global.SVGElement || class SVGElement {}
if (typeof SVGElement.prototype.createSVGPoint === 'undefined') {
  SVGElement.prototype.createSVGPoint = vi.fn(() => ({
    x: 0,
    y: 0,
    matrixTransform: vi.fn(() => ({ x: 0, y: 0 }))
  }))
}

if (typeof SVGElement.prototype.getScreenCTM === 'undefined') {
  SVGElement.prototype.getScreenCTM = vi.fn(() => ({
    inverse: vi.fn(() => ({ x: 0, y: 0 }))
  }))
}
