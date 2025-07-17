import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCanvasController } from '@/composables/useCanvasController'
import { mockClipboardAPI, mockComponents } from '../../fixtures/clipboard-test-data'

describe('Clipboard Browser Compatibility', () => {
  let canvasController
  let mockCircuitManager
  let mockCanvasOperations
  let mockWireManagement
  let mockSelection
  let mockDragAndDrop
  let originalNavigator
  let originalExecCommand

  beforeEach(() => {
    // Store original globals
    originalNavigator = global.navigator
    originalExecCommand = global.document?.execCommand

    // Create mock dependencies
    mockCircuitManager = {
      activeCircuit: { value: { 
        components: [mockComponents.singleInput],
        wires: [],
        wireJunctions: []
      } }
    }
    mockCanvasOperations = { getMousePos: vi.fn(), snapToGrid: vi.fn(), gridSize: 15 }
    mockWireManagement = { 
      drawingWire: { value: false },
      currentMousePos: { value: { x: 0, y: 0 } },
      startConnection: { value: null }
    }
    mockSelection = {
      selectedComponents: { value: new Set(['input_1_1234567890']) },
      selectedWires: { value: new Set() },
      clearSelection: vi.fn(),
      deleteSelected: vi.fn(),
      checkAndClearJustFinished: vi.fn().mockReturnValue(false),
      isSelecting: { value: false },
      justFinishedSelecting: { value: false }
    }
    mockDragAndDrop = { 
      isDragging: vi.fn().mockReturnValue(false),
      dragging: { value: null }
    }

    canvasController = useCanvasController(
      mockCircuitManager,
      mockCanvasOperations,
      mockWireManagement,
      mockSelection,
      mockDragAndDrop
    )
  })

  afterEach(() => {
    // Restore original globals
    global.navigator = originalNavigator
    if (originalExecCommand) {
      global.document.execCommand = originalExecCommand
    }
    vi.clearAllMocks()
  })

  describe('Modern Clipboard API Support', () => {
    it('should use modern clipboard API when available', async () => {
      // Mock modern clipboard API
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard()
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('should handle clipboard write permission errors', async () => {
      // Mock clipboard API that fails
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard(true)
      }

      const result = await canvasController.copySelected()

      // Should still succeed with internal clipboard
      expect(result).toBe(true)
    })

    it('should handle clipboard read permission errors', async () => {
      // Mock clipboard API that fails on read
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(),
          readText: vi.fn().mockRejectedValue(new Error('Permission denied'))
        }
      }

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await canvasController.pasteFromClipboard()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('No clipboard data available')
      consoleSpy.mockRestore()
    })

    it('should handle clipboard API not available', async () => {
      // Mock browser without clipboard API
      global.navigator = {}

      const result = await canvasController.copySelected()

      // Should still succeed with internal clipboard
      expect(result).toBe(true)
    })
  })

  describe('Fallback execCommand Support', () => {
    it('should use execCommand when clipboard API unavailable', async () => {
      // Mock old browser without clipboard API
      global.navigator = {}
      global.document.execCommand = mockClipboardAPI.createMockExecCommand()
      global.document.queryCommandSupported = vi.fn().mockReturnValue(true)

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(global.document.execCommand).toHaveBeenCalledWith('copy')
    })

    it('should handle execCommand failures', async () => {
      // Mock execCommand that fails
      global.navigator = {}
      global.document.execCommand = mockClipboardAPI.createMockExecCommand(true)
      global.document.queryCommandSupported = vi.fn().mockReturnValue(true)

      const result = await canvasController.copySelected()

      // Should still succeed with internal clipboard
      expect(result).toBe(true)
    })

    it('should handle execCommand not supported', async () => {
      // Mock browser without execCommand support
      global.navigator = {}
      global.document.queryCommandSupported = vi.fn().mockReturnValue(false)

      const result = await canvasController.copySelected()

      // Should still succeed with internal clipboard
      expect(result).toBe(true)
    })

    it('should create and remove temporary textarea for execCommand', async () => {
      global.navigator = {}
      global.document.execCommand = mockClipboardAPI.createMockExecCommand()
      global.document.queryCommandSupported = vi.fn().mockReturnValue(true)
      
      // Mock DOM methods
      const mockTextarea = {
        select: vi.fn(),
        style: {}
      }
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockTextarea)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      await canvasController.copySelected()

      expect(createElementSpy).toHaveBeenCalledWith('textarea')
      expect(appendChildSpy).toHaveBeenCalledWith(mockTextarea)
      expect(mockTextarea.select).toHaveBeenCalled()
      expect(removeChildSpy).toHaveBeenCalledWith(mockTextarea)

      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('Security Context Requirements', () => {
    it('should handle secure context requirements', async () => {
      // Mock HTTPS context
      global.location = { protocol: 'https:' }
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard()
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('should handle non-secure context gracefully', async () => {
      // Mock HTTP context (clipboard API might not be available)
      global.location = { protocol: 'http:' }
      global.navigator = {} // No clipboard API

      const result = await canvasController.copySelected()

      // Should still work with internal clipboard
      expect(result).toBe(true)
    })
  })

  describe('Browser-Specific Behaviors', () => {
    it('should handle Chrome clipboard behavior', async () => {
      // Mock Chrome-like behavior
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard(),
        userAgent: 'Chrome/91.0.4472.124'
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('should handle Firefox clipboard behavior', async () => {
      // Mock Firefox-like behavior (more restrictive)
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied'))
        },
        userAgent: 'Firefox/89.0'
      }

      const result = await canvasController.copySelected()

      // Should succeed with internal clipboard
      expect(result).toBe(true)
    })

    it('should handle Safari clipboard behavior', async () => {
      // Mock Safari-like behavior
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard(),
        userAgent: 'Safari/14.1.1'
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled()
    })

    it('should handle Internet Explorer fallback', async () => {
      // Mock IE-like environment
      global.navigator = {
        userAgent: 'MSIE 11.0'
      }
      global.document.execCommand = mockClipboardAPI.createMockExecCommand()
      global.document.queryCommandSupported = vi.fn().mockReturnValue(true)

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(global.document.execCommand).toHaveBeenCalledWith('copy')
    })
  })

  describe('Clipboard Data Format Support', () => {
    it('should handle text/plain format', async () => {
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard()
      }

      await canvasController.copySelected()

      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('"version"')
      )
    })

    it('should handle JSON serialization', async () => {
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard()
      }

      await canvasController.copySelected()

      const writeTextCall = global.navigator.clipboard.writeText.mock.calls[0][0]
      expect(() => JSON.parse(writeTextCall)).not.toThrow()
    })

    it('should handle large clipboard data', async () => {
      // Mock large circuit with many components
      const largeComponents = Array.from({ length: 100 }, (_, i) => ({
        ...mockComponents.singleInput,
        id: `input_${i}_test`
      }))
      
      mockCircuitManager.activeCircuit.value.components = largeComponents
      mockSelection.selectedComponents.value = new Set(largeComponents.map(c => c.id))

      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard()
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
      expect(global.navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  describe('Permission Handling', () => {
    it('should handle clipboard-write permission', async () => {
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard(),
        permissions: {
          query: vi.fn().mockResolvedValue({ state: 'granted' })
        }
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
    })

    it('should handle clipboard-read permission', async () => {
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(),
          readText: vi.fn().mockResolvedValue('{"version": "1.0", "elements": {"components": [], "wires": [], "junctions": []}}')
        },
        permissions: {
          query: vi.fn().mockResolvedValue({ state: 'granted' })
        }
      }

      canvasController.clipboardController.hasClipboardData.value = false
      const result = await canvasController.pasteFromClipboard()

      expect(result).toBe(true)
    })

    it('should handle permission denied gracefully', async () => {
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied'))
        },
        permissions: {
          query: vi.fn().mockResolvedValue({ state: 'denied' })
        }
      }

      const result = await canvasController.copySelected()

      // Should still succeed with internal clipboard
      expect(result).toBe(true)
    })
  })

  describe('Cross-Origin and iframe Support', () => {
    it('should handle same-origin clipboard access', async () => {
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard()
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
    })

    it('should handle cross-origin clipboard restrictions', async () => {
      // Mock cross-origin scenario
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Cross-origin error'))
        }
      }

      const result = await canvasController.copySelected()

      // Should still succeed with internal clipboard
      expect(result).toBe(true)
    })

    it('should handle iframe clipboard access', async () => {
      // Mock iframe environment
      global.parent = {}
      global.navigator = {
        clipboard: mockClipboardAPI.createMockNavigatorClipboard()
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true)
    })
  })

  describe('Error Recovery', () => {
    it('should recover from clipboard API errors', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      global.navigator = {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard error'))
        }
      }

      const result = await canvasController.copySelected()

      expect(result).toBe(true) // Should still succeed with internal clipboard
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to copy to OS clipboard:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })

    it('should recover from execCommand errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      global.navigator = {}
      global.document.execCommand = vi.fn().mockImplementation(() => {
        throw new Error('execCommand error')
      })

      const result = await canvasController.copySelected()

      expect(result).toBe(true) // Should still succeed with internal clipboard
      consoleSpy.mockRestore()
    })

    it('should provide consistent behavior across browsers', async () => {
      // Test different browser scenarios
      const browsers = [
        { name: 'Chrome', hasClipboard: true },
        { name: 'Firefox', hasClipboard: false },
        { name: 'Safari', hasClipboard: true },
        { name: 'IE', hasClipboard: false }
      ]

      for (const browser of browsers) {
        if (browser.hasClipboard) {
          global.navigator = {
            clipboard: mockClipboardAPI.createMockNavigatorClipboard()
          }
        } else {
          global.navigator = {}
          global.document.execCommand = mockClipboardAPI.createMockExecCommand()
          global.document.queryCommandSupported = vi.fn().mockReturnValue(true)
        }

        const result = await canvasController.copySelected()
        expect(result).toBe(true) // Should work consistently
      }
    })
  })
})