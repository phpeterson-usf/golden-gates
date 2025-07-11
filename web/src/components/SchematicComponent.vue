<template>
  <BaseCircuitComponent
    :x="x"
    :y="y"
    :id="id"
    :selected="selected"
    :label="componentLabel"
    :body-bounds="componentBounds"
    :label-position="labelPosition"
    :input-connections="inputConnections"
    :output-connections="outputConnections"
    :enable-double-click="true"
    component-class="schematic-component"
    @startDrag="$emit('startDrag', $event)"
    @doubleClick="handleDoubleClick"
  >
    <!-- Custom labels for inputs and outputs -->
    <template #content>
      <!-- Input labels -->
      <text
        v-for="(input, index) in circuitInterface?.inputs || []"
        :key="`input-${index}`"
        :x="inputConnections[index]?.x + 8"
        :y="inputConnections[index]?.y + 4"
        font-size="10"
        font-family="Arial, sans-serif"
        fill="#374151"
        text-anchor="start"
      >
        {{ input.label }}
      </text>
      
      <!-- Output labels -->
      <text
        v-for="(output, index) in circuitInterface?.outputs || []"
        :key="`output-${index}`"
        :x="outputConnections[index]?.x - 8"
        :y="outputConnections[index]?.y + 4"
        font-size="10"
        font-family="Arial, sans-serif"
        fill="#374151"
        text-anchor="end"
      >
        {{ output.label }}
      </text>
    </template>
  </BaseCircuitComponent>
</template>

<script>
import { computed } from 'vue'
import BaseCircuitComponent from './BaseCircuitComponent.vue'
import { draggableProps } from '../composables/useDraggable'

export default {
  name: 'SchematicComponent',
  components: {
    BaseCircuitComponent
  },
  props: {
    ...draggableProps,
    circuitId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: 'Component'
    },
    circuitManager: {
      type: Object,
      required: true
    }
  },
  emits: ['startDrag', 'editSubcircuit'],
  setup(props, { emit }) {
    const handleDoubleClick = (event) => {
      emit('editSubcircuit', props.circuitId)
    }
    
    // Computed label that updates when the source circuit changes
    const componentLabel = computed(() => {
      const circuit = props.circuitManager.getCircuit(props.circuitId)
      return circuit?.label || circuit?.name || props.label || 'Component'
    })
    
    // Computed interface that updates when the source circuit changes
    const circuitInterface = computed(() => {
      const circuit = props.circuitManager.getCircuit(props.circuitId)
      if (!circuit) {
        return { inputs: [], outputs: [] }
      }
      
      const inputs = []
      const outputs = []
      
      // Find all input and output components in the circuit
      circuit.components.forEach(component => {
        if (component.type === 'input') {
          inputs.push({
            id: component.id,
            label: component.props?.label || 'IN',
            bits: component.props?.bits || 1
          })
        } else if (component.type === 'output') {
          outputs.push({
            id: component.id,
            label: component.props?.label || 'OUT',
            bits: component.props?.bits || 1
          })
        }
      })
      
      return { inputs, outputs }
    })
    
    // Computed properties for dynamic sizing based on interface
    const componentBounds = computed(() => {
      const inputs = circuitInterface.value?.inputs || []
      const outputs = circuitInterface.value?.outputs || []
      const maxPorts = Math.max(inputs.length, outputs.length, 1)
      
      // Calculate height based on number of ports (minimum 60px, 20px per port)
      const height = Math.max(60, maxPorts * 20 + 20)
      const width = 80
      
      return { x: 0, y: 0, width, height }
    })
    
    const labelPosition = computed(() => {
      const bounds = componentBounds.value
      return { x: bounds.width / 2, y: bounds.height / 2 + 4 }
    })
    
    const inputConnections = computed(() => {
      const inputs = circuitInterface.value?.inputs || []
      const bounds = componentBounds.value
      
      if (inputs.length === 0) {
        // Default single input for backward compatibility
        return [{ x: 0, y: bounds.height / 2 }]
      }
      
      return inputs.map((input, index) => {
        const y = (bounds.height / (inputs.length + 1)) * (index + 1)
        return { x: 0, y }
      })
    })
    
    const outputConnections = computed(() => {
      const outputs = circuitInterface.value?.outputs || []
      const bounds = componentBounds.value
      
      if (outputs.length === 0) {
        // Default single output for backward compatibility
        return [{ x: bounds.width, y: bounds.height / 2 }]
      }
      
      return outputs.map((output, index) => {
        const y = (bounds.height / (outputs.length + 1)) * (index + 1)
        return { x: bounds.width, y }
      })
    })
    
    return {
      handleDoubleClick,
      componentLabel,
      circuitInterface,
      componentBounds,
      labelPosition,
      inputConnections,
      outputConnections
    }
  }
}
</script>

<style scoped>
/* Additional styles specific to schematic components */
/* Base styles are inherited from BaseCircuitComponent */
</style>