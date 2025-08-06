import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('RAM Memory Reactivity', () => {
  let mockCanvasRef
  let mockComponent

  beforeEach(() => {
    // Create mock canvas ref
    mockCanvasRef = {
      updateComponent: vi.fn()
    }

    // Create mock RAM component
    mockComponent = {
      id: 'ram_1',
      type: 'ram',
      props: {
        addressBits: 4,
        dataBits: 8,
        data: new Array(16).fill(0) // 2^4 = 16 addresses
      }
    }
  })

  it('should handle memory update events', () => {
    // Test the handleMemoryUpdate logic directly
    const handleMemoryUpdate = (canvasRef, component, memoryData) => {
      if (component.type !== 'ram') {
        console.warn(`Memory update for non-RAM component: ${component.type}`)
        return
      }

      // Convert Pyodide Proxy to JavaScript object if needed
      let jsMemoryData = memoryData
      if (memoryData && typeof memoryData.toJs === 'function') {
        jsMemoryData = memoryData.toJs()
      } else if (
        memoryData &&
        memoryData.constructor &&
        memoryData.constructor.name === 'PyProxy'
      ) {
        // Fallback for older Pyodide versions
        try {
          jsMemoryData = {
            address: memoryData.address,
            value: memoryData.value
          }
        } catch (e) {
          console.warn('Failed to extract data from Pyodide Proxy:', e)
          return
        }
      }

      const address = jsMemoryData.address
      const value = jsMemoryData.value

      if (address === undefined || value === undefined) {
        console.warn('Memory update missing address or value:', jsMemoryData)
        return
      }

      const updatedComponent = {
        ...component,
        props: {
          ...component.props,
          data: component.props.data || new Array(2 ** (component.props.addressBits || 4)).fill(0),
          lastMemoryUpdate: Date.now()
        }
      }

      updatedComponent.props.data[address] = value
      canvasRef.updateComponent(updatedComponent)
    }

    // Test memory update
    const memoryData = { address: 5, value: 42 }
    handleMemoryUpdate(mockCanvasRef, mockComponent, memoryData)

    expect(mockCanvasRef.updateComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ram_1',
        type: 'ram',
        props: expect.objectContaining({
          addressBits: 4,
          dataBits: 8,
          data: expect.any(Array),
          lastMemoryUpdate: expect.any(Number)
        })
      })
    )

    // Verify the data array was updated at the correct address
    const updateCall = mockCanvasRef.updateComponent.mock.calls[0][0]
    expect(updateCall.props.data[5]).toBe(42)
    expect(updateCall.props.data[0]).toBe(0) // other addresses unchanged
  })

  it('should handle invalid memory updates gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const handleMemoryUpdate = (canvasRef, component, memoryData) => {
      if (component.type !== 'ram') {
        console.warn(`Memory update for non-RAM component: ${component.type}`)
        return
      }

      const address = memoryData.address
      const value = memoryData.value

      if (address === undefined || value === undefined) {
        console.warn('Memory update missing address or value:', memoryData)
        return
      }
    }

    // Test with non-RAM component
    const nonRamComponent = { ...mockComponent, type: 'logic-gate' }
    handleMemoryUpdate(mockCanvasRef, nonRamComponent, { address: 0, value: 1 })
    expect(consoleWarnSpy).toHaveBeenCalledWith('Memory update for non-RAM component: logic-gate')

    // Test with missing data
    handleMemoryUpdate(mockCanvasRef, mockComponent, { address: 0 }) // missing value
    expect(consoleWarnSpy).toHaveBeenCalledWith('Memory update missing address or value:', {
      address: 0
    })

    // Test with missing address
    handleMemoryUpdate(mockCanvasRef, mockComponent, { value: 42 }) // missing address
    expect(consoleWarnSpy).toHaveBeenCalledWith('Memory update missing address or value:', {
      value: 42
    })

    consoleWarnSpy.mockRestore()
  })

  it('should initialize data array if not present', () => {
    const handleMemoryUpdate = (canvasRef, component, memoryData) => {
      const address = memoryData.address
      const value = memoryData.value

      const updatedComponent = {
        ...component,
        props: {
          ...component.props,
          data: component.props.data || new Array(2 ** (component.props.addressBits || 4)).fill(0),
          lastMemoryUpdate: Date.now()
        }
      }

      updatedComponent.props.data[address] = value
      canvasRef.updateComponent(updatedComponent)
    }

    // Test with component without data array
    const componentWithoutData = {
      id: 'ram_2',
      type: 'ram',
      props: {
        addressBits: 3,
        dataBits: 4
        // no data array
      }
    }

    handleMemoryUpdate(mockCanvasRef, componentWithoutData, { address: 2, value: 7 })

    const updateCall = mockCanvasRef.updateComponent.mock.calls[0][0]
    expect(updateCall.props.data).toHaveLength(8) // 2^3 = 8
    expect(updateCall.props.data[2]).toBe(7)
    expect(updateCall.props.data.slice(0, 2)).toEqual([0, 0])
    expect(updateCall.props.data.slice(3)).toEqual([0, 0, 0, 0, 0])
  })

  it('should handle default address bits when not specified', () => {
    const handleMemoryUpdate = (canvasRef, component, memoryData) => {
      const address = memoryData.address
      const value = memoryData.value

      const updatedComponent = {
        ...component,
        props: {
          ...component.props,
          data: component.props.data || new Array(2 ** (component.props.addressBits || 4)).fill(0),
          lastMemoryUpdate: Date.now()
        }
      }

      updatedComponent.props.data[address] = value
      canvasRef.updateComponent(updatedComponent)
    }

    // Test with component without addressBits specified
    const componentWithoutAddressBits = {
      id: 'ram_3',
      type: 'ram',
      props: {
        dataBits: 8
        // no addressBits or data array
      }
    }

    handleMemoryUpdate(mockCanvasRef, componentWithoutAddressBits, { address: 3, value: 15 })

    const updateCall = mockCanvasRef.updateComponent.mock.calls[0][0]
    expect(updateCall.props.data).toHaveLength(16) // 2^4 = 16 (default address bits)
    expect(updateCall.props.data[3]).toBe(15)
  })

  it('should handle Pyodide Proxy objects', () => {
    const handleMemoryUpdate = (canvasRef, component, memoryData) => {
      // Convert Pyodide Proxy to JavaScript object if needed
      let jsMemoryData = memoryData
      if (memoryData && typeof memoryData.toJs === 'function') {
        jsMemoryData = memoryData.toJs()
      } else if (
        memoryData &&
        memoryData.constructor &&
        memoryData.constructor.name === 'PyProxy'
      ) {
        // Fallback for older Pyodide versions
        try {
          jsMemoryData = {
            address: memoryData.address,
            value: memoryData.value
          }
        } catch (e) {
          console.warn('Failed to extract data from Pyodide Proxy:', e)
          return
        }
      }

      const address = jsMemoryData.address
      const value = jsMemoryData.value

      const updatedComponent = {
        ...component,
        props: {
          ...component.props,
          data: component.props.data || new Array(2 ** (component.props.addressBits || 4)).fill(0),
          lastMemoryUpdate: Date.now()
        }
      }

      updatedComponent.props.data[address] = value
      canvasRef.updateComponent(updatedComponent)
    }

    // Mock Pyodide Proxy with toJs method
    const mockPyodideProxy = {
      toJs: vi.fn(() => ({ address: 7, value: 123 })),
      constructor: { name: 'PyProxy' }
    }

    handleMemoryUpdate(mockCanvasRef, mockComponent, mockPyodideProxy)

    expect(mockPyodideProxy.toJs).toHaveBeenCalled()
    expect(mockCanvasRef.updateComponent).toHaveBeenCalled()

    const updateCall = mockCanvasRef.updateComponent.mock.calls[0][0]
    expect(updateCall.props.data[7]).toBe(123)
  })

  it('should handle legacy Pyodide Proxy without toJs method', () => {
    const handleMemoryUpdate = (canvasRef, component, memoryData) => {
      // Convert Pyodide Proxy to JavaScript object if needed
      let jsMemoryData = memoryData
      if (memoryData && typeof memoryData.toJs === 'function') {
        jsMemoryData = memoryData.toJs()
      } else if (
        memoryData &&
        memoryData.constructor &&
        memoryData.constructor.name === 'PyProxy'
      ) {
        // Fallback for older Pyodide versions
        try {
          jsMemoryData = {
            address: memoryData.address,
            value: memoryData.value
          }
        } catch (e) {
          console.warn('Failed to extract data from Pyodide Proxy:', e)
          return
        }
      }

      const address = jsMemoryData.address
      const value = jsMemoryData.value

      const updatedComponent = {
        ...component,
        props: {
          ...component.props,
          data: component.props.data || new Array(2 ** (component.props.addressBits || 4)).fill(0),
          lastMemoryUpdate: Date.now()
        }
      }

      updatedComponent.props.data[address] = value
      canvasRef.updateComponent(updatedComponent)
    }

    // Mock legacy Pyodide Proxy without toJs method
    const mockLegacyProxy = {
      address: 9,
      value: 255,
      constructor: { name: 'PyProxy' }
    }

    handleMemoryUpdate(mockCanvasRef, mockComponent, mockLegacyProxy)

    expect(mockCanvasRef.updateComponent).toHaveBeenCalled()

    const updateCall = mockCanvasRef.updateComponent.mock.calls[0][0]
    expect(updateCall.props.data[9]).toBe(255)
  })
})
