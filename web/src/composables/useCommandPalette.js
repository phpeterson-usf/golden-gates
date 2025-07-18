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
    // Don't trigger shortcuts when typing in input fields
    const target = event.target
    if (target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true' ||
        target.isContentEditable ||
        target.closest('.p-inputtext') ||
        target.closest('.p-inputnumber') ||
        target.closest('input')) {
      return
    }
    
    // Only G to open command palette
    if (event.key === 'g' || event.key === 'G') {
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