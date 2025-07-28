<template>
  <div class="memory-data-table">
    <div class="table-header">
      <div class="header-controls">
        <BaseSelector
          v-model="displayBase"
          @update:modelValue="handleBaseChange"
          class="base-selector"
        />
        <button
          @click="triggerFileInput"
          v-tooltip.top="$t('memory.importData')"
          class="import-button"
        >
          <i class="pi pi-upload"></i>
        </button>
        <button @click="clearData" v-tooltip.top="'Clear Data'" class="clear-button">
          <i class="pi pi-trash"></i>
        </button>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileInput"
          style="display: none"
        />
      </div>
    </div>

    <div
      class="table-container"
      @dragover.prevent="handleDragOver"
      @drop.prevent="handleDrop"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="{ 'drag-over': isDragging }"
    >
      <table class="memory-table">
        <tbody>
          <tr v-for="row in numRows" :key="row">
            <td v-for="col in 8" :key="col" class="memory-cell">
              <div class="cell-address">
                {{ formatAddress((row - 1) * 8 + (col - 1)) }}
              </div>
              <input
                :value="formatData(getDataAt((row - 1) * 8 + (col - 1)))"
                @input="updateDataAt((row - 1) * 8 + (col - 1), $event.target.value)"
                @focus="handleCellFocus((row - 1) * 8 + (col - 1))"
                @blur="handleCellBlur"
                class="cell-input"
                :class="{ active: activeCellIndex === (row - 1) * 8 + (col - 1) }"
                spellcheck="false"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isDragging" class="drag-overlay">
      <i class="pi pi-upload"></i>
      <p>{{ $t('memory.dropFileHere') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import BaseSelector from './BaseSelector.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  addressBits: {
    type: Number,
    default: 4,
    validator: value => value >= 1 && value <= 16
  },
  dataBits: {
    type: Number,
    default: 8,
    validator: value => value >= 1 && value <= 32
  },
  highlightAddress: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

// State
const displayBase = ref(16) // Default to hex
const isDragging = ref(false)
const activeCellIndex = ref(-1)
const fileInput = ref(null)

// Computed
const totalCells = computed(() => Math.pow(2, props.addressBits))
const numRows = computed(() => Math.ceil(totalCells.value / 8))
const maxDataValue = computed(() => Math.pow(2, props.dataBits) - 1)

// Initialize data array if empty
const data = ref([...props.modelValue])
if (data.value.length === 0) {
  data.value = new Array(totalCells.value).fill(0)
  emit('update:modelValue', data.value)
}

// Watch for external changes
watch(
  () => props.modelValue,
  newValue => {
    data.value = [...newValue]
  },
  { deep: true }
)

// Watch for addressBits changes to resize array
watch(
  () => props.addressBits,
  newBits => {
    const newSize = Math.pow(2, newBits)
    if (data.value.length < newSize) {
      // Expand array
      data.value = [...data.value, ...new Array(newSize - data.value.length).fill(0)]
    } else if (data.value.length > newSize) {
      // Truncate array
      data.value = data.value.slice(0, newSize)
    }
    emit('update:modelValue', data.value)
  }
)

// Methods
function getDataAt(index) {
  return index < data.value.length ? data.value[index] : 0
}

function updateDataAt(index, valueStr) {
  if (index >= totalCells.value) return

  // Parse value based on current base
  let value = 0
  valueStr = valueStr.trim()

  if (valueStr !== '') {
    if (displayBase.value === 2) {
      value = parseInt(valueStr, 2) || 0
    } else if (displayBase.value === 16) {
      value = parseInt(valueStr, 16) || 0
    } else {
      value = parseInt(valueStr, 10) || 0
    }
  }

  // Clamp to valid range
  value = Math.max(0, Math.min(value, maxDataValue.value))

  // Update data
  const newData = [...data.value]
  newData[index] = value
  data.value = newData
  emit('update:modelValue', newData)
}

function formatAddress(index) {
  if (index >= totalCells.value) return ''

  const hexAddr = index.toString(16).toUpperCase()
  const padding = Math.ceil(props.addressBits / 4)
  return hexAddr.padStart(padding, '0')
}

function formatData(value) {
  if (displayBase.value === 2) {
    return value.toString(2).padStart(props.dataBits, '0')
  } else if (displayBase.value === 16) {
    const hexDigits = Math.ceil(props.dataBits / 4)
    return value.toString(16).toUpperCase().padStart(hexDigits, '0')
  } else {
    return value.toString(10)
  }
}

function handleBaseChange(newBase) {
  displayBase.value = newBase
}

function handleCellFocus(index) {
  activeCellIndex.value = index
}

function handleCellBlur() {
  activeCellIndex.value = -1
}

// File import handling
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileInput(event) {
  const file = event.target.files?.[0]
  if (file) {
    importFile(file)
  }
  // Clear input for re-selection
  event.target.value = ''
}

function handleDragOver(event) {
  event.dataTransfer.dropEffect = 'copy'
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) {
    importFile(file)
  }
}

