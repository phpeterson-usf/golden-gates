<template>
    <line 
        v-for="(seg, index) in item.segments"
        :key="index"
        :x1="seg.x1Grid * gridSize"
        :y1="seg.y1Grid * gridSize"
        :x2="seg.x2Grid * gridSize"
        :y2="seg.y2Grid * gridSize"
    />

</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { CWire }           from '../../sim/wires'
  import { gridSize }        from '../../constants'

  export default defineComponent({
    name: "Wire",
    data() {
      return {
        gridSize: gridSize,
      }
    },
    props: {
        item: CWire,
    },
  })
</script>
