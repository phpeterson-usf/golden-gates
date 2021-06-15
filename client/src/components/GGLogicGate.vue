<template>
  <svg v-if="item.kind === 'AndGate'"
    class="logic-gate"
    height="84"
    width="114"
    viewBox="0, 0, 114, 84" 
  >
    <path d="M 62,82 h -60,0 v 0,-80 h 60,0 a 50,40 0 0 1 0,80"/>
  </svg>
  <svg v-else-if="item.kind === 'OrGate'"
    class="logic-gate"
    height="84"
    width="114"
    viewBox="0, 0, 114, 84"
  >
    <path d="M 2,2 h 50,0 a 60,40 0 0 1 60,40 a 60,40 0 0 1 -60,40 h -52,0 a 30,30 0 0 0 -30,-80"/>
  </svg>
  <svg v-else-if="item.kind === 'NotGate'"
    class="logic-gate"
    height="84" 
    width="114"
    viewBox="0, 0, 114, 84"
  >
    <path d="M 2,10 v 0,60 l 30,-30 l -32,-30"/>
    <circle cx="44" cy="40" r="10"/>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import InlineSvg from 'vue-inline-svg'

export default defineComponent({
  name: 'GGLogicGate',
//   components: {
//       InlineSvg,
//   },
  props: {
    item: Object,
  }
})
</script>

<style scoped>
.logic-gate {
  stroke: black;
  stroke-width: 4px; 
  fill: none; 
}
</style>