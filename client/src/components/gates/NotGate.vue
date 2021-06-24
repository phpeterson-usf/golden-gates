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
            const path = "v 0,40 l 20,-20 l -20,-20";
            return `M${x} ${y} ${path}`;
        },
        cx: function(): number {
            return this.item?.x + 34;
        },
        cy: function(): number {
            return this.item?.y + 30;
        }
    }
  })
</script>