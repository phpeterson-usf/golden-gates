<template>
  <path :d="d"/>
  <circle :cx="cx" :cy="cy" r="10"/>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: "NotGate",
    props: {
        item: Object,
    },
    computed: {
        d: function(): string {
            const x = this.item!.xPix + 2;
            const y = this.item!.yPix + 10;
            const path = "v 0,50 l 30,-25 l -30,-25";
            return `M${x} ${y} ${path}`;
        },
        cx: function(): number {
            return this.item!.xPix + 42;
        },
        cy: function(): number {
            return this.item!.yPix + 34;
        }
    }
  })
</script>