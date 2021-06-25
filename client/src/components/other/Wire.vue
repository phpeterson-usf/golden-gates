<template>
    <line 
        v-for="(seg, index) in item.segments"
        :key="index"
        :x1="seg.x1Pix"
        :y1="seg.y1Pix"
        :x2="seg.x2Pix"
        :y2="seg.y2Pix"
    />

</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  export default defineComponent({
    name: "Wire",
    props: {
        item: Object,
    },
  })
</script>
