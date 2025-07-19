<template>
  <!-- Custom modal overlay -->
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="autosave-dialog" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <i class="pi pi-history modal-icon"></i>
        <h3 class="modal-title">{{ $t('autosave.restoreTitle') }}</h3>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <p class="modal-message">
          {{ $t('autosave.foundVersions', { count: autosaves.length, plural: autosaves.length !== 1 ? 's' : '' }) }}
        </p>

        <!-- Autosave list -->
        <div class="autosave-list">
          <div
            v-for="(autosave, index) in autosaves"
            :key="autosave.key"
            class="autosave-item"
            :class="{ selected: selectedIndex === index }"
            @click="selectedIndex = index"
          >
            <div class="autosave-radio">
              <input
                :id="`autosave-${index}`"
                v-model="selectedIndex"
                :value="index"
                type="radio"
                :name="radioGroupName"
              />
              <label :for="`autosave-${index}`" class="radio-label">
                <div class="autosave-info">
                  <div class="autosave-time">{{ formatTimeAgo(autosave.timestamp) }}</div>
                  <div class="autosave-details">
                    {{ $t('autosave.circuitCount', { count: autosave.circuitCount, plural: autosave.circuitCount !== 1 ? 's' : '' }) }}, 
                    {{ $t('autosave.componentCount', { count: autosave.componentCount, plural: autosave.componentCount !== 1 ? 's' : '' }) }}
                  </div>
                  <div v-if="autosave.activeCircuit" class="autosave-active">
                    {{ $t('autosave.activeCircuit', { name: getCircuitDisplayName(autosave.activeCircuit, autosave) }) }}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with buttons -->
      <div class="modal-footer">
        <button class="modal-button modal-button-cancel" @click="handleCancel">
          {{ $t('autosave.cancel') }}
        </button>
        <button
          class="modal-button modal-button-confirm"
          :disabled="selectedIndex === null"
          @click="handleRestore"
        >
          {{ $t('autosave.restoreSelected') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AutosaveSelectionDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    autosaves: {
      type: Array,
      default: () => []
    }
  },
  emits: ['restore', 'cancel'],
  data() {
    return {
      selectedIndex: 0, // Default to newest (first) autosave
      radioGroupName: `autosave-${Date.now()}` // Unique radio group name
    }
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        // Reset selection to newest when dialog opens
        this.selectedIndex = this.autosaves.length > 0 ? 0 : null
      }
    }
  },
  methods: {
    formatTimeAgo(timestamp) {
      const timeSince = Date.now() - timestamp
      const hours = Math.floor(timeSince / (1000 * 60 * 60))
      const minutes = Math.floor((timeSince % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        return this.$t('autosave.timeAgo.hoursAndMinutes', {
          hours,
          hoursPlural: hours !== 1 ? 's' : '',
          minutes,
          minutesPlural: minutes !== 1 ? 's' : ''
        })
      } else if (minutes === 0) {
        return this.$t('autosave.timeAgo.lessThanMinute')
      } else {
        return this.$t('autosave.timeAgo.minutes', {
          count: minutes,
          plural: minutes !== 1 ? 's' : ''
        })
      }
    },

    getCircuitDisplayName(circuitId, autosave) {
      // Try to find a friendly name for the circuit
      if (autosave && autosave.allCircuits && autosave.allCircuits[circuitId]) {
        return autosave.allCircuits[circuitId].name || circuitId
      }
      return circuitId
    },

    handleOverlayClick() {
      // Allow closing by clicking overlay
      this.handleCancel()
    },

    handleCancel() {
      this.$emit('cancel')
    },

    handleRestore() {
      if (this.selectedIndex !== null && this.autosaves[this.selectedIndex]) {
        this.$emit('restore', this.autosaves[this.selectedIndex])
      }
    }
  }
}
</script>

<style scoped>
/* Base modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.autosave-dialog {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 2rem 1rem 2rem;
}

.modal-icon {
  font-size: 1.5rem;
  color: #3b82f6;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

/* Content */
.modal-content {
  padding: 0 2rem 1.5rem 2rem;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-message {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #6b7280;
}

/* Autosave list */
.autosave-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.autosave-item {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.autosave-item:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.autosave-item.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.autosave-radio {
  padding: 1rem;
}

.autosave-radio input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-label {
  display: block;
  cursor: pointer;
  margin: 0;
}

.autosave-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.autosave-time {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.autosave-details {
  color: #6b7280;
  font-size: 0.75rem;
}

.autosave-active {
  color: #059669;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 2rem 2rem 2rem;
  border-top: 1px solid #e5e7eb;
  margin-top: 1rem;
  padding-top: 1rem;
}

/* Buttons */
.modal-button {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.modal-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.modal-button-cancel {
  background-color: white;
  color: #374151;
  border-color: #d1d5db;
}

.modal-button-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.modal-button-confirm {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.modal-button-confirm:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.modal-button-confirm:disabled {
  background-color: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Scrollbar styling for webkit browsers */
.autosave-list::-webkit-scrollbar {
  width: 6px;
}

.autosave-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.autosave-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.autosave-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>