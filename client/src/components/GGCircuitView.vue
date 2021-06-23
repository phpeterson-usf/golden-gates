<template>
  <svg class="full-panel">
    <g class="circuit-item" v-for="item in items" :key="item.key">
      <component :is="item.kind" :item="item"/>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GGAndGate from './GGAndGate.vue'
import GGNotGate from './GGNotGate.vue'
import GGOrGate from './GGOrGate.vue'

export default defineComponent({
  name: 'GGCircuitView',
  components: {
    'and-gate': GGAndGate,
    'not-gate': GGNotGate,
    'or-gate': GGOrGate,
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
