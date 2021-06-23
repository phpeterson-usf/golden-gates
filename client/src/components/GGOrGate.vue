<template>
  <path :d="d"/>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: "GGOrGate",
    props: {
        item: Object,
    },
    computed: {
        d: function(): string {
            const x: string = this.item?.x + 2;
            const y: string = this.item?.y + 2;
            const path = "h 50,0 a 60,40 0 0 1 60,40 a 60,40 0 0 1 -60,40 h -52,0 a 30,30 0 0 0 -30,-80";
            return "M" + x + " " + y + " " + path;
        }
    }
  })
</script>