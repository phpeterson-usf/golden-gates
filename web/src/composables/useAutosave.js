import { ref, watch } from 'vue'

/**
 * Simple debounce utility
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Autosave functionality with LRU garbage collection
 * Provides automatic saving of circuit data to localStorage with intelligent cleanup
 */
export function useAutosave(circuitManager) {
  // Configuration
  const AUTOSAVE_KEY_PREFIX = 'golden-gates-autosave'
  const MAX_AUTOSAVES = 5 // Keep last 5 autosaves (LRU)
  const DEBOUNCE_MS = 2000 // 2 seconds after last change
  const STORAGE_LIMIT_MB = 3 // Conservative localStorage limit

  // State
  const isAutosaveEnabled = ref(true)
  const lastSaveTime = ref(null)
  let debounceTimer = null

  /**
   * Get current timestamp for autosave entries
   */
  function getTimestamp() {
    return Date.now()
  }

  /**
   * Generate autosave key with timestamp
   */
  function generateAutosaveKey(timestamp = getTimestamp()) {
    return `${AUTOSAVE_KEY_PREFIX}-${timestamp}`
  }

  /**
   * Get all existing autosave keys sorted by timestamp (newest first)
   */
  function getAutosaveKeys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(AUTOSAVE_KEY_PREFIX))
      .map(key => {
        const timestamp = parseInt(key.split('-').pop())
        return { key, timestamp }
      })
      .sort((a, b) => b.timestamp - a.timestamp) // Newest first
  }

  /**
   * Estimate localStorage usage for our autosaves
   */
  function getAutosaveStorageUsage() {
    let totalBytes = 0
    getAutosaveKeys().forEach(({ key }) => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          totalBytes += data.length
        }
      } catch (e) {
        // Invalid data, will be cleaned up
      }
    })
    return totalBytes
  }

  /**
   * Pure LRU Garbage Collection - keep only the most recent MAX_AUTOSAVES
   * No time-based deletion to prevent losing work after long breaks
   */
  function garbageCollectAutosaves() {
    const autosaves = getAutosaveKeys() // Already sorted newest-first

    // LRU: Remove autosaves beyond our limit (keep only MAX_AUTOSAVES most recent)
    const toRemove = autosaves.slice(MAX_AUTOSAVES)

    toRemove.forEach(({ key }) => {
      try {
        localStorage.removeItem(key)
        // Autosave garbage collection removed old save
      } catch (e) {
        console.warn(`Failed to remove autosave ${key}:`, e)
      }
    })

    return toRemove.length
  }

  /**
   * Check if storage usage is approaching limits
   */
  function checkStorageLimit() {
    const usageBytes = getAutosaveStorageUsage()
    const usageMB = usageBytes / (1024 * 1024)

    if (usageMB > STORAGE_LIMIT_MB) {
      console.warn(
        `Autosave storage usage (${usageMB.toFixed(2)}MB) exceeds limit (${STORAGE_LIMIT_MB}MB)`
      )
      return false
    }
    return true
  }

  /**
   * Save all circuits to localStorage with timestamp
   */
  function performAutosave() {
    if (!isAutosaveEnabled.value) return false

    try {
      // Garbage collect before saving to make room
      garbageCollectAutosaves()

      // Check storage limits
      if (!checkStorageLimit()) {
        console.warn('Autosave skipped: storage limit exceeded')
        return false
      }

      // Prepare complete workspace state
      const autosaveData = {
        version: '1.2', // Bumped version for nextCircuitId field
        timestamp: getTimestamp(),
        activeTabId: circuitManager.activeTabId.value,
        openTabs: circuitManager.openTabs.value, // Save tab state
        nextCircuitId: circuitManager.exportState().nextCircuitId, // Save circuit ID counter
        allCircuits: Object.fromEntries(circuitManager.allCircuits.value),
        availableComponents: Object.fromEntries(circuitManager.availableComponents.value),
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          circuitCount: circuitManager.allCircuits.value.size,
          componentCount: Array.from(circuitManager.allCircuits.value.values()).reduce(
            (total, circuit) => total + (circuit.components?.length || 0),
            0
          ),
          openTabCount: circuitManager.openTabs.value.length
        }
      }

      // Save to localStorage
      const key = generateAutosaveKey()
      localStorage.setItem(key, JSON.stringify(autosaveData))

      lastSaveTime.value = autosaveData.timestamp
      // Autosaved workspace successfully
      return true
    } catch (error) {
      console.error('Autosave failed:', error)

      // If storage is full, try aggressive cleanup and retry once
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting cleanup...')
        const removed = garbageCollectAutosaves()
        if (removed > 0) {
          try {
            const retryData = {
              version: '1.0',
              timestamp: getTimestamp(),
              activeTabId: circuitManager.activeTabId.value,
              allCircuits: Object.fromEntries(circuitManager.allCircuits.value),
              availableComponents: Object.fromEntries(circuitManager.availableComponents.value)
            }
            const key = generateAutosaveKey()
            localStorage.setItem(key, JSON.stringify(retryData))
            lastSaveTime.value = retryData.timestamp
            // Autosave retry successful after cleanup
            return true
          } catch (retryError) {
            console.error('Autosave retry failed:', retryError)
          }
        }
      }
      return false
    }
  }

  /**
   * Debounced autosave - delays save until no changes for DEBOUNCE_MS
   */
  function debouncedAutosave() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      performAutosave()
      debounceTimer = null
    }, DEBOUNCE_MS)
  }

  /**
   * Immediate autosave (for visibility change, etc.)
   */
  function immediateAutosave() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    return performAutosave()
  }

  /**
   * Get available autosaves for restoration with full details
   */
  function getAvailableRestores() {
    return getAutosaveKeys()
      .map(({ key, timestamp }) => {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          return {
            key,
            timestamp,
            date: new Date(timestamp),
            circuitCount: Object.keys(data.allCircuits || {}).length,
            componentCount: Object.values(data.allCircuits || {}).reduce(
              (total, circuit) => total + (circuit.components?.length || 0),
              0
            ),
            activeCircuit: data.activeTabId,
            version: data.version || 'legacy',
            allCircuits: data.allCircuits || {}, // Include circuit data for preview
            isValid: true
          }
        } catch (e) {
          return {
            key,
            timestamp,
            isValid: false
          }
        }
      })
      .filter(restore => restore.isValid)
      .slice(0, MAX_AUTOSAVES) // Only show the most recent ones
  }

  /**
   * Restore workspace from autosave
   */
  function restoreFromAutosave(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key))
      if (!data) {
        throw new Error('Autosave data not found')
      }

      // Restore circuit manager state
      circuitManager.allCircuits.value.clear()
      circuitManager.availableComponents.value.clear()
      circuitManager.openTabs.value = [] // Clear existing tabs

      // Restore all circuits
      if (data.allCircuits) {
        Object.entries(data.allCircuits).forEach(([id, circuit]) => {
          circuitManager.allCircuits.value.set(id, circuit)
        })
      }

      // Restore open tabs
      if (data.openTabs) {
        // Version 1.1+ includes openTabs
        circuitManager.openTabs.value = [...data.openTabs]
      } else {
        // Legacy version 1.0 - create tabs for all circuits
        Object.keys(data.allCircuits || {}).forEach(id => {
          circuitManager.openTabs.value.push({ id })
        })
      }

      // Restore available components
      if (data.availableComponents) {
        Object.entries(data.availableComponents).forEach(([id, component]) => {
          circuitManager.availableComponents.value.set(id, component)
        })
      }

      // Restore active tab
      if (data.activeTabId && circuitManager.allCircuits.value.has(data.activeTabId)) {
        circuitManager.activeTabId.value = data.activeTabId
      } else if (circuitManager.openTabs.value.length > 0) {
        // Fallback to first tab if saved active tab doesn't exist
        circuitManager.activeTabId.value = circuitManager.openTabs.value[0].id
      }

      // Restore nextCircuitId counter (version 1.2+)
      if (data.nextCircuitId) {
        const currentState = circuitManager.exportState()
        currentState.nextCircuitId = data.nextCircuitId
        circuitManager.importState(currentState)
      }

      // Restored workspace successfully
      return true
    } catch (error) {
      console.error('Failed to restore autosave:', error)
      return false
    }
  }

  /**
   * Clear all autosaves (for privacy/reset)
   */
  function clearAllAutosaves() {
    const keys = getAutosaveKeys()
    keys.forEach(({ key }) => {
      localStorage.removeItem(key)
    })
    // Cleared autosaves
    return keys.length
  }

  /**
   * Initialize autosave system
   */
  function initializeAutosave() {
    // Clean up old saves on startup
    garbageCollectAutosaves()

    // Set up watchers for circuit changes
    watch(
      () => circuitManager.allCircuits.value,
      () => {
        debouncedAutosave()
      },
      { deep: true }
    )

    watch(
      () => circuitManager.availableComponents.value,
      () => {
        debouncedAutosave()
      },
      { deep: true }
    )

    // Backup save when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        immediateAutosave()
      }
    })

    // Autosave system initialized
  }

  return {
    // State
    isAutosaveEnabled,
    lastSaveTime,

    // Core functions
    performAutosave,
    debouncedAutosave,
    immediateAutosave,
    initializeAutosave,

    // Restoration
    getAvailableRestores,
    restoreFromAutosave,

    // Management
    garbageCollectAutosaves,
    clearAllAutosaves,
    getAutosaveStorageUsage,

    // Configuration
    setAutosaveEnabled: enabled => {
      isAutosaveEnabled.value = enabled
    }
  }
}
