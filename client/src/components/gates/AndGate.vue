<template>
  <path :d="d"/>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { CAndGate } from '../../sim/gates';
  
  export default defineComponent({
    name: "AndGate",
    props: {
        item: CAndGate,
    },
    inject: ['gridSize'],
    computed: {
        d: function(): string {
            const path = "h -40,0 v 0,-60 h 40,0 a 60,40 0 0 1 0,60";
            const x = this.item!.xPix() + 42;
            const y = this.item!.yPix() + 62;
            return `M${x} ${y} ${path}`;
        }
    }
  })
</script>