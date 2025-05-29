<template>
  <div class="component-inspector">
    <div v-if="!component" class="empty-state">
      <i class="pi pi-info-circle"></i>
      <p>Select a component to view its properties</p>
    </div>
    
    <div v-else class="inspector-content">
      <!-- Component-specific properties -->
      <div class="property-section" v-if="component.type === 'input'">
        <h4>Input Properties</h4>
        <div class="property-group">
          <label>Label</label>
          <InputText 
            :modelValue="getPropValue('label', 'IN')" 
            @update:modelValue="updateProp('label', $event)"
          />
        </div>
        <div class="property-group">
          <label>Value</label>
          <InputNumber 
            :modelValue="getPropValue('value', 0)" 
            @update:modelValue="updateProp('value', $event)"
            :min="0"
            :max="Math.pow(2, getPropValue('bits', 1)) - 1"
            :showButtons="true"
          />
        </div>
        <div class="property-group">
          <label>Bits</label>
          <InputNumber 
            :modelValue="getPropValue('bits', 1)" 
            @update:modelValue="updateProp('bits', $event)"
            :min="1"
            :max="32"
            :showButtons="true"
          />
        </div>
      </div>
      
      <div class="property-section" v-else-if="component.type === 'output'">
        <h4>Output Properties</h4>
        <div class="property-group">
          <label>Label</label>
          <InputText 
            :modelValue="getPropValue('label', 'OUT')" 
            @update:modelValue="updateProp('label', $event)"
          />
        </div>
      </div>
      
      <div class="property-section" v-else-if="component.type === 'and-gate'">
        <h4>AND Gate Properties</h4>
        <div class="property-group">
          <label>Label</label>
          <InputText 
            :modelValue="getPropValue('label', 'AND')" 
            @update:modelValue="updateProp('label', $event)"
          />
        </div>
        <div class="property-group">
          <label>Number of Inputs</label>
          <InputNumber 
            :modelValue="getPropValue('numInputs', 2)" 
            @update:modelValue="updateProp('numInputs', $event)"
            :min="2"
            :max="8"
            :showButtons="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentInspector',
  props: {
    component: {
      type: Object,
      default: null
    },
    gridSize: {
      type: Number,
      default: 30
    }
  },
  emits: ['update:component'],
  methods: {
    getPropValue(propName, defaultValue) {
      const value = this.component?.props?.[propName]
      // Return the actual value if it exists (including empty string)
      // Only use default if value is null or undefined
      return value !== null && value !== undefined ? value : defaultValue
    },
    
    getComponentIcon(type) {
      const icons = {
        'input': 'pi pi-circle',
        'output': 'pi pi-circle-fill',
        'and-gate': 'pi pi-sitemap'
      }
      return icons[type] || 'pi pi-box'
    },
    
    getComponentTitle(type) {
      const titles = {
        'input': 'Input Node',
        'output': 'Output Node',
        'and-gate': 'AND Gate'
      }
      return titles[type] || 'Component'
    },
    
    updatePosition(axis, value) {
      if (value === null || value === undefined) return
      
      this.$emit('update:component', {
        ...this.component,
        [axis]: value
      })
    },
    
    updateProp(propName, value) {
      this.$emit('update:component', {
        ...this.component,
        props: {
          ...this.component.props,
          [propName]: value
        }
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

.property-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
}

.position-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem;
}

/* Override PrimeVue input styles for compact layout */
.component-inspector :deep(.p-inputtext),
.component-inspector :deep(.p-inputnumber-input) {
  font-size: 0.75rem;
  padding: 0.375rem 0.625rem;
  height: 32px;
}

.component-inspector :deep(.p-inputnumber-button) {
  width: 1.75rem;
}

.component-inspector :deep(.p-inputnumber-button .pi) {
  font-size: 0.625rem;
}
</style>