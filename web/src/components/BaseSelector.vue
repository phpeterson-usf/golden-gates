<template>
  <div class="inspector-dropdown">
    <Dropdown
      :modelValue="modelValue"
      :options="options"
      @update:modelValue="handleChange"
      optionLabel="label"
      optionValue="value"
      placeholder="Select base"
      class="base-selector"
    />
  </div>
</template>

<script>
import Dropdown from 'primevue/dropdown'

export default {
  name: 'BaseSelector',
  components: {
    Dropdown
  },
  props: {
    modelValue: {
      type: Number,
      default: 10,
      validator: value => [2, 10, 16].includes(value)
    }
  },
  emits: ['update:modelValue'],
  computed: {
    options() {
      return [
        { label: 'Binary (2)', value: 2 },
        { label: 'Decimal (10)', value: 10 },
        { label: 'Hexadecimal (16)', value: 16 }
      ]
    }
  },
  methods: {
    handleChange(value) {
      this.$emit('update:modelValue', value)
    }
  }
}
</script>

<style>
@import '../styles/inspector-dropdown.css';

.base-selector {
  width: 100%;
}
</style>
