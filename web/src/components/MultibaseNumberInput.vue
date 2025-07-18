<template>
  <div class="multibase-number-input">
    <div class="error-tooltip" v-if="errorMessage">
      {{ errorMessage }}
    </div>
    <input
      type="text"
      :value="displayValue"
      @input="handleInput"
      @blur="handleBlur"
      :class="['p-inputtext', 'p-component', { 'p-filled': displayValue, 'p-invalid': !isValid }]"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { formatWithLeadingZeros } from '../composables/useLeadingZeros'

export default {
  name: 'MultibaseNumberInput',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    base: {
      type: Number,
      default: 10,
      validator: value => [2, 10, 16].includes(value)
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    },
    placeholder: {
      type: String,
      default: '0, 0x0, 0b0'
    }
  },
  emits: ['update:modelValue', 'update:base', 'update:both'],
  setup(props, { emit }) {
    const inputValue = ref('')
    const isValid = ref(true)
    const errorMessage = ref('')
    const invalidChar = ref('')

    // Track the last value we emitted to avoid clearing on our own changes
    let lastEmittedValue = props.modelValue
    let lastEmittedBase = props.base

    // Check if a value overflows the current bit width
    const checkOverflow = value => {
      if (value > props.max) {
        isValid.value = false
        errorMessage.value = `Overflows ${bits.value} bits`
        return true
      }
      return false
    }

    // Calculate bits from max value
    const bits = computed(() => Math.ceil(Math.log2(props.max + 1)))

    // Convert number to display string
    const displayValue = computed(() => {
      if (inputValue.value !== '') {
        return inputValue.value
      }
      return formatWithLeadingZeros(props.modelValue, props.base, bits.value)
    })

    // Parse string to number without range checking
    const parseNumberRaw = str => {
      str = str.trim()
      if (str === '') return null

      let num

      // Binary
      if (str.startsWith('0b') || str.startsWith('0B')) {
        const binaryStr = str.slice(2)
        if (!/^[01]+$/.test(binaryStr)) return null
        num = parseInt(binaryStr, 2)
      }
      // Hexadecimal
      else if (str.startsWith('0x') || str.startsWith('0X')) {
        const hexStr = str.slice(2)
        if (!/^[0-9a-fA-F]+$/.test(hexStr)) return null
        num = parseInt(hexStr, 16)
      }
      // Decimal
      else {
        if (!/^[0-9]+$/.test(str)) return null
        num = parseInt(str, 10)
      }

      return isNaN(num) ? null : num
    }

    // Parse string to number with range checking
    const parseNumber = str => {
      const num = parseNumberRaw(str)
      if (num === null) return null

      // Check if number is within range
      if (num < props.min || num > props.max) {
        return null
      }

      return num
    }

    // Validate input character by character
    const validateInput = (str, newChar) => {
      if (str === '') return { valid: true }

      // Allow partial prefixes
      if (str === '0') return { valid: true }
      if (str === '0b' || str === '0B') return { valid: true }
      if (str === '0x' || str === '0X') return { valid: true }

      // Binary in progress
      if (str.startsWith('0b') || str.startsWith('0B')) {
        const binaryPart = str.slice(2)
        if (!/^[01]*$/.test(binaryPart)) {
          return { valid: false, invalidChar: newChar, base: 2 }
        }
        return { valid: true }
      }

      // Hex in progress
      if (str.startsWith('0x') || str.startsWith('0X')) {
        const hexPart = str.slice(2)
        if (!/^[0-9a-fA-F]*$/.test(hexPart)) {
          return { valid: false, invalidChar: newChar, base: 16 }
        }
        return { valid: true }
      }

      // Decimal
      if (!/^[0-9]+$/.test(str)) {
        return { valid: false, invalidChar: newChar, base: 10 }
      }
      return { valid: true }
    }

    const handleInput = event => {
      const newValue = event.target.value
      const oldValue = inputValue.value

      // Get the new character that was typed
      const newChar = newValue.length > oldValue.length ? newValue[newValue.length - 1] : ''

      // Always update the input value to show what user typed
      inputValue.value = newValue

      // Check if the new input is valid
      const validation = validateInput(newValue, newChar)
      if (!validation.valid) {
        // Set error message for invalid character
        isValid.value = false
        errorMessage.value = `'${validation.invalidChar}' is not valid for base ${validation.base}`
        return
      }

      // Try to parse the number
      const num = parseNumber(newValue)

      // Clear any previous error if input is now valid
      if (validation.valid) {
        errorMessage.value = ''
        isValid.value = true
      }

      if (num !== null) {
        isValid.value = true
        errorMessage.value = ''

        // Detect base
        let detectedBase
        if (newValue.startsWith('0x') || newValue.startsWith('0X')) {
          detectedBase = 16
        } else if (newValue.startsWith('0b') || newValue.startsWith('0B')) {
          detectedBase = 2
        } else {
          detectedBase = 10
        }

        // Track what we're emitting
        lastEmittedValue = num
        lastEmittedBase = detectedBase

        // Emit both changes at once to avoid stale component issues
        emit('update:both', { value: num, base: detectedBase })
      } else {
        // Check if it's a partial entry or out of range
        const partialOk =
          newValue === '' ||
          newValue === '0' ||
          newValue === '0b' ||
          newValue === '0B' ||
          newValue === '0x' ||
          newValue === '0X'

        if (!partialOk && validation.valid) {
          // Valid format but out of range
          const testNum = parseInt(
            newValue.replace(/^0[xXbB]/, ''),
            newValue.match(/^0[xX]/) ? 16 : newValue.match(/^0[bB]/) ? 2 : 10
          )

          if (!isNaN(testNum)) {
            checkOverflow(testNum)
          }
        }
      }
    }

    const handleBlur = () => {
      // On blur, check if we have a valid but incomplete input
      if (
        inputValue.value === '0' ||
        inputValue.value === '0x' ||
        inputValue.value === '0X' ||
        inputValue.value === '0b' ||
        inputValue.value === '0B'
      ) {
        // Clear incomplete prefixes
        inputValue.value = ''
        isValid.value = true
        return
      }

      // For other cases, re-validate to ensure error state is correct
      const validation = validateInput(inputValue.value, '')
      if (!validation.valid) {
        // Invalid character - error message should already be set
        isValid.value = false
      } else {
        // Check if it's out of range
        const num = parseNumber(inputValue.value)
        if (num === null && inputValue.value !== '') {
          // Out of range - error message should already be set
          isValid.value = false
        } else {
          isValid.value = true
          errorMessage.value = ''
        }
      }
    }

    // Watch for external changes to modelValue or base
    watch(
      [() => props.modelValue, () => props.base],
      ([newValue, newBase], [oldValue, oldBase]) => {
        // Only clear if the value actually changed from outside
        // Don't clear if only the base changed but the value is the same
        if (newValue !== oldValue && newValue !== lastEmittedValue) {
          inputValue.value = ''
          isValid.value = true
          errorMessage.value = ''
        }
        // Update our tracking when props change
        if (newValue === lastEmittedValue && newBase === lastEmittedBase) {
          // This was our own change, keep tracking in sync
          lastEmittedValue = newValue
          lastEmittedBase = newBase
        }
      }
    )

    // Watch for changes to max (bit width changes)
    watch(
      () => props.max,
      (newMax, oldMax) => {
        // Determine which value to check
        let valueToCheck = props.modelValue

        // If there's input text, parse and use that value instead
        if (inputValue.value && inputValue.value !== '') {
          const num = parseNumberRaw(inputValue.value)
          if (num !== null) {
            valueToCheck = num
          }
        }

        // Check if the value overflows with the new max
        if (valueToCheck > newMax) {
          // Set overflow error
          isValid.value = false
          const bits = Math.ceil(Math.log2(newMax + 1))
          errorMessage.value = `Overflows ${bits} bits`
        } else {
          // Clear overflow error if value now fits
          if (errorMessage.value.includes('Overflows')) {
            isValid.value = true
            errorMessage.value = ''
          }
        }
      }
    )

    return {
      displayValue,
      isValid,
      errorMessage,
      handleInput,
      handleBlur
    }
  }
}
</script>

<style scoped>
.multibase-number-input {
  width: 100%;
  position: relative;
}

.error-tooltip {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: var(--p-error-color, #dc3545);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.error-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 1rem;
  border: 4px solid transparent;
  border-top-color: var(--p-error-color, #dc3545);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.multibase-number-input {
  position: relative;
}
</style>
