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
            const x: string = this.item?.x + 2;
            const y: string = this.item?.y + 10;
            const path = "v 0,60 l 30,-30 l -32,-30";
            return "M" + x + " " + y + " " + path;
        },
        cx: function(): number {
            return this.item?.x + 44;
        },
        cy: function(): number {
            return this.item?.y + 40;
        }
    }
  })
</script>