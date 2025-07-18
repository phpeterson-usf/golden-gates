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
      // On Mac, use metaKey (Cmd), on Windows/Linux use ctrlKey
      metaKey: isMac && (parts.includes('Cmd') || parts.includes('Ctrl')),
      ctrlKey: !isMac && (parts.includes('Cmd') || parts.includes('Ctrl')),
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
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return
    }
    
    // Get all commands with shortcuts
    const commands = getAllCommands().filter(cmd => cmd.shortcut)
    
    // Check if any command matches
    for (const command of commands) {
      if (matchesShortcut(event, command.shortcut)) {
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