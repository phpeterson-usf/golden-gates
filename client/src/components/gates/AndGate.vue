<template>
  <path :d="d"/>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: "AndGate",
    props: {
        item: Object,
    },
    computed: {
        d: function(): string {
            const path = "h -60,0 v 0,-80 h 60,0 a 50,40 0 0 1 0,80";
            const x: string = this.item?.x + 62;
            const y: string = this.item?.y + 82;
            return `M${x} ${y} ${path}`;
        }
    }
  })
</script>