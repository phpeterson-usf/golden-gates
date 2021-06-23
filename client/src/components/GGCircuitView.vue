<template>
  <svg class="full-panel">
    <g class="circuit-item" v-for="item in items" :key="item.key">
      <component :is="item.kind" :item="item"/>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AndGate from './gates/AndGate.vue'
import NotGate from './gates/NotGate.vue'
import OrGate  from './gates/OrGate.vue'
import XOrGate from './gates/XOrGate.vue'

export default defineComponent({
  name: 'GGCircuitView',
  components: {
    'and-gate': AndGate,
    'not-gate': NotGate,
    'or-gate' : OrGate,
    'xor-gate': XOrGate,
  },
  props: {
    items: Array,
  },
})
</script>

<style scoped>
.circuit-item {
  stroke: black;
  stroke-width: 3px;  
  fill: none; 
}
.full-panel {
  width: 100%;
  height: 100%;
}
</style>
