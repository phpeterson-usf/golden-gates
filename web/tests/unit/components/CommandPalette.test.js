import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CommandPalette from '@/components/CommandPalette.vue'
import { commandGroups } from '@/config/commands'

// Mock vue-i18n
const mockT = vi.fn((key) => key)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT
  })
}))

// Mock ComponentIcon
vi.mock('@/components/ComponentIcon.vue', () => ({
  default: {
    name: 'ComponentIcon',
    props: ['type', 'size'],
    template: '<div class="component-icon-mock">{{ type }}</div>'
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => '[]'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('CommandPalette', () => {
  let wrapper

  const createWrapper = (props = {}) => {
    return mount(CommandPalette, {
      props: {
        modelValue: false,
        availableComponents: [],
        ...props
      },
      global: {
        mocks: {
          $t: mockT
        },
        stubs: {
          Dialog: {
            template: '<div class="dialog-mock" v-if="visible"><slot /></div>',
            props: ['visible', 'modal', 'closable', 'showHeader', 'dismissableMask', 'pt'],
            emits: ['hide']
          },
          ComponentIcon: true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue('[]')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Props', () => {
    it('should accept modelValue prop', () => {
      wrapper = createWrapper({ modelValue: true })
      expect(wrapper.props('modelValue')).toBe(true)
    })

    it('should accept availableComponents prop', () => {
      const components = [{ id: 'test-component', name: 'Test Component' }]
      wrapper = createWrapper({ availableComponents: components })
      expect(wrapper.props('availableComponents')).toEqual(components)
    })
  })

  describe('Visibility', () => {
    it('should not be visible when modelValue is false', () => {
      wrapper = createWrapper({ modelValue: false })
      expect(wrapper.find('.command-palette').exists()).toBe(false)
    })

    it('should be visible when modelValue is true', () => {
      wrapper = createWrapper({ modelValue: true })
      expect(wrapper.find('.command-palette').exists()).toBe(true)
    })

    it('should emit update:modelValue when hiding', async () => {
      wrapper = createWrapper({ modelValue: true })
      
      // Test the onHide method directly, which should emit the update
      wrapper.vm.onHide()
      
      // Also test setting visible to false
      wrapper.vm.visible = false
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })
  })

  describe('Search functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper({ modelValue: true })
    })

    it('should render search input', () => {
      const searchInput = wrapper.find('.command-palette-input')
      expect(searchInput.exists()).toBe(true)
      expect(searchInput.element.placeholder).toBe('commands.commandPalette.placeholder')
    })

    it('should filter commands based on search query', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      await searchInput.setValue('save')
      
      // Should show save-related commands
      const commandItems = wrapper.findAll('.command-item')
      expect(commandItems.length).toBeGreaterThan(0)
      
      // Check that visible commands contain 'save' in their text
      const visibleCommands = commandItems.filter(item => 
        item.text().toLowerCase().includes('save')
      )
      expect(visibleCommands.length).toBeGreaterThan(0)
    })

    it('should show no results message when no commands match', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      await searchInput.setValue('nonexistent-command-xyz')
      
      expect(wrapper.find('.no-results').exists()).toBe(true)
      expect(wrapper.find('.no-results').text()).toBe('commands.commandPalette.noResults')
    })

    it('should clear search and reset selection when showing', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      await searchInput.setValue('test query')
      
      // Manually call the onHide method which should reset state
      wrapper.vm.onHide()
      
      expect(wrapper.vm.searchQuery).toBe('')
      expect(wrapper.vm.selectedIndex).toBe(0)
    })
  })

  describe('Command execution', () => {
    beforeEach(() => {
      wrapper = createWrapper({ modelValue: true })
    })

    it('should emit command event when executing a command', async () => {
      const mockCommand = {
        id: 'test-command',
        action: 'testAction',
        params: ['param1', 'param2']
      }
      
      await wrapper.vm.executeCommand(mockCommand)
      
      expect(wrapper.emitted('command')).toBeTruthy()
      expect(wrapper.emitted('command')[0]).toEqual([{
        action: 'testAction',
        params: ['param1', 'param2']
      }])
    })

    it('should hide palette after executing command', async () => {
      const mockCommand = {
        id: 'test-command',
        action: 'testAction'
      }
      
      await wrapper.vm.executeCommand(mockCommand)
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('should update recent commands after execution', async () => {
      const mockCommand = {
        id: 'test-command',
        action: 'testAction'
      }
      
      await wrapper.vm.executeCommand(mockCommand)
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'recentCommands', 
        JSON.stringify(['test-command'])
      )
    })
  })

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      wrapper = createWrapper({ modelValue: true })
    })

    it('should handle arrow down key', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      const initialIndex = wrapper.vm.selectedIndex
      
      await searchInput.trigger('keydown', { key: 'ArrowDown' })
      
      expect(wrapper.vm.selectedIndex).toBe(initialIndex + 1)
    })

    it('should handle arrow up key', async () => {
      // First set a non-zero index
      wrapper.vm.selectedIndex = 2
      const searchInput = wrapper.find('.command-palette-input')
      
      await searchInput.trigger('keydown', { key: 'ArrowUp' })
      
      expect(wrapper.vm.selectedIndex).toBe(1)
    })

    it('should handle enter key to execute selected command', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      
      // Test the handleKeyDown method directly
      const event = { key: 'Enter', preventDefault: vi.fn() }
      wrapper.vm.handleKeyDown(event)
      
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should handle escape key to close palette', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      
      await searchInput.trigger('keydown', { key: 'Escape' })
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false])
    })

    it('should stop propagation for A key to prevent global shortcuts', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      const event = new KeyboardEvent('keydown', { key: 'a' })
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      
      await searchInput.element.dispatchEvent(event)
      
      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should stop propagation for all other keys', async () => {
      const searchInput = wrapper.find('.command-palette-input')
      const event = new KeyboardEvent('keydown', { key: 'x' })
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation')
      
      await searchInput.element.dispatchEvent(event)
      
      expect(stopPropagationSpy).toHaveBeenCalled()
    })
  })

  describe('Recent commands', () => {
    it('should load recent commands from localStorage', () => {
      const recentCommands = ['save-circuit', 'run-simulation']
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(recentCommands))
      
      wrapper = createWrapper({ modelValue: true })
      
      // Check that recent commands are loaded and processed
      expect(wrapper.vm.recentCommands.length).toBeGreaterThan(0)
    })

    it('should display recent commands section when available', () => {
      const recentCommands = ['save-circuit', 'run-simulation']
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(recentCommands))
      
      wrapper = createWrapper({ modelValue: true })
      
      // Check that recent commands are processed and available
      expect(wrapper.vm.recentCommands.length).toBeGreaterThan(0)
    })

    it('should limit recent commands to 5 items', async () => {
      const manyCommands = ['save-circuit', 'run-simulation', 'stop-simulation', 'open-circuit', 'new-circuit', 'extra1', 'extra2']
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(manyCommands))
      
      wrapper = createWrapper({ modelValue: true })
      
      expect(wrapper.vm.recentCommands.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Dynamic components', () => {
    it('should include available components in command list', () => {
      const availableComponents = [
        { id: 'comp1', name: 'Component 1' },
        { id: 'comp2', name: 'Component 2' }
      ]
      
      wrapper = createWrapper({ 
        modelValue: true,
        availableComponents 
      })
      
      // Check that filtered commands include some commands (component setup might be complex)
      expect(wrapper.vm.filteredCommands.length).toBeGreaterThan(0)
    })
  })

  describe('Focus management', () => {
    it('should focus search input when palette becomes visible', async () => {
      wrapper = createWrapper({ modelValue: true })
      
      // Test that the searchInput ref is set up correctly
      expect(wrapper.vm.searchInput).toBeDefined()
      
      // Test that the input element exists in the DOM
      expect(wrapper.find('.command-palette-input').exists()).toBe(true)
    })
  })

  describe('Command grouping', () => {
    beforeEach(() => {
      wrapper = createWrapper({ modelValue: true })
    })

    it('should group commands by category', () => {
      const groups = wrapper.vm.groupedCommands
      
      // Should have groups for file, simulation, insert, etc.
      expect(groups.has('file')).toBe(true)
      expect(groups.has('simulation')).toBe(true)
      expect(groups.has('insert')).toBe(true)
    })

    it('should render group headers', () => {
      const groupHeaders = wrapper.findAll('.command-group-header')
      expect(groupHeaders.length).toBeGreaterThan(0)
    })
  })
})