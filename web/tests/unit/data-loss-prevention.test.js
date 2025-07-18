import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import App from '../../src/App.vue'
import ConfirmationDialog from '../../src/components/ConfirmationDialog.vue'

/**
 * Data Loss Prevention Test Suite
 * 
 * This test suite focuses on the critical data loss prevention functionality:
 * 1. Confirmation dialogs when closing tabs with unsaved work
 * 2. Proper button configurations (safe defaults)
 * 3. Warning messages for data loss scenarios
 */

// Mock the composables for App tests
const mockCircuitManager = {
  tabs: [{ id: 'circuit_1', name: 'Test Circuit' }],
  activeTabId: 'circuit_1',
  activeCircuit: { id: 'circuit_1', name: 'Test Circuit', components: [], wires: [] },
  allCircuits: new Map(),
  availableComponentsArray: [],
  createCircuit: vi.fn(),
  switchToTab: vi.fn(),
  closeTab: vi.fn(),
  getCircuit: vi.fn()
}

const mockCircuitOperations = {
  createNewCircuit: vi.fn(),
  runSimulation: vi.fn(),
  stopSimulation: vi.fn(),
  saveCircuit: vi.fn(),
  openCircuit: vi.fn(),
  loadCircuitData: vi.fn(),
  handleDroppedFile: vi.fn(),
  handleInspectorAction: vi.fn(),
  showConfirmation: vi.fn(),
  hasUnsavedWork: vi.fn(),
  handleBeforeUnload: vi.fn(),
  isRunning: false,
  isPyodideLoading: false,
  isPyodideReady: true,
  pyodideError: null,
  pyodide: {},
  showConfirmDialog: false,
  confirmDialog: {}
}

const mockCommandPalette = {
  isVisible: false
}

vi.mock('../../src/composables/useCircuitModel', () => ({
  useCircuitModel: () => mockCircuitManager
}))

vi.mock('../../src/composables/useAppController', () => ({
  useAppController: () => mockCircuitOperations
}))

vi.mock('../../src/composables/useCommandPalette', () => ({
  useCommandPalette: () => mockCommandPalette
}))

vi.mock('../../src/composables/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn()
}))

