<template>
  <g 
    ref="box"
    class="circuit-item"
    :class="{ 'hover-cursor': hover }"
    @mousedown="drag"
    @mouseup="drop"
    @mouseleave="hover = false"
    @mouseover="hover = true"
  >
    <component :is="item.kind" :item="item"/>
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AndGate from './gates/AndGate.vue'
import NotGate from './gates/NotGate.vue'
import OrGate  from './gates/OrGate.vue'
import XOrGate from './gates/XOrGate.vue'
import InputIO from './io/Input.vue'

 export default defineComponent({
    name: 'DraggableItem',
    props: {
        item: Object
    },
    components: {
        'and-gate': AndGate,
        'not-gate': NotGate,
        'or-gate' : OrGate,
        'xor-gate': XOrGate,
        'input-io': InputIO,
    },
    data() {
        return {
            dragOffsetX: 0,
            dragOffsetY: 0,
            hover: false,
        }
    },
    methods: {
        drag(evt: MouseEvent) {
            this.dragOffsetX = evt.offsetX - this.item?.x
            this.dragOffsetY = evt.offsetY - this.item?.y
            this.$refs.box.addEventListener('mousemove', this.move)
        },
        drop() {
            this.dragOffsetX = this.dragOffsetY = 0
            this.$refs.box.removeEventListener('mousemove', this.move)
        },
        move(evt: MouseEvent) {
            this.item.x = evt.offsetX - this.dragOffsetX
            this.item.y = evt.offsetY - this.dragOffsetY
        },
    },
 })
</script>

<style>
.circuit-item {
  stroke: black;
  stroke-width: 3px;  
  fill: white; 
}
.circuit-text {
  font-family: sans-serif;
  font-size: 20px;
  font-weight: lighter;
  font-style: normal;
  stroke-width: 1px;
}
.hover-cursor {
    cursor: move;
}
</style>