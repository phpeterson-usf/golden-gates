import { mount, shallowMount } from '@vue/test-utils'

/**
 * Creates a wrapper for Vue components with common test setup
 * @param {Object} component - Vue component to mount
 * @param {Object} options - Mount options
 * @returns {Object} - Vue test utils wrapper
 */
export function createWrapper(component, options = {}) {
  const defaultOptions = {
    global: {
      // Add global plugins, mocks, etc. here if needed
    }
  }
  
  return mount(component, {
    ...defaultOptions,
    ...options
  })
}

/**
 * Creates a shallow wrapper for Vue components (faster for unit tests)
 * @param {Object} component - Vue component to mount
 * @param {Object} options - Mount options
 * @returns {Object} - Vue test utils wrapper
 */
export function createShallowWrapper(component, options = {}) {
  const defaultOptions = {
    global: {
      // Add global plugins, mocks, etc. here if needed
    }
  }
  
  return shallowMount(component, {
    ...defaultOptions,
    ...options
  })
}

/**
 * Creates mock props for components that need common props
 * @param {Object} overrides - Props to override
 * @returns {Object} - Mock props object
 */
export function createMockProps(overrides = {}) {
  return {
    id: 'test-component',
    x: 0,
    y: 0,
    selected: false,
    ...overrides
  }
}

/**
 * Helper to wait for Vue's nextTick in tests
 * @param {Object} wrapper - Vue test utils wrapper
 * @returns {Promise} - Promise that resolves after nextTick
 */
export async function waitForUpdate(wrapper) {
  await wrapper.vm.$nextTick()
}

/**
 * Helper to trigger an event and wait for updates
 * @param {Object} wrapper - Vue test utils wrapper
 * @param {string} selector - CSS selector or component reference
 * @param {string} eventName - Event name to trigger
 * @param {*} eventData - Event data
 */
export async function triggerAndWait(wrapper, selector, eventName, eventData) {
  await wrapper.find(selector).trigger(eventName, eventData)
  await wrapper.vm.$nextTick()
}