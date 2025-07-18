import { onMounted, onUnmounted } from 'vue'
import { getAllCommands } from '../config/commands'

export function useKeyboardShortcuts(handleCommand) {
  // Detect platform
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  // Parse shortcut string into key components
  function parseShortcut(shortcut) {
    const parts = shortcut.split('+')
    const key = parts[parts.length - 1].toLowerCase()

    return {
      key,
      // Use ctrlKey on all platforms to avoid browser conflicts
      metaKey: false,
      ctrlKey: parts.includes('Cmd') || parts.includes('Ctrl'),
      shiftKey: parts.includes('Shift'),
      altKey: parts.includes('Alt')
    }
  }

  // Check if keyboard event matches shortcut
  function matchesShortcut(event, shortcut) {
    const parsed = parseShortcut(shortcut)

    // Special handling for Enter key
    const eventKey = event.key === 'Enter' ? 'enter' : event.key.toLowerCase()

    return (
      eventKey === parsed.key &&
      event.metaKey === parsed.metaKey &&
      event.ctrlKey === parsed.ctrlKey &&
      event.shiftKey === parsed.shiftKey &&
      event.altKey === parsed.altKey
    )
  }

  // Handle global keyboard shortcuts
  function handleGlobalKeyDown(event) {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable ||
      target.closest('.p-inputtext') ||
      target.closest('.p-inputnumber') ||
      target.closest('input')
    ) {
      return
    }

    // Handle single-key shortcuts
    const key = event.key.toLowerCase()

    // Handle "A" for "Again" - execute top recently used command
    if (key === 'a') {
      event.preventDefault()
      // Get recent commands from localStorage or a global store
      const recentCommandIds = JSON.parse(localStorage.getItem('recentCommands') || '[]')
      if (recentCommandIds.length > 0) {
        const allCommands = getAllCommands()
        const topRecentCommand = allCommands.find(cmd => cmd.id === recentCommandIds[0])
        if (topRecentCommand) {
          handleCommand({
            action: topRecentCommand.action,
            params: topRecentCommand.params || []
          })
        }
      }
      return
    }

    // Get all commands with shortcuts
    const commands = getAllCommands().filter(cmd => cmd.shortcut)

    // Check if any command matches (now just single keys)
    for (const command of commands) {
      if (key === command.shortcut.toLowerCase()) {
        event.preventDefault()
        handleCommand({
          action: command.action,
          params: command.params || []
        })
        break
      }
    }
  }

  // Set up and tear down keyboard listener
  onMounted(() => {
    window.addEventListener('keydown', handleGlobalKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleGlobalKeyDown)
  })

  return {
    isMac
  }
}
