<template>
  <path :d="d"/>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: "XOrGate",
    props: {
        item: Object,
    },
    computed: {
        d: function(): string {
            const path = "h 20,0 a 100,50 0 0 1 60,30 a 100,50 0 0 1 -60,30 h -20,0 a 15,30 0 0 0 0,-60 m -10,60 a 15,30 0 0 0 0,-60";
            const x = this.item!.xPix + 18;
            const y = this.item!.yPix + 2;
            return `M${x} ${y} ${path}`;
        }
    }
  })

</script>