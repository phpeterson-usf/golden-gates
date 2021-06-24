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
            const path = "h -40,0 v 0,-60 h 40,0 a 60,40 0 0 1 0,60";
            const x: string = this.item?.x + 42;
            const y: string = this.item?.y + 62;
            return `M${x} ${y} ${path}`;
        }
    }
  })
</script>