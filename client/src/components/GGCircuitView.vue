<template>
  <div v-for="item in items" :key="item.key">
    <GGLogicGate :item="item"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GGLogicGate from './GGLogicGate.vue'

export default defineComponent({
  name: 'GGCircuitView',
  components: {
    GGLogicGate,
  },
  props: {
    items: Array,
  }
})
</script>
