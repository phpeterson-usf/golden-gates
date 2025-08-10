<template>
  <div class="inspector-dropdown">
    <Dropdown
      :modelValue="modelValue"
      :options="options"
      @update:modelValue="handleChange"
      optionLabel="label"
      optionValue="value"
      placeholder="Select rotation"
      class="rotation-selector"
    />
  </div>
</template>

<script>
import Dropdown from 'primevue/dropdown'

export default {
  name: 'RotationSelector',
  components: {
    Dropdown
  },
  props: {
    modelValue: {
      type: Number,
      default: 0,
      validator: value => [0, 90, 180, 270].includes(value)
    }
  },
  emits: ['update:modelValue'],
  computed: {
    options() {
      return [
        { label: '0°', value: 0 },
        { label: '90°', value: 90 },
        { label: '180°', value: 180 },
        { label: '270°', value: 270 }
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

.rotation-selector {
  width: 100%;
}
</style>
