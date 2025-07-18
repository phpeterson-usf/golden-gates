<template>
  <div class="inverted-inputs-selector inspector-dropdown">
    <button
      @click="toggleDropdown"
      class="p-dropdown p-component p-inputwrapper"
      :class="{ 'p-dropdown-open': isOpen }"
    >
      <span class="p-dropdown-label">{{ displayLabel }}</span>
      <span class="p-dropdown-trigger">
        <span class="p-dropdown-trigger-icon pi pi-chevron-down"></span>
      </span>
    </button>

    <div v-if="isOpen" class="p-dropdown-panel">
      <div class="p-dropdown-items-wrapper">
        <ul class="p-dropdown-items">
          <li
            v-for="i in numInputs"
            :key="i - 1"
            @click="toggleInput(i - 1)"
            class="p-dropdown-item"
            :class="{ 'p-highlight': isInputInverted(i - 1) }"
          >
            <span class="checkmark-wrapper">
              <i v-if="isInputInverted(i - 1)" class="pi pi-check"></i>
            </span>
            <span>Input {{ i - 1 }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvertedInputsSelector',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    numInputs: {
      type: Number,
      default: 2
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    displayLabel() {
      if (!this.modelValue || this.modelValue.length === 0) {
        return 'None'
      }
      const sorted = [...this.modelValue].sort((a, b) => a - b)
      return sorted.map(i => `Input ${i}`).join(', ')
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    toggleInput(index) {
      const newValue = [...this.modelValue]
      const existingIndex = newValue.indexOf(index)

      if (existingIndex > -1) {
        newValue.splice(existingIndex, 1)
      } else {
        newValue.push(index)
      }

      this.$emit('update:modelValue', newValue)
    },
    isInputInverted(index) {
      return this.modelValue.includes(index)
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped>
@import '../styles/inspector-dropdown.css';

/* Component-specific styles only */
</style>
