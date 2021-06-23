<template>
  <path :d="d"/>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: "OrGate",
    props: {
        item: Object,
    },
    computed: {
        d: function(): string {
            const x: string = this.item?.x + 2;
            const y: string = this.item?.y + 2;
            const path = "h 50,0 a 80,40 0 0 1 60,40 a 80,40 0 0 1 -60,40 h -52,0 a 20,30 0 0 0 -2,-80";
            return `M${x} ${y} ${path}`;
        },
    },
  })
</script>