describe('Data Loss Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCircuitManager.getCircuit = vi.fn()
  })

  describe('Tab Closing - Critical Data Loss Prevention', () => {
    const createAppWrapper = () => {
      return mount(App, {
        global: {
          mocks: {
            $t: (key) => key
          },
          stubs: {
            Button: true,
            Toolbar: true,
            CircuitCanvas: true,
            ComponentInspector: true,
            ConfirmationDialog: true,
            CommandPalette: true,
            GoldenGateLogo: true
          }
        }
      })
    }

    it('CRITICAL: Should show confirmation when closing tab with unsaved components', async () => {
      const wrapper = createAppWrapper()
      
      // Circuit with unsaved components
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [{ id: 'comp1', type: 'and' }],
        wires: []
      })

      await wrapper.vm.handleCloseTab('circuit_1')

      // CRITICAL: Must show confirmation to prevent data loss
      expect(mockCircuitOperations.showConfirmation).toHaveBeenCalled()
      expect(mockCircuitManager.closeTab).not.toHaveBeenCalled()

      const confirmationCall = mockCircuitOperations.showConfirmation.mock.calls[0][0]
      expect(confirmationCall.type).toBe('warning')
      expect(confirmationCall.title).toBe('dialogs.unsavedChanges')
      expect(confirmationCall.message).toBe('dialogs.unsavedChangesMessage')
    })

    it('CRITICAL: Should show confirmation when closing tab with unsaved wires', async () => {
      const wrapper = createAppWrapper()
      
      // Circuit with unsaved wires
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [],
        wires: [{ id: 'wire1', from: 'comp1', to: 'comp2' }]
      })

      await wrapper.vm.handleCloseTab('circuit_1')

      // CRITICAL: Must show confirmation to prevent data loss
      expect(mockCircuitOperations.showConfirmation).toHaveBeenCalled()
      expect(mockCircuitManager.closeTab).not.toHaveBeenCalled()
    })

    it('SAFE: Should close immediately when no unsaved changes', async () => {
      const wrapper = createAppWrapper()
      
      // Empty circuit - no data to lose
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [],
        wires: []
      })

      await wrapper.vm.handleCloseTab('circuit_1')

      // Safe to close without confirmation
      expect(mockCircuitOperations.showConfirmation).not.toHaveBeenCalled()
      expect(mockCircuitManager.closeTab).toHaveBeenCalledWith('circuit_1')
    })

    it('CRITICAL: User can save data by cancelling close operation', async () => {
      const wrapper = createAppWrapper()
      
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [{ id: 'comp1', type: 'and' }],
        wires: []
      })

      await wrapper.vm.handleCloseTab('circuit_1')

      // Get the onReject callback and call it (user cancels)
      const confirmationCall = mockCircuitOperations.showConfirmation.mock.calls[0][0]
      confirmationCall.onReject()

      // Tab should NOT be closed (data is safe)
      expect(mockCircuitManager.closeTab).not.toHaveBeenCalled()
    })

    it('CRITICAL: User can explicitly choose to lose data', async () => {
      const wrapper = createAppWrapper()
      
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [{ id: 'comp1', type: 'and' }],
        wires: []
      })

      await wrapper.vm.handleCloseTab('circuit_1')

      // Get the onAccept callback and call it (user confirms data loss)
      const confirmationCall = mockCircuitOperations.showConfirmation.mock.calls[0][0]
      confirmationCall.onAccept()

      // Tab should be closed (user explicitly chose to lose data)
      expect(mockCircuitManager.closeTab).toHaveBeenCalledWith('circuit_1')
    })
  })

  describe('Confirmation Dialog - Safe Defaults', () => {
    const createDialogWrapper = (props = {}) => {
      return mount(ConfirmationDialog, {
        props: {
          visible: false,
          message: 'Test message',
          ...props
        }
      })
    }

    it('CRITICAL: Default cancel button text is "Cancel" not "No" (safer)', () => {
      const wrapper = createDialogWrapper({ 
        visible: true,
        showCancel: true
      })

      const cancelButton = wrapper.find('.modal-button-cancel')
      expect(cancelButton.text()).toBe('Cancel')
    })

    it('CRITICAL: Warning dialogs show both Yes and Cancel buttons', () => {
      const wrapper = createDialogWrapper({ 
        visible: true,
        type: 'warning'
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(acceptButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(true)
    })

    it('SAFE: Info dialogs can show only OK button (no data loss)', () => {
      const wrapper = createDialogWrapper({ 
        visible: true,
        type: 'info',
        showCancel: false
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(acceptButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(false)
    })

    it('CRITICAL: Cannot accidentally close dialog by clicking overlay', async () => {
      const wrapper = createDialogWrapper({ visible: true })

      const overlay = wrapper.find('.modal-overlay')
      await overlay.trigger('click')

      // Should not emit any close events
      expect(wrapper.emitted('accept')).toBeFalsy()
      expect(wrapper.emitted('reject')).toBeFalsy()
      expect(wrapper.emitted('update:visible')).toBeFalsy()
    })

    it('CRITICAL: Dangerous button styling for data loss scenarios', () => {
      const wrapper = createDialogWrapper({ 
        visible: true,
        type: 'warning',
        acceptLabel: 'Close Without Saving'
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      expect(acceptButton.classes()).toContain('modal-button-warning')
      expect(acceptButton.text()).toBe('Close Without Saving')
    })
  })

  describe('hasCircuitUnsavedWork - Data Detection', () => {
    const createAppWrapper = () => {
      return mount(App, {
        global: {
          mocks: { $t: (key) => key },
          stubs: {
            Button: true, Toolbar: true, CircuitCanvas: true,
            ComponentInspector: true, ConfirmationDialog: true,
            CommandPalette: true, GoldenGateLogo: true
          }
        }
      })
    }

    it('CRITICAL: Detects unsaved components correctly', () => {
      const wrapper = createAppWrapper()
      
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [{ id: 'comp1', type: 'and' }],
        wires: []
      })

      const result = wrapper.vm.hasCircuitUnsavedWork('circuit_1')
      expect(result).toBe(true)
    })

    it('CRITICAL: Detects unsaved wires correctly', () => {
      const wrapper = createAppWrapper()
      
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [],
        wires: [{ id: 'wire1', from: 'comp1', to: 'comp2' }]
      })

      const result = wrapper.vm.hasCircuitUnsavedWork('circuit_1')
      expect(result).toBe(true)
    })

    it('SAFE: Empty circuit has no unsaved work', () => {
      const wrapper = createAppWrapper()
      
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: [],
        wires: []
      })

      const result = wrapper.vm.hasCircuitUnsavedWork('circuit_1')
      expect(result).toBe(false)
    })

    it('SAFE: Non-existent circuit has no unsaved work', () => {
      const wrapper = createAppWrapper()
      
      mockCircuitManager.getCircuit.mockReturnValue(null)

      const result = wrapper.vm.hasCircuitUnsavedWork('non-existent')
      expect(result).toBe(false)
    })

    it('SAFE: Handles malformed circuit data gracefully', () => {
      const wrapper = createAppWrapper()
      
      mockCircuitManager.getCircuit.mockReturnValue({
        id: 'circuit_1',
        components: undefined,
        wires: null
      })

      const result = wrapper.vm.hasCircuitUnsavedWork('circuit_1')
      
      // When components/wires are undefined/null, the function returns a falsy value
      // which is safe (no data loss detection when data is malformed)
      expect(result).toBeFalsy()
    })
  })

  describe('Error Dialogs - No Data Loss Risk', () => {
    it('SAFE: Error dialogs show only OK button (no choices = no data loss)', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: {
          visible: true,
          title: 'Error',
          message: 'Failed to save',
          type: 'danger',
          showCancel: false
        }
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(acceptButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(false)
      expect(acceptButton.classes()).toContain('modal-button-danger')
    })

    it('SAFE: Success dialogs show only OK button', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: {
          visible: true,
          title: 'Success',
          message: 'Component saved',
          type: 'info',
          showCancel: false
        }
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(acceptButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(false)
      expect(acceptButton.classes()).toContain('modal-button-info')
    })
  })
})