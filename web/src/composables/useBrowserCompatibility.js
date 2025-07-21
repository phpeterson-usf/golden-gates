import { ref } from 'vue'

/**
 * Browser Compatibility Check
 * Centralized feature detection for required browser capabilities
 */
export function useBrowserCompatibility() {
  const isCompatible = ref(null)
  const incompatibleFeatures = ref([])
  const browserRecommendations = ref([
    {
      name: 'Chrome',
      minVersion: '61',
      icon: 'pi pi-chrome',
      downloadUrl: 'https://www.google.com/chrome/'
    },
    {
      name: 'Firefox',
      minVersion: '60',
      icon: 'pi pi-firefox',
      downloadUrl: 'https://www.mozilla.org/firefox/'
    },
    {
      name: 'Safari',
      minVersion: '11',
      icon: 'pi pi-apple',
      downloadUrl: 'https://www.apple.com/safari/'
    },
    {
      name: 'Edge',
      minVersion: '79',
      icon: 'pi pi-microsoft',
      downloadUrl: 'https://www.microsoft.com/edge'
    }
  ])

  /**
   * Check for WebAssembly support
   */
  const checkWebAssembly = () => {
    try {
      if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
        return true
      }
    } catch (e) {
      // WebAssembly not supported
    }
    return false
  }

  /**
   * Check for ES Modules support
   */
  const checkESModules = () => {
    try {
      // Check for static import support (indirectly via script type="module")
      const script = document.createElement('script')
      const supportsModule = 'noModule' in script
      
      // If we've gotten this far in a module-based app, we have module support
      // The app itself is loaded as a module, so if this code is running, modules work
      return supportsModule
    } catch (e) {
      return false
    }
  }

  /**
   * Check for SharedArrayBuffer support
   * Note: This requires specific CORS headers to be set
   */
  const checkSharedArrayBuffer = () => {
    try {
      // SharedArrayBuffer might be disabled even if defined due to Spectre mitigations
      if (typeof SharedArrayBuffer !== 'undefined') {
        // Try to create one to verify it's actually available
        const sab = new SharedArrayBuffer(1)
        return sab.byteLength === 1
      }
    } catch (e) {
      // SharedArrayBuffer blocked or not available
    }
    return false
  }

  /**
   * Check for required SVG support
   */
  const checkSVGSupport = () => {
    try {
      // Check basic SVG support
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      if (!svg || !svg.createSVGPoint) return false

      // Check for SVG transform support
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.setAttribute('transform', 'rotate(45)')
      if (!g.transform) return false

      // Check for SVG path support
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', 'M 0 0 L 10 10')
      if (!path.getTotalLength) return false

      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Check for modern JavaScript features
   */
  const checkModernJS = () => {
    try {
      // Check for async/await
      const AsyncFunction = (async function () {}).constructor
      if (!AsyncFunction) return false

      // Check for arrow functions
      const arrowFn = () => true
      if (!arrowFn()) return false

      // Check for Promise
      if (typeof Promise === 'undefined') return false

      // Check for Map/Set
      if (typeof Map === 'undefined' || typeof Set === 'undefined') return false

      // Check for Array methods
      if (!Array.prototype.includes || !Array.prototype.find) return false

      // Check for Object methods
      if (!Object.entries || !Object.values) return false

      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Check for localStorage support
   */
  const checkLocalStorage = () => {
    try {
      const testKey = '__golden_gates_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Run all compatibility checks
   */
  const checkBrowserCompatibility = () => {
    incompatibleFeatures.value = []

    // Critical features
    if (!checkWebAssembly()) {
      incompatibleFeatures.value.push('webAssembly')
    }

    if (!checkESModules()) {
      incompatibleFeatures.value.push('esModules')
    }

    if (!checkSharedArrayBuffer()) {
      incompatibleFeatures.value.push('sharedArrayBuffer')
    }

    if (!checkModernJS()) {
      incompatibleFeatures.value.push('modernJS')
    }

    if (!checkSVGSupport()) {
      incompatibleFeatures.value.push('svg')
    }

    // Non-critical but important
    if (!checkLocalStorage()) {
      incompatibleFeatures.value.push('localStorage')
    }

    // Set overall compatibility
    isCompatible.value = incompatibleFeatures.value.length === 0

    return isCompatible.value
  }

  return {
    isCompatible,
    incompatibleFeatures,
    browserRecommendations,
    checkBrowserCompatibility,
    // Export individual checks for testing
    checkWebAssembly,
    checkESModules,
    checkSharedArrayBuffer,
    checkSVGSupport,
    checkModernJS,
    checkLocalStorage
  }
}