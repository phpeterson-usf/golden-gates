// Grid and sizing constants
export const GRID_SIZE = 30
export const DOT_SIZE = 2
export const CONNECTION_DOT_RADIUS = 3

// Colors
export const COLORS = {
  // Component colors
  componentFill: 'white',
  componentStroke: '#475569',
  componentSelectedFill: '#dbeafe',
  componentSelectedStroke: '#3b82f6',
  componentHoverFill: '#f1f5f9',
  
  // Connection point colors
  connectionFill: 'black',
  connectionHoverFill: '#0066cc',
  
  // Grid colors
  gridDot: '#cbd5e1',
  canvasBackground: '#ffffff',
  
  // Wire colors
  wire: '#374151',
  wireSelected: '#3b82f6',
  wirePreview: '#6b7280'
}

// Stroke widths
export const STROKE_WIDTHS = {
  normal: 2,
  selected: 3,
  wire: 2,
  wireSelected: 3
}

// Component dimensions
export const COMPONENT_DIMENSIONS = {
  input: {
    width: GRID_SIZE,
    height: GRID_SIZE
  },
  andGate: {
    width: 60,
    height: 120,
    arcRadius: 30
  }
}