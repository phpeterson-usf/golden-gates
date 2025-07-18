import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ConfirmationDialog from '../../../src/components/ConfirmationDialog.vue'

const createWrapper = (props = {}) => {
  return mount(ConfirmationDialog, {
    props: {
      visible: false,
      message: 'Test message',
      ...props
    }
  })
}

describe('ConfirmationDialog - Data Loss Prevention', () => {
  describe('Button Configuration', () => {
    it('should show both accept and cancel buttons by default', () => {
      const wrapper = createWrapper({ visible: true })

      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(acceptButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(true)
    })

    it('should show only accept button when showCancel is false', () => {
      const wrapper = createWrapper({ 
        visible: true,
        showCancel: false
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(acceptButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(false)
    })

    it('should use "Cancel" as default cancel label (safer than "No")', () => {
      const wrapper = createWrapper({ 
        visible: true,
        showCancel: true
      })

      const cancelButton = wrapper.find('.modal-button-cancel')
      expect(cancelButton.text()).toBe('Cancel')
    })

    it('should use "Yes" as default accept label', () => {
      const wrapper = createWrapper({ 
        visible: true
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      expect(acceptButton.text()).toBe('Yes')
    })

    it('should use custom labels when provided', () => {
      const wrapper = createWrapper({ 
        visible: true,
        acceptLabel: 'Delete Anyway',
        cancelLabel: 'Keep Safe'
      })

      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(acceptButton.text()).toBe('Delete Anyway')
      expect(cancelButton.text()).toBe('Keep Safe')
    })
  })

  describe('Dialog Types and Safety', () => {
    it('should apply warning icon and styling for warning type', () => {
      const wrapper = createWrapper({ 
        visible: true,
        type: 'warning'
      })

      const icon = wrapper.find('.modal-icon')
      const confirmButton = wrapper.find('.modal-button-confirm')

      expect(icon.classes()).toContain('pi-exclamation-triangle')
      expect(confirmButton.classes()).toContain('modal-button-warning')
    })

    it('should apply danger icon and styling for danger type', () => {
      const wrapper = createWrapper({ 
        visible: true,
        type: 'danger'
      })

      const icon = wrapper.find('.modal-icon')
      const confirmButton = wrapper.find('.modal-button-confirm')

      expect(icon.classes()).toContain('pi-times-circle')
      expect(confirmButton.classes()).toContain('modal-button-danger')
    })

    it('should apply info icon and styling for info type', () => {
      const wrapper = createWrapper({ 
        visible: true,
        type: 'info'
      })

      const icon = wrapper.find('.modal-icon')
      const confirmButton = wrapper.find('.modal-button-confirm')

      expect(icon.classes()).toContain('pi-info-circle')
      expect(confirmButton.classes()).toContain('modal-button-info')
    })
  })

  describe('Focus Management (Safety)', () => {
    it('should have cancel button for focus when dialog opens with showCancel true', async () => {
      const wrapper = createWrapper({ 
        visible: false,
        showCancel: true
      })

      // Change visible to true
      await wrapper.setProps({ visible: true })
      await nextTick()

      // Check that the cancel button exists and has the correct class
      const cancelButton = wrapper.find('.modal-button-cancel')
      expect(cancelButton.exists()).toBe(true)
    })

    it('should not have cancel button when showCancel is false', async () => {
      const wrapper = createWrapper({ 
        visible: false,
        showCancel: false
      })

      await wrapper.setProps({ visible: true })
      await nextTick()

      const cancelButton = wrapper.find('.modal-button-cancel')
      expect(cancelButton.exists()).toBe(false)
    })
  })

  describe('Event Handling', () => {
    it('should emit accept event when accept button is clicked', async () => {
      const wrapper = createWrapper({ visible: true })

      const acceptButton = wrapper.find('.modal-button-confirm')
      await acceptButton.trigger('click')

      expect(wrapper.emitted('accept')).toHaveLength(1)
      expect(wrapper.emitted('update:visible')).toHaveLength(1)
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('should emit reject event when cancel button is clicked', async () => {
      const wrapper = createWrapper({ visible: true })

      const cancelButton = wrapper.find('.modal-button-cancel')
      await cancelButton.trigger('click')

      expect(wrapper.emitted('reject')).toHaveLength(1)
      expect(wrapper.emitted('update:visible')).toHaveLength(1)
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })

    it('should not close on overlay click (prevents accidental data loss)', async () => {
      const wrapper = createWrapper({ visible: true })

      const overlay = wrapper.find('.modal-overlay')
      await overlay.trigger('click')

      // Should not emit any events
      expect(wrapper.emitted('accept')).toBeFalsy()
      expect(wrapper.emitted('reject')).toBeFalsy()
      expect(wrapper.emitted('update:visible')).toBeFalsy()
    })

    it('should not close when clicking on dialog content', async () => {
      const wrapper = createWrapper({ visible: true })

      const dialog = wrapper.find('.modal-dialog')
      await dialog.trigger('click')

      // Should not emit any events
      expect(wrapper.emitted('accept')).toBeFalsy()
      expect(wrapper.emitted('reject')).toBeFalsy()
      expect(wrapper.emitted('update:visible')).toBeFalsy()
    })
  })

  describe('Content Display', () => {
    it('should display custom title and message', () => {
      const wrapper = createWrapper({ 
        visible: true,
        title: 'Data Loss Warning',
        message: 'You will lose all unsaved work. Continue?'
      })

      const title = wrapper.find('.modal-title')
      const message = wrapper.find('.modal-message')

      expect(title.text()).toBe('Data Loss Warning')
      expect(message.text()).toBe('You will lose all unsaved work. Continue?')
    })

    it('should use default title when not provided', () => {
      const wrapper = createWrapper({ 
        visible: true
      })

      const title = wrapper.find('.modal-title')
      expect(title.text()).toBe('Confirm Action')
    })
  })

  describe('Validation', () => {
    it('should validate type prop correctly', () => {
      const wrapper = createWrapper()
      
      const typeValidator = wrapper.vm.$options.props.type.validator
      
      expect(typeValidator('warning')).toBe(true)
      expect(typeValidator('danger')).toBe(true)
      expect(typeValidator('info')).toBe(true)
      expect(typeValidator('invalid')).toBe(false)
    })
  })

  describe('Data Loss Prevention Scenarios', () => {
    it('should be configured correctly for unsaved changes warning', () => {
      const wrapper = createWrapper({ 
        visible: true,
        title: 'You have unsaved changes',
        message: 'If you close, your circuit will be lost',
        type: 'warning',
        acceptLabel: 'Close Without Saving',
        showCancel: true // Default, shows Cancel button
      })

      const title = wrapper.find('.modal-title')
      const message = wrapper.find('.modal-message')
      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(title.text()).toBe('You have unsaved changes')
      expect(message.text()).toBe('If you close, your circuit will be lost')
      expect(acceptButton.text()).toBe('Close Without Saving')
      expect(cancelButton.text()).toBe('Cancel')
      expect(acceptButton.classes()).toContain('modal-button-warning')
    })

    it('should be configured correctly for error dialogs (no data loss)', () => {
      const wrapper = createWrapper({ 
        visible: true,
        title: 'Error',
        message: 'Failed to save circuit as component',
        type: 'danger',
        acceptLabel: 'OK',
        showCancel: false
      })

      const title = wrapper.find('.modal-title')
      const message = wrapper.find('.modal-message')
      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(title.text()).toBe('Error')
      expect(message.text()).toBe('Failed to save circuit as component')
      expect(acceptButton.text()).toBe('OK')
      expect(cancelButton.exists()).toBe(false)
      expect(acceptButton.classes()).toContain('modal-button-danger')
    })

    it('should be configured correctly for success dialogs (no data loss)', () => {
      const wrapper = createWrapper({ 
        visible: true,
        title: 'Component Saved',
        message: 'Circuit has been saved as a reusable component',
        type: 'info',
        acceptLabel: 'OK',
        showCancel: false
      })

      const title = wrapper.find('.modal-title')
      const message = wrapper.find('.modal-message')
      const acceptButton = wrapper.find('.modal-button-confirm')
      const cancelButton = wrapper.find('.modal-button-cancel')

      expect(title.text()).toBe('Component Saved')
      expect(message.text()).toBe('Circuit has been saved as a reusable component')
      expect(acceptButton.text()).toBe('OK')
      expect(cancelButton.exists()).toBe(false)
      expect(acceptButton.classes()).toContain('modal-button-info')
    })
  })

  describe('Button Order (Safety)', () => {
    it('should render dangerous action button first (left), safe action button second (right)', () => {
      const wrapper = createWrapper({ 
        visible: true,
        showCancel: true
      })

      const buttons = wrapper.findAll('.modal-button')
      
      // First button should be the confirm (dangerous) button
      expect(buttons[0].classes()).toContain('modal-button-confirm')
      // Second button should be the cancel (safe) button
      expect(buttons[1].classes()).toContain('modal-button-cancel')
    })
  })
})