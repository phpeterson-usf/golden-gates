<template>
  <div class="component-inspector">
    <div v-if="!component && !circuit" class="empty-state">
      <i class="pi pi-info-circle"></i>
      <p>{{ $t('componentInspector.emptyState') }}</p>
    </div>

    <!-- Circuit properties -->
    <div v-else-if="circuit && !component" class="inspector-content">
      <div class="property-section" v-if="circuitSchema">
        <h4>{{ circuitSchema.title }}</h4>
        <div
          v-for="prop in circuitSchema.properties.filter(p => !p.hidden)"
          :key="prop.name"
          class="property-group"
        >
          <label>{{ prop.label }}</label>

          <!-- Python identifier input for circuit name -->
          <PythonIdentifierInput
            v-if="prop.type === 'text' && prop.name === 'name'"
            :modelValue="getCircuitValue(prop.name)"
            @update:modelValue="updateCircuitValue(prop.name, $event)"
            :placeholder="prop.placeholder"
            :required="true"
            class="property-input"
          />

          <!-- Regular text input for other circuit properties -->
          <InputText
            v-else-if="prop.type === 'text'"
            :modelValue="getCircuitValue(prop.name)"
            @update:modelValue="updateCircuitValue(prop.name, $event)"
            :placeholder="prop.placeholder"
            class="property-input"
          />

          <!-- Textarea for description -->
          <Textarea
            v-else-if="prop.type === 'textarea'"
            :modelValue="getCircuitValue(prop.name)"
            @update:modelValue="updateCircuitValue(prop.name, $event)"
            :placeholder="prop.placeholder"
            :rows="3"
            class="property-input"
          />

          <small v-if="prop.help" class="property-help">{{ prop.help }}</small>
        </div>

        <!-- Circuit Actions -->
        <div v-if="circuitSchema.actions" class="actions-section">
          <div v-for="action in circuitSchema.actions" :key="action.name" class="action-group">
            <Button
              :label="action.label"
              :title="action.help"
              class="p-button-sm action-button"
              @click="handleAction(action.name)"
            />
            <small v-if="action.help" class="property-help">{{ action.help }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Component properties -->
    <div v-else-if="component" class="inspector-content">
      <!-- Component properties based on configuration -->
      <div class="property-section" v-if="componentSchema">
        <h4>{{ componentSchema.title }}</h4>
        <div
          v-for="prop in componentSchema.properties.filter(p => !p.hidden)"
          :key="prop.name"
          class="property-group"
        >
          <label>{{ prop.label }}</label>

          <!-- Text input -->
          <InputText
            v-if="prop.type === 'text'"
            :modelValue="getPropValue(prop.name, prop.default)"
            @update:modelValue="updateProp(prop.name, $event)"
          />

          <!-- Number input -->
          <MultibaseNumberInput
            v-else-if="
              prop.type === 'number' && component.type === 'input' && prop.name === 'value'
            "
            :modelValue="getPropValue(prop.name, prop.default)"
            :base="getPropValue('base', 10)"
            @update:both="updateMultipleProps($event)"
            :min="prop.min || 0"
            :max="getMaxValue(prop)"
          />
          <InputNumber
            v-else-if="prop.type === 'number'"
            :modelValue="getPropValue(prop.name, prop.default)"
            @update:modelValue="updateProp(prop.name, $event)"
            :min="prop.min || 0"
            :max="getMaxValue(prop)"
            :showButtons="prop.showButtons !== false"
          />

          <!-- Base selector -->
          <BaseSelector
            v-else-if="prop.type === 'base-selector'"
            :modelValue="getPropValue(prop.name, prop.default)"
            @update:modelValue="updateProp(prop.name, $event)"
          />

          <!-- Rotation selector -->
          <RotationSelector
            v-else-if="prop.type === 'rotation-selector'"
            :modelValue="getPropValue(prop.name, prop.default)"
            @update:modelValue="updateProp(prop.name, $event)"
          />

          <!-- Inverted inputs selector -->
          <InvertedInputsSelector
            v-else-if="prop.type === 'inverted-inputs-selector'"
            :modelValue="getPropValue(prop.name, prop.default)"
            :numInputs="getPropValue('numInputs', 2)"
            @update:modelValue="updateProp(prop.name, $event)"
          />

          <!-- Bit range table for splitter -->
          <BitRangeTable
            v-else-if="prop.type === 'bit-range-table'"
            :modelValue="getPropValue(prop.name, prop.default)"
            :inputBits="getPropValue('inputBits', 8)"
            @update:modelValue="updateProp(prop.name, $event)"
          />
        </div>
      </div>

      <!-- Fallback for unknown component types -->
      <div v-else class="property-section">
        <h4>{{ getComponentTitle(component.type) }}</h4>
        <p class="no-properties">No properties available</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getComponentProperties, getCircuitProperties } from '../config/componentProperties'
import MultibaseNumberInput from './MultibaseNumberInput.vue'
import BaseSelector from './BaseSelector.vue'
import RotationSelector from './RotationSelector.vue'
import InvertedInputsSelector from './InvertedInputsSelector.vue'
import BitRangeTable from './BitRangeTable.vue'
import PythonIdentifierInput from './PythonIdentifierInput.vue'
import Textarea from 'primevue/textarea'

