<template>
  <div v-if="circuitTabs.length > 0" class="circuit-tabs-container">
    <Button
      v-if="showScrollButtons"
      icon="pi pi-chevron-left"
      class="tab-scroll-button tab-scroll-left"
      @click="scrollTabs('left')"
      text
      size="small"
      :disabled="!canScrollLeft"
    />
    <div class="circuit-tabs" ref="tabsContainer">
      <Button
        v-for="tab in circuitTabs"
        :key="tab.id"
        :label="tab.name"
        :class="['circuit-tab', { active: tab.id === activeTabId }]"
        @click="switchToTab(tab.id)"
        text
        size="small"
      >
        <template #default>
          <span>{{ tab.name }}</span>
          <i
            class="pi pi-times tab-close"
            @click.stop="handleCloseTab(tab.id)"
            v-if="circuitTabs.length > 1"
          ></i>
        </template>
      </Button>
    </div>
    <Button
      v-if="showScrollButtons"
      icon="pi pi-chevron-right"
      class="tab-scroll-button tab-scroll-right"
      @click="scrollTabs('right')"
      text
      size="small"
      :disabled="!canScrollRight"
    />
  </div>
</template>

<script>
import { useTabManagement } from '../composables/useTabManagement'
import { onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'CircuitTabsBar',
  props: {
    circuitTabs: {
      type: Array,
      required: true
    },
    activeTabId: {
      type: String,
      required: true
    },
    circuitManager: {
      type: Object,
      required: true
    }
  },
  emits: ['switchToTab', 'closeTab', 'showConfirmation'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const {
      showScrollButtons,
      canScrollLeft,
      canScrollRight,
      tabsContainer,
      scrollTabs,
      updateScrollButtonStates,
      checkTabOverflow,
      hasCircuitUnsavedWork
    } = useTabManagement()

    function switchToTab(tabId) {
      emit('switchToTab', tabId)
    }

    function handleCloseTab(circuitId) {
      // Check if the circuit has unsaved changes
      if (hasCircuitUnsavedWork(circuitId, props.circuitManager)) {
        emit('showConfirmation', {
          title: t('dialogs.unsavedChanges'),
          message: t('dialogs.unsavedChangesMessage'),
          type: 'warning',
          acceptLabel: t('ui.closeWithoutSaving'),
          onAccept: () => {
            emit('closeTab', circuitId)
          },
          onReject: () => {
            // User cancelled, do nothing
          }
        })
      } else {
        // No unsaved changes, close immediately
        emit('closeTab', circuitId)
      }
    }

    // Set up event listeners
    onMounted(() => {
      window.addEventListener('resize', updateScrollButtonStates)
      checkTabOverflow()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', updateScrollButtonStates)
    })

    // Watch for tab changes to update scroll button states
    watch(
      () => props.circuitTabs,
      () => {
        checkTabOverflow()
      },
      { deep: true }
    )

    return {
      showScrollButtons,
      canScrollLeft,
      canScrollRight,
      tabsContainer,
      scrollTabs,
      switchToTab,
      handleCloseTab
    }
  }
}
</script>

<style scoped>
/* Circuit tabs container with navigation */
.circuit-tabs-container {
  display: flex;
  align-items: center;
  margin-left: 1rem;
  margin-right: 1rem;
  max-width: calc(100vw - 400px); /* Leave space for other toolbar elements */
}

.circuit-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  flex-wrap: nowrap;
  flex: 1;
  /* Hide scrollbar for cleaner appearance since we have navigation buttons */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.circuit-tabs::-webkit-scrollbar {
  display: none;
}

/* Tab scroll navigation buttons */
.tab-scroll-button {
  padding: 0.25rem !important;
  min-width: auto !important;
  height: auto !important;
  border-radius: 4px !important;
  color: #6b7280 !important;
  flex-shrink: 0;
  margin: 0 0.125rem;
}

.tab-scroll-button:hover:not(:disabled) {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.tab-scroll-button:disabled {
  opacity: 0.3 !important;
  cursor: not-allowed !important;
}

.circuit-tab {
  padding: 0.25rem 0.75rem !important;
  font-size: 0.75rem !important;
  min-height: auto !important;
  height: auto !important;
  border-radius: 4px !important;
  color: #6b7280 !important;
  font-weight: 400 !important;
  position: relative;
  max-width: 120px;
  min-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.circuit-tab:hover {
  background-color: #f3f4f6 !important;
  color: #374151 !important;
}

.circuit-tab.active {
  background-color: #e5e7eb !important;
  color: #1f2937 !important;
  font-weight: 500 !important;
}

.circuit-tab .tab-close {
  margin-left: 0.5rem;
  font-size: 0.625rem;
  opacity: 0.6;
  cursor: pointer;
}

.circuit-tab .tab-close:hover {
  opacity: 1;
  color: #ef4444 !important;
}
</style>
