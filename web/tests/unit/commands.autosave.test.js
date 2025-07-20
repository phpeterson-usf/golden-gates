import { describe, it, expect, vi, beforeEach } from 'vitest'
import { commandGroups, getAllCommands } from '@/config/commands'

describe('Autosave Command Configuration', () => {
  describe('command groups', () => {
    it('should include restore autosave command in file group', () => {
      const fileGroup = commandGroups.file

      expect(fileGroup).toBeDefined()
      expect(fileGroup.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'restore-autosave',
            labelKey: 'commands.file.restoreAutosave',
            icon: 'pi pi-history',
            action: 'restoreAutosave'
          })
        ])
      )
    })

    it('should have separator before restore command for visual organization', () => {
      const fileItems = commandGroups.file.items
      const restoreIndex = fileItems.findIndex(item => item.id === 'restore-autosave')

      expect(restoreIndex).toBeGreaterThan(0)
      expect(fileItems[restoreIndex - 1]).toEqual({ separator: true })
    })

    it('should place restore command after save command', () => {
      const fileItems = commandGroups.file.items
      const saveIndex = fileItems.findIndex(item => item.id === 'save-circuit')
      const restoreIndex = fileItems.findIndex(item => item.id === 'restore-autosave')

      expect(saveIndex).toBeGreaterThan(-1)
      expect(restoreIndex).toBeGreaterThan(saveIndex)
    })
  })

  describe('getAllCommands', () => {
    it('should include restore autosave command in flat command list', () => {
      const allCommands = getAllCommands()

      const restoreCommand = allCommands.find(cmd => cmd.id === 'restore-autosave')

      expect(restoreCommand).toBeDefined()
      expect(restoreCommand).toEqual({
        id: 'restore-autosave',
        labelKey: 'commands.file.restoreAutosave',
        icon: 'pi pi-history',
        action: 'restoreAutosave',
        groupKey: 'file',
        groupLabelKey: 'commands.groups.file'
      })
    })

    it('should not include separators in flat command list', () => {
      const allCommands = getAllCommands()

      const separators = allCommands.filter(cmd => cmd.separator === true)
      expect(separators).toHaveLength(0)
    })
  })

  describe('command properties', () => {
    it('should have correct icon for restore command', () => {
      const fileItems = commandGroups.file.items
      const restoreCommand = fileItems.find(item => item.id === 'restore-autosave')

      expect(restoreCommand.icon).toBe('pi pi-history')
    })

    it('should have correct action for restore command', () => {
      const fileItems = commandGroups.file.items
      const restoreCommand = fileItems.find(item => item.id === 'restore-autosave')

      expect(restoreCommand.action).toBe('restoreAutosave')
    })

    it('should have localized label key', () => {
      const fileItems = commandGroups.file.items
      const restoreCommand = fileItems.find(item => item.id === 'restore-autosave')

      expect(restoreCommand.labelKey).toBe('commands.file.restoreAutosave')
    })

    it('should not have shortcut key (advanced feature)', () => {
      const fileItems = commandGroups.file.items
      const restoreCommand = fileItems.find(item => item.id === 'restore-autosave')

      expect(restoreCommand.shortcut).toBeUndefined()
    })
  })
})
