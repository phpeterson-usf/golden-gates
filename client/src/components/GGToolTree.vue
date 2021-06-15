<template>
  <Tree :value="nodes"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Tree from 'primevue/tree'

export default defineComponent({
  name: 'GGToolTree',
  components: {
    Tree,
  },
  data() { 
    return {
      "nodes": [
        {
          "key": "0",
          "label": "Input/Output",
          "children": [
            {"key": "0-0", "label": "Input"},
            {"key": "0-1", "label": "Output"},
          ]
        },
        {
          "key": "1",
          "label": "Logic Gates",
          "children": [
            {"key": "1-0", "label": "And"},
            {"key": "1-1", "label": "Or"},
            {"key": "1-2", "label": "Not"},
          ]
        },
        {
          "key": "2",
          "label": "Plexers",
          "children": [
            {"key": "2-0", "label": "Decoder"},
            {"key": "2-1", "label": "Multiplexer"},
            {"key": "2-2", "label": "Priority Encoder"},
          ]
        },
        {
          "key": "3",
          "label": "Memory",
          "children": [
            {"key": "3-0", "label": "Register"},
            {"key": "3-1", "label": "RAM"},
            {"key": "3-2", "label": "ROM"},
          ]
        },
        {
          "key": "4",
          "label": "Arithmetic",
          "children": [
            {"key": "4-0", "label": "Comparator"},
            {"key": "4-1", "label": "Add"},
            {"key": "4-2", "label": "Shift"},
          ]
        },
      ]
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep(.p-treenode-label){
  font-size: 11pt;
}
</style>