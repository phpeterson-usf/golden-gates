<template>
  <div v-for="item in items" :key="item.key">{{item.kind}}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'GGCircuitView',
  props: {
    items: Array,
  }
})
</script>
