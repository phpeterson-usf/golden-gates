import { ref, onMounted, onUnmounted } from 'vue'

export function useCommandPalette() {
  const isVisible = ref(false)
  
  // Show command palette
  function show() {
    isVisible.value = true
  }
  
  // Hide command palette
  function hide() {
    isVisible.value = false
  }
  
  // Toggle command palette
  function toggle() {
    isVisible.value = !isVisible.value
  }
  
  // Handle global keyboard shortcut
  function handleGlobalKeyDown(event) {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open command palette
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      toggle()
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
    isVisible,
    show,
    hide,
    toggle
  }
}