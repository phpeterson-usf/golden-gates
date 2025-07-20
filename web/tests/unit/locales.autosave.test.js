import { describe, it, expect } from 'vitest'
import enLocale from '@/locales/en.json'

describe('Autosave Localization', () => {
  describe('command palette strings', () => {
    it('should have restore autosave command string', () => {
      expect(enLocale.commands.file.restoreAutosave).toBeDefined()
      expect(enLocale.commands.file.restoreAutosave).toBe('Restore Previous Work')
    })

    it('should have restore command in file group alongside other file commands', () => {
      const fileCommands = enLocale.commands.file

      expect(fileCommands.newCircuit).toBeDefined()
      expect(fileCommands.openCircuit).toBeDefined()
      expect(fileCommands.saveCircuit).toBeDefined()
      expect(fileCommands.restoreAutosave).toBeDefined()
    })

    it('should use consistent naming pattern with other commands', () => {
      const fileCommands = enLocale.commands.file

      // All file commands should be in imperative form
      expect(fileCommands.newCircuit).toMatch(/^(New|Create)/i)
      expect(fileCommands.openCircuit).toMatch(/^Open/i)
      expect(fileCommands.saveCircuit).toMatch(/^Save/i)
      expect(fileCommands.restoreAutosave).toMatch(/^Restore/i)
    })
  })

  describe('existing autosave dialog strings', () => {
    it('should maintain all existing autosave dialog strings', () => {
      const autosaveStrings = enLocale.autosave

      expect(autosaveStrings.restoreTitle).toBe('Restore Previous Work?')
      expect(autosaveStrings.foundVersions).toBeDefined()
      expect(autosaveStrings.timeAgo.lessThanMinute).toBeDefined()
      expect(autosaveStrings.timeAgo.minutes).toBeDefined()
      expect(autosaveStrings.timeAgo.hoursAndMinutes).toBeDefined()
      expect(autosaveStrings.circuitCount).toBeDefined()
      expect(autosaveStrings.componentCount).toBeDefined()
      expect(autosaveStrings.activeCircuit).toBeDefined()
      expect(autosaveStrings.restoreSelected).toBeDefined()
      expect(autosaveStrings.cancel).toBeDefined()
      expect(autosaveStrings.restoreError).toBeDefined()
    })

    it('should have consistent title between command and dialog', () => {
      // The command and dialog should use consistent language
      const commandTitle = enLocale.commands.file.restoreAutosave
      const dialogTitle = enLocale.autosave.restoreTitle

      // Both should mention "restore" and "work" or similar concepts
      expect(commandTitle.toLowerCase()).toContain('restore')
      expect(dialogTitle.toLowerCase()).toContain('restore')
      expect(commandTitle.toLowerCase()).toMatch(/work|previous/)
      expect(dialogTitle.toLowerCase()).toMatch(/work|previous/)
    })
  })

  describe('string interpolation', () => {
    it('should have proper interpolation syntax for count-based strings', () => {
      const autosaveStrings = enLocale.autosave

      expect(autosaveStrings.foundVersions).toContain('{count}')
      expect(autosaveStrings.foundVersions).toContain('{plural}')
      expect(autosaveStrings.circuitCount).toContain('{count}')
      expect(autosaveStrings.circuitCount).toContain('{plural}')
      expect(autosaveStrings.componentCount).toContain('{count}')
      expect(autosaveStrings.componentCount).toContain('{plural}')
    })

    it('should have proper interpolation syntax for time strings', () => {
      const timeStrings = enLocale.autosave.timeAgo

      expect(timeStrings.minutes).toContain('{count}')
      expect(timeStrings.minutes).toContain('{plural}')
      expect(timeStrings.hoursAndMinutes).toContain('{hours}')
      expect(timeStrings.hoursAndMinutes).toContain('{hoursPlural}')
      expect(timeStrings.hoursAndMinutes).toContain('{minutes}')
      expect(timeStrings.hoursAndMinutes).toContain('{minutesPlural}')
    })

    it('should have proper interpolation syntax for active circuit string', () => {
      expect(enLocale.autosave.activeCircuit).toContain('{name}')
    })
  })

  describe('user experience consistency', () => {
    it('should use user-friendly language', () => {
      const commandTitle = enLocale.commands.file.restoreAutosave
      const dialogTitle = enLocale.autosave.restoreTitle

      // Should avoid technical jargon like "autosave"
      expect(commandTitle.toLowerCase()).not.toContain('autosave')
      expect(dialogTitle.toLowerCase()).not.toContain('autosave')

      // Should use friendly terms
      expect(commandTitle.toLowerCase()).toMatch(/previous|work|restore/)
      expect(dialogTitle.toLowerCase()).toMatch(/previous|work|restore/)
    })

    it('should have appropriate button labels', () => {
      const autosaveStrings = enLocale.autosave

      expect(autosaveStrings.restoreSelected).toBe('Restore Selected')
      expect(autosaveStrings.cancel).toBe('Cancel')

      // Button labels should be clear and actionable
      expect(autosaveStrings.restoreSelected).toMatch(/^(Restore|Select|Choose)/i)
      expect(autosaveStrings.cancel).toMatch(/^(Cancel|Close|Dismiss)/i)
    })
  })
})
