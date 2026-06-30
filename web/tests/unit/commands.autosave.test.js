import { describe, it, expect } from 'vitest'
import { commandGroups, getAllCommands } from '@/config/commands'

describe('File Command Configuration', () => {
  describe('command groups', () => {
    it('should have a file group', () => {
      expect(commandGroups.file).toBeDefined()
      expect(commandGroups.file.items).toBeDefined()
    })

    it('should include new-circuit command in file group', () => {
      const fileGroup = commandGroups.file
      expect(fileGroup.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'new-circuit',
            action: 'createNewCircuit'
          })
        ])
      )
    })

    it('should not include save-circuit in command palette (moved to native menu)', () => {
      const allCommands = getAllCommands()
      const saveCommand = allCommands.find(cmd => cmd.id === 'save-circuit')
      expect(saveCommand).toBeUndefined()
    })

    it('should not include open-circuit in command palette (moved to native menu)', () => {
      const allCommands = getAllCommands()
      const openCommand = allCommands.find(cmd => cmd.id === 'open-circuit')
      expect(openCommand).toBeUndefined()
    })

    it('should not include restore-autosave in command palette (removed)', () => {
      const allCommands = getAllCommands()
      const restoreCommand = allCommands.find(cmd => cmd.id === 'restore-autosave')
      expect(restoreCommand).toBeUndefined()
    })

    it('should not include separators in flat command list', () => {
      const allCommands = getAllCommands()
      const separators = allCommands.filter(cmd => cmd.separator === true)
      expect(separators).toHaveLength(0)
    })
  })
})