export default {
  name: 'ComponentInspector',
  components: {
    MultibaseNumberInput,
    BaseSelector,
    RotationSelector,
    InvertedInputsSelector,
    BitRangeTable,
    PythonIdentifierInput,
    Textarea
  },
  props: {
    component: {
      type: Object,
      default: null
    },
    circuit: {
      type: Object,
      default: null
    },
    gridSize: {
      type: Number,
      default: 30
    }
  },
  emits: ['update:component', 'update:circuit', 'action'],
  computed: {
    componentSchema() {
      return this.component ? getComponentProperties(this.component.type) : null
    },
    circuitSchema() {
      return this.circuit ? getCircuitProperties() : null
    }
  },
  methods: {
    getPropValue(propName, defaultValue) {
      const value = this.component?.props?.[propName]
      // Return the actual value if it exists (including empty string)
      // Only use default if value is null or undefined
      return value !== null && value !== undefined ? value : defaultValue
    },

    getMaxValue(prop) {
      if (prop.maxFormula && this.component) {
        return prop.maxFormula(this.component.props || {})
      }
      return prop.max || 999999
    },

    getComponentTitle(type) {
      const schema = getComponentProperties(type)
      return schema?.title || 'Component'
    },

    updatePosition(axis, value) {
      if (value === null || value === undefined || !this.component) return

      this.$emit('update:component', {
        ...this.component,
        [axis]: value
      })
    },

    updateProp(propName, value) {
      if (!this.component) return

      this.$emit('update:component', {
        ...this.component,
        props: {
          ...this.component.props,
          [propName]: value
        }
      })
    },

    updateMultipleProps(updates) {
      if (!this.component) return

      this.$emit('update:component', {
        ...this.component,
        props: {
          ...this.component.props,
          ...updates
        }
      })
    },

    // Circuit value methods
    getCircuitValue(propName) {
      if (propName === 'name') return this.circuit?.name || ''
      if (propName === 'label') return this.circuit?.label || ''
      return this.circuit?.properties?.[propName] || ''
    },

    updateCircuitValue(propName, value) {
      if (!this.circuit) return

      const updatedCircuit = {
        ...this.circuit,
        [propName]: value,
        properties: {
          ...this.circuit.properties,
          [propName]: value
        }
      }

      this.$emit('update:circuit', updatedCircuit)
    },

    // Handle action button clicks
    handleAction(actionName) {
      this.$emit('action', {
        action: actionName,
        circuit: this.circuit,
        component: this.component
      })
    }
  }
}
</script>

<style scoped>
.component-inspector {
  height: 100%;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #6b7280;
  text-align: center;
  padding: 1.5rem;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: #9ca3af;
}

.empty-state p {
  margin: 0;
  font-size: 0.75rem;
}

.inspector-content {
  padding: 1rem;
}

.no-properties {
  color: #6b7280;
  font-size: 0.75rem;
  text-align: center;
  margin: 1rem 0;
}

.property-section {
  margin-bottom: 1.5rem;
}

.property-section:first-child {
  margin-top: 0;
}

.property-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.property-group {
  margin-bottom: 0.75rem;
}

.actions-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.action-group {
  margin-bottom: 0.75rem;
}

.action-button {
  width: 100%;
  margin-bottom: 0.25rem;
}

.property-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
}

.property-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.625rem;
  color: #6b7280;
  font-style: normal;
}

.position-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem;
}

/* Override PrimeVue input styles for compact layout */
.component-inspector :deep(.p-inputtext),
.component-inspector :deep(.p-inputnumber-input),
.component-inspector :deep(.p-dropdown) {
  font-size: 0.75rem;
  padding: 0.375rem 0.625rem;
  height: 32px;
}

/* Fix InputNumber width to match other inputs */
.component-inspector :deep(.p-inputnumber) {
  width: 100%;
  display: flex;
  max-width: 100%;
}

/* Ensure InputNumber input field doesn't overflow */
.component-inspector :deep(.p-inputnumber .p-inputnumber-input) {
  width: 100%;
  flex: 1;
}

/* Fix MultibaseNumberInput width */
.component-inspector :deep(.multibase-number-input) {
  width: 100%;
  max-width: 100%;
}

.component-inspector :deep(.multibase-number-input input) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.component-inspector :deep(.p-dropdown-label) {
  padding: 0;
  font-size: 0.75rem;
}

.component-inspector :deep(.p-dropdown-trigger) {
  width: 1.75rem;
}

.component-inspector :deep(.p-dropdown-trigger-icon) {
  font-size: 0.625rem;
}

.component-inspector :deep(.p-inputnumber-button) {
  width: 1.75rem;
}

.component-inspector :deep(.p-inputnumber-button .pi) {
  font-size: 0.625rem;
}

/* Style dropdowns to match other inputs */
.component-inspector :deep(.p-dropdown) {
  font-size: 0.75rem;
  height: 32px;
  width: 100%;
  display: flex;
  align-items: center;
}

.component-inspector :deep(.p-dropdown .p-dropdown-label) {
  padding: 0 0.625rem;
  font-size: 0.75rem;
  line-height: 30px;
}

.component-inspector :deep(.p-dropdown .p-dropdown-trigger) {
  width: 1.75rem;
}

.component-inspector :deep(.p-dropdown-trigger-icon) {
  font-size: 0.625rem;
}

.component-inspector :deep(.p-dropdown-panel .p-dropdown-item) {
  font-size: 0.75rem;
  padding: 0.375rem 0.625rem;
}

/* Ensure property groups contain their children properly */
.property-group > * {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Style the custom inspector dropdown to match */
.component-inspector :deep(.inspector-dropdown) {
  width: 100%;
}

/* Override PrimeVue dropdown panel styles for consistency */
.component-inspector :deep(.p-dropdown-panel) {
  font-size: 0.75rem;
}

.component-inspector :deep(.p-dropdown-items .p-dropdown-item) {
  padding: 0.375rem 0.625rem;
  font-size: 0.75rem;
}
</style>
