import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useAutosave } from '@/composables/useAutosave'

describe('useAutosave', () => {
  let mockCircuitManager
  let autosave
  let originalLocalStorage

  beforeEach(() => {
    // Mock localStorage
    originalLocalStorage = global.localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    }

    // Mock Object.keys for localStorage enumeration
    Object.keys = vi.fn(() => [])

    // Mock circuit manager
    const circuit1 = {
      id: 'circuit_1',
      name: 'Circuit1',
      components: [
        { id: 'comp1', type: 'and', x: 100, y: 100 },
        { id: 'comp2', type: 'or', x: 200, y: 200 }
      ],
      wires: [
        { id: 'wire1', from: 'comp1', to: 'comp2' }
      ]
    }

    const circuit2 = {
      id: 'circuit_2',
      name: 'Circuit2',
      components: [
        { id: 'comp3', type: 'not', x: 300, y: 300 }
      ],
      wires: []
    }

    mockCircuitManager = {
      allCircuits: ref(new Map([
        ['circuit_1', circuit1],
        ['circuit_2', circuit2]
      ])),
      availableComponents: ref(new Map()),
      activeTabId: ref('circuit_1'),
      openTabs: ref([
        { id: 'circuit_1' },
        { id: 'circuit_2' }
      ])
    }

    autosave = useAutosave(mockCircuitManager)
  })

  afterEach(() => {
    global.localStorage = originalLocalStorage
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with autosave enabled', () => {
      expect(autosave.isAutosaveEnabled.value).toBe(true)
    })

    it('should provide all required methods', () => {
      expect(typeof autosave.performAutosave).toBe('function')
      expect(typeof autosave.debouncedAutosave).toBe('function')
      expect(typeof autosave.getAvailableRestores).toBe('function')
      expect(typeof autosave.restoreFromAutosave).toBe('function')
      expect(typeof autosave.garbageCollectAutosaves).toBe('function')
    })
  })

  describe('autosave operations', () => {
    it('should perform autosave successfully', () => {
      const result = autosave.performAutosave()

      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalled()
      expect(autosave.lastSaveTime.value).toBeTruthy()
    })

    it('should include all circuit data in autosave', () => {
      autosave.performAutosave()

      const [key, dataString] = localStorage.setItem.mock.calls[0]
      const data = JSON.parse(dataString)

      expect(key).toMatch(/^golden-gates-autosave-\d+$/)
      expect(data).toHaveProperty('version', '1.1')
      expect(data).toHaveProperty('activeTabId', 'circuit_1')
      expect(data).toHaveProperty('allCircuits')
      expect(data).toHaveProperty('openTabs')
      expect(data.allCircuits).toHaveProperty('circuit_1')
      expect(data.allCircuits).toHaveProperty('circuit_2')
      expect(data.openTabs).toHaveLength(2)
    })

    it('should calculate correct component count', () => {
      autosave.performAutosave()

      const [, dataString] = localStorage.setItem.mock.calls[0]
      const data = JSON.parse(dataString)

      // circuit_1 has 2 components, circuit_2 has 1 component = 3 total
      expect(data.metadata.componentCount).toBe(3)
      expect(data.metadata.circuitCount).toBe(2)
    })

    it('should skip autosave when disabled', () => {
      autosave.setAutosaveEnabled(false)
      const result = autosave.performAutosave()

      expect(result).toBe(false)
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('garbage collection', () => {
    beforeEach(() => {
      // Mock existing autosave keys
      Object.keys = vi.fn(() => [
        'golden-gates-autosave-1000000000000',
        'golden-gates-autosave-1000000000001',
        'golden-gates-autosave-1000000000002',
        'golden-gates-autosave-1000000000003',
        'golden-gates-autosave-1000000000004',
        'golden-gates-autosave-1000000000005', // This should be removed (6th oldest)
        'golden-gates-autosave-1000000000006', // This should be removed (7th oldest)
        'other-key' // Should be ignored
      ])
    })

    it('should remove autosaves beyond MAX_AUTOSAVES limit', () => {
      const removedCount = autosave.garbageCollectAutosaves()

      expect(removedCount).toBe(2) // Should remove 2 oldest
      expect(localStorage.removeItem).toHaveBeenCalledWith('golden-gates-autosave-1000000000000')
      expect(localStorage.removeItem).toHaveBeenCalledWith('golden-gates-autosave-1000000000001')
      expect(localStorage.removeItem).toHaveBeenCalledTimes(2)
    })

    it('should not remove non-autosave keys', () => {
      autosave.garbageCollectAutosaves()

      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other-key')
    })
  })

  describe('restoration', () => {
    it('should provide restoration methods', () => {
      expect(typeof autosave.getAvailableRestores).toBe('function')
      expect(typeof autosave.restoreFromAutosave).toBe('function')
    })

    it('should handle missing autosave data', () => {
      localStorage.getItem.mockReturnValue(null)

      const result = autosave.restoreFromAutosave('invalid-key')

      expect(result).toBe(false)
    })

    it('should handle corrupted autosave data', () => {
      localStorage.getItem.mockReturnValue('invalid-json')

      const result = autosave.restoreFromAutosave('corrupted-key')

      expect(result).toBe(false)
    })
  })

  describe('storage limits', () => {
    it('should provide storage usage calculation', () => {
      expect(typeof autosave.getAutosaveStorageUsage).toBe('function')
      expect(typeof autosave.garbageCollectAutosaves).toBe('function')
    })
  })

  describe('storage usage calculation', () => {
    beforeEach(() => {
      Object.keys = vi.fn(() => [
        'golden-gates-autosave-1000000000000',
        'golden-gates-autosave-1000000000001',
        'other-key'
      ])

      localStorage.getItem = vi.fn()
        .mockReturnValueOnce('{"test": "data1"}') // 17 characters
        .mockReturnValueOnce('{"test": "data2"}') // 17 characters
        .mockReturnValueOnce('other data')
    })

    it('should calculate autosave storage usage correctly', () => {
      const usage = autosave.getAutosaveStorageUsage()

      expect(usage).toBe(34) // 17 + 17 characters
      expect(localStorage.getItem).toHaveBeenCalledTimes(2) // Only autosave keys
    })
  })

  describe('immediate autosave', () => {
    it('should perform immediate autosave when called', () => {
      const result = autosave.immediateAutosave()
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should provide debounced autosave method', () => {
      // Just test that the method exists and is callable
      expect(typeof autosave.debouncedAutosave).toBe('function')
      expect(() => autosave.debouncedAutosave()).not.toThrow()
    })
  })

  describe('configuration', () => {
    it('should allow enabling/disabling autosave', () => {
      expect(autosave.isAutosaveEnabled.value).toBe(true)

      autosave.setAutosaveEnabled(false)
      expect(autosave.isAutosaveEnabled.value).toBe(false)

      autosave.setAutosaveEnabled(true)
      expect(autosave.isAutosaveEnabled.value).toBe(true)
    })
  })

  describe('clear all autosaves', () => {
    beforeEach(() => {
      Object.keys = vi.fn(() => [
        'golden-gates-autosave-1000000000000',
        'golden-gates-autosave-1000000000001',
        'other-key'
      ])
    })

    it('should clear all autosave data', () => {
      const clearedCount = autosave.clearAllAutosaves()

      expect(clearedCount).toBe(2)
      expect(localStorage.removeItem).toHaveBeenCalledWith('golden-gates-autosave-1000000000000')
      expect(localStorage.removeItem).toHaveBeenCalledWith('golden-gates-autosave-1000000000001')
      expect(localStorage.removeItem).not.toHaveBeenCalledWith('other-key')
    })
  })
})