function clearData() {
  const newData = new Array(totalCells.value).fill(0)
  data.value = newData
  emit('update:modelValue', newData)
}

async function importFile(file) {
  try {
    const text = await file.text()
    const values = parseJsonFile(text)

    // Truncate or pad to match total cells
    const newData = new Array(totalCells.value).fill(0)
    for (let i = 0; i < Math.min(values.length, totalCells.value); i++) {
      newData[i] = Math.max(0, Math.min(values[i], maxDataValue.value))
    }

    data.value = newData
    emit('update:modelValue', newData)
  } catch (error) {
    console.error('Error importing JSON file:', error)
    // TODO: Show user-friendly error message
  }
}

function parseJsonFile(text) {
  const jsonData = JSON.parse(text)

  // Support both direct arrays and objects with a "data" property
  const array = Array.isArray(jsonData) ? jsonData : jsonData.data

  if (!Array.isArray(array)) {
    throw new Error('JSON must contain an array of values')
  }

  const values = []

  for (const item of array) {
    let value = 0

    if (typeof item === 'number') {
      value = item
    } else if (typeof item === 'string') {
      if (item.startsWith('0x') || item.startsWith('0X')) {
        value = parseInt(item, 16)
      } else if (item.startsWith('0b') || item.startsWith('0B')) {
        value = parseInt(item.substr(2), 2)
      } else if (/^[0-9a-fA-F]+$/.test(item)) {
        // Hex string without 0x prefix (all hex digits)
        value = parseInt(item, 16)
      } else {
        value = parseInt(item, 10)
      }
    } else {
      // Try to convert to number
      value = Number(item)
    }

    if (!isNaN(value)) {
      values.push(Math.floor(value)) // Ensure integer values
    }
  }

  return values
}
</script>

<style scoped>
.memory-data-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.base-selector {
  width: 120px;
}

.import-button,
.clear-button {
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  max-width: 36px;
  max-height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.import-button:hover,
.clear-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.table-container {
  position: relative;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  background: var(--surface-ground);
}

.table-container.drag-over {
  border-color: var(--primary-color);
  background: var(--highlight-bg);
}

.memory-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.memory-cell {
  padding: 0.125rem;
  border: 1px solid var(--surface-border);
  position: relative;
  min-width: 5rem; /* Ensure space for 8 hex characters (FFFFFFFF) */
}

.cell-address {
  position: absolute;
  top: 0.125rem;
  left: 0.25rem;
  font-size: 0.625rem;
  color: var(--text-color-secondary);
  font-family: monospace;
}

.cell-input {
  width: 100%;
  padding: 0.25rem;
  padding-top: 1rem;
  border: none;
  background: transparent;
  font-family: monospace;
  font-size: 0.75rem;
  text-align: center;
  outline: none;
}

.cell-input:focus {
  background: var(--highlight-bg);
}

.cell-input.active {
  background: var(--primary-color-text);
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: 2px dashed var(--primary-color);
  border-radius: 6px;
  pointer-events: none;
}

.drag-overlay i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.drag-overlay p {
  color: var(--primary-color);
  font-weight: 600;
}

/* Scrollbar styling */
.table-container::-webkit-scrollbar {
  width: 8px;
  height: 8px; /* Make horizontal scrollbar same width as vertical */
}

.table-container::-webkit-scrollbar-track {
  background: var(--surface-100);
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--surface-400);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: var(--surface-500);
}
</style>
