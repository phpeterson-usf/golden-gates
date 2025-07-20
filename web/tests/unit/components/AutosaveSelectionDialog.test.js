import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import AutosaveSelectionDialog from '@/components/AutosaveSelectionDialog.vue'

// Mock i18n messages for testing
const i18nMessages = {
  en: {
    autosave: {
      restoreTitle: 'Restore Previous Work?',
      foundVersions: 'Found {count} saved version{plural}:',
      timeAgo: {
        lessThanMinute: 'less than 1 minute ago',
        minutes: '{count} minute{plural} ago',
        hoursAndMinutes: '{hours} hour{hoursPlural} and {minutes} minute{minutesPlural} ago'
      },
      circuitCount: '{count} circuit{plural}',
      componentCount: '{count} component{plural}',
      activeCircuit: 'Active: {name}',
      restoreSelected: 'Restore Selected',
      cancel: 'Cancel'
    }
  }
}

const createWrapper = (props = {}) => {
  const i18n = createI18n({
    locale: 'en',
    messages: i18nMessages
  })

  return mount(AutosaveSelectionDialog, {
    props: {
      visible: false,
      autosaves: [],
      ...props
    },
    global: {
      plugins: [i18n]
    }
  })
}

describe('AutosaveSelectionDialog', () => {
  let mockAutosaves

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Date.now for consistent time calculations
    const mockNow = 1000000000000 // Fixed timestamp
    vi.spyOn(Date, 'now').mockReturnValue(mockNow)

    mockAutosaves = [
      {
        key: 'golden-gates-autosave-999999998000', // 2000ms ago (less than 1 minute)
        timestamp: mockNow - 2000,
        circuitCount: 2,
        componentCount: 5,
        activeCircuit: 'circuit_1',
        allCircuits: {
          circuit_1: { name: 'Main Circuit' },
          circuit_2: { name: 'Test Circuit' }
        }
      },
      {
        key: 'golden-gates-autosave-999999940000', // 60000ms ago (1 minute)
        timestamp: mockNow - 60000,
        circuitCount: 1,
        componentCount: 3,
        activeCircuit: 'circuit_2',
        allCircuits: {
          circuit_2: { name: 'Another Circuit' }
        }
      },
      {
        key: 'golden-gates-autosave-999996200000', // 3800000ms ago (1 hour and 3 minutes)
        timestamp: mockNow - 3800000,
        circuitCount: 3,
        componentCount: 10,
        activeCircuit: 'circuit_3',
        allCircuits: {
          circuit_3: { name: 'Complex Circuit' }
        }
      }
    ]
  })

  describe('component rendering', () => {
    it('should not render when not visible', () => {
      const wrapper = createWrapper({ visible: false })

      expect(wrapper.find('.modal-overlay').exists()).toBe(false)
    })

    it('should render when visible', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
      expect(wrapper.find('.autosave-dialog').exists()).toBe(true)
    })

    it('should render title correctly', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      expect(wrapper.find('.modal-title').text()).toBe('Restore Previous Work?')
    })

    it('should render autosave count message', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      expect(wrapper.find('.modal-message').text()).toBe('Found 3 saved versions:')
    })

    it('should handle singular version count', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: [mockAutosaves[0]]
      })

      expect(wrapper.find('.modal-message').text()).toBe('Found 1 saved version:')
    })
  })

  describe('autosave list rendering', () => {
    it('should render all autosave items', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const items = wrapper.findAll('.autosave-item')
      expect(items).toHaveLength(3)
    })

    it('should render time ago correctly', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const timeElements = wrapper.findAll('.autosave-time')
      expect(timeElements[0].text()).toBe('less than 1 minute ago')
      expect(timeElements[1].text()).toBe('1 minute ago')
      expect(timeElements[2].text()).toBe('1 hour and 3 minutes ago')
    })

    it('should render circuit and component counts correctly', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const detailElements = wrapper.findAll('.autosave-details')
      expect(detailElements[0].text()).toBe('2 circuits, 5 components')
      expect(detailElements[1].text()).toBe('1 circuit, 3 components')
      expect(detailElements[2].text()).toBe('3 circuits, 10 components')
    })

    it('should handle singular counts correctly', () => {
      const singleAutosave = [
        {
          ...mockAutosaves[0],
          circuitCount: 1,
          componentCount: 1
        }
      ]

      const wrapper = createWrapper({
        visible: true,
        autosaves: singleAutosave
      })

      const details = wrapper.find('.autosave-details')
      expect(details.text()).toBe('1 circuit, 1 component')
    })

    it('should render active circuit name', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const activeElements = wrapper.findAll('.autosave-active')
      expect(activeElements[0].text()).toBe('Active: Main Circuit')
      expect(activeElements[1].text()).toBe('Active: Another Circuit')
      expect(activeElements[2].text()).toBe('Active: Complex Circuit')
    })

    it('should fallback to circuit ID when name not available', () => {
      const autosaveWithoutName = [
        {
          ...mockAutosaves[0],
          allCircuits: {
            circuit_1: {} // No name property
          }
        }
      ]

      const wrapper = createWrapper({
        visible: true,
        autosaves: autosaveWithoutName
      })

      const active = wrapper.find('.autosave-active')
      expect(active.text()).toBe('Active: circuit_1')
    })
  })

  describe('radio button selection', () => {
    it('should select first item by default when dialog opens', async () => {
      const wrapper = createWrapper({
        visible: false,
        autosaves: mockAutosaves
      })

      await wrapper.setProps({ visible: true })

      expect(wrapper.vm.selectedIndex).toBe(0)
      expect(wrapper.find('input[type="radio"]:checked').exists()).toBe(true)
    })

    it('should update selection when radio button is clicked', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const radioButtons = wrapper.findAll('input[type="radio"]')
      await radioButtons[1].setValue()

      expect(wrapper.vm.selectedIndex).toBe(1)
    })

    it('should update selection when item is clicked', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const items = wrapper.findAll('.autosave-item')
      await items[2].trigger('click')

      expect(wrapper.vm.selectedIndex).toBe(2)
    })

    it('should apply selected class to correct item', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      await wrapper.setData({ selectedIndex: 1 })

      const items = wrapper.findAll('.autosave-item')
      expect(items[0].classes()).not.toContain('selected')
      expect(items[1].classes()).toContain('selected')
      expect(items[2].classes()).not.toContain('selected')
    })
  })

  describe('button interactions', () => {
    it('should emit cancel when cancel button is clicked', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      await wrapper.find('.modal-button-cancel').trigger('click')

      expect(wrapper.emitted('cancel')).toHaveLength(1)
    })

    it('should emit cancel when overlay is clicked', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      await wrapper.find('.modal-overlay').trigger('click')

      expect(wrapper.emitted('cancel')).toHaveLength(1)
    })

    it('should not emit cancel when dialog content is clicked', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      await wrapper.find('.autosave-dialog').trigger('click')

      expect(wrapper.emitted('cancel')).toBeUndefined()
    })

    it('should emit restore with selected autosave when restore button is clicked', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      await wrapper.setData({ selectedIndex: 1 })
      await wrapper.find('.modal-button-confirm').trigger('click')

      expect(wrapper.emitted('restore')).toHaveLength(1)
      expect(wrapper.emitted('restore')[0][0]).toEqual(mockAutosaves[1])
    })

    it('should disable restore button when no selection', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      await wrapper.setData({ selectedIndex: null })

      const restoreButton = wrapper.find('.modal-button-confirm')
      expect(restoreButton.attributes('disabled')).toBeDefined()
    })

    it('should not emit restore when button is disabled', async () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      await wrapper.setData({ selectedIndex: null })
      await wrapper.find('.modal-button-confirm').trigger('click')

      expect(wrapper.emitted('restore')).toBeUndefined()
    })
  })

  describe('time formatting edge cases', () => {
    it('should format zero minutes correctly', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const result = wrapper.vm.formatTimeAgo(Date.now())
      expect(result).toBe('less than 1 minute ago')
    })

    it('should format hours with zero minutes', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const oneHourAgo = Date.now() - 60 * 60 * 1000
      const result = wrapper.vm.formatTimeAgo(oneHourAgo)
      expect(result).toBe('1 hour and 0 minutes ago')
    })

    it('should handle plural hours and singular minutes', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const twoHoursOneMinuteAgo = Date.now() - (2 * 60 * 60 * 1000 + 60 * 1000)
      const result = wrapper.vm.formatTimeAgo(twoHoursOneMinuteAgo)
      expect(result).toBe('2 hours and 1 minute ago')
    })
  })

  describe('watch behavior', () => {
    it('should reset selection when dialog becomes visible', async () => {
      const wrapper = createWrapper({
        visible: false,
        autosaves: mockAutosaves
      })

      await wrapper.setData({ selectedIndex: 2 })
      await wrapper.setProps({ visible: true })

      expect(wrapper.vm.selectedIndex).toBe(0)
    })

    it('should handle empty autosaves array', async () => {
      const wrapper = createWrapper({
        visible: false,
        autosaves: []
      })

      await wrapper.setProps({ visible: true })

      expect(wrapper.vm.selectedIndex).toBe(null)
    })
  })

  describe('accessibility', () => {
    it('should have radio group names based on timestamp', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      expect(wrapper.vm.radioGroupName).toMatch(/^autosave-\d+$/)
    })

    it('should associate labels with radio inputs', () => {
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      const labels = wrapper.findAll('label[for]')
      const inputs = wrapper.findAll('input[id]')

      expect(labels).toHaveLength(inputs.length)

      labels.forEach((label, index) => {
        const forValue = label.attributes('for')
        const inputId = inputs[index].attributes('id')
        expect(forValue).toBe(inputId)
      })
    })
  })

  describe('usage context (manual restore only)', () => {
    it('should work correctly when shown via command palette', () => {
      // This dialog is now only shown for manual restore via command palette
      const wrapper = createWrapper({
        visible: true,
        autosaves: mockAutosaves
      })

      // All functionality should work the same as before
      expect(wrapper.find('.modal-overlay').exists()).toBe(true)
      expect(wrapper.find('.modal-title').text()).toBe('Restore Previous Work?')
      expect(wrapper.vm.selectedIndex).toBe(0) // Default to newest
    })

    it('should handle empty autosaves list gracefully for manual restore', async () => {
      const wrapper = createWrapper({
        visible: false,
        autosaves: []
      })

      // Trigger the dialog to become visible
      await wrapper.setProps({ visible: true })
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.modal-message').text()).toBe('Found 0 saved versions:')
      expect(wrapper.findAll('.autosave-item')).toHaveLength(0)
      expect(wrapper.vm.selectedIndex).toBe(null)
    })

    it('should work with all 5 autosaves from command palette', () => {
      const fiveAutosaves = Array.from({ length: 5 }, (_, i) => ({
        ...mockAutosaves[0],
        key: `autosave-${i}`,
        timestamp: Date.now() - i * 60000 // 1 minute apart
      }))

      const wrapper = createWrapper({
        visible: true,
        autosaves: fiveAutosaves
      })

      expect(wrapper.findAll('.autosave-item')).toHaveLength(5)
      expect(wrapper.find('.modal-message').text()).toBe('Found 5 saved versions:')
    })
  })
})
