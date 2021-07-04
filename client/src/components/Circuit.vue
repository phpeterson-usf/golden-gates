<template>
  <svg 
    class="circuit-panel"
    :style="{ 'background-size': gridSize + 'px ' + gridSize + 'px' }"
  >
    <g 
      v-for="item in items"
      :key="item.key"
    >
      <CircuitItem 
        :item="item"
      />
    </g>
  </svg>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import CircuitItem         from './CircuitItem.vue'
  import { gridSize }        from '../constants'

  export default defineComponent({
    name: 'Circuit',
    components: {
      CircuitItem,
    },
    data() {
      return {
        gridSize: gridSize,
      }
    },
    props: {
      items: Array,
    },
  })
  </script>

<style scoped>
  .circuit-panel {
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(to right, lightgray 1px, transparent 1px),
      linear-gradient(to bottom, lightgray 1px, transparent 1px);
  }
</style>
