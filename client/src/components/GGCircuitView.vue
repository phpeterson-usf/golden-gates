<template>
  <svg class="full-panel">
    <g 
      v-for="item in items"
      :key="item.key"
    >
      <DraggableItem :item="item"/>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DraggableItem from './DraggableItem.vue'

export default defineComponent({
  name: 'GGCircuitView',
  components: {
    DraggableItem,
  },
  props: {
    items: Array,
  },
})
</script>

<style scoped>
.full-panel {
  width: 100%;
  height: 100%;
}
</style>
