<template>
  <g 
    ref="box"
    class="circuit-item"
    :class="{ 'item-hover': hover }"
    @mousedown="drag"
    @mouseup="drop"
    @mouseleave="hover = false"
    @mouseover="hover = true"
  >
    <component 
      :is="item.kind"
      :item="item"
    />
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AndGate  from './gates/AndGate.vue'
import NotGate  from './gates/NotGate.vue'
import OrGate   from './gates/OrGate.vue'
import XOrGate  from './gates/XOrGate.vue'
import InputIO  from './io/Input.vue'
import OutputIO from './io/Output.vue'
import Wire     from './other/Wire.vue'

 export default defineComponent({
    name: 'DraggableItem',
    props: {
        item: Object,
    },
    components: {
        'and-gate' : AndGate,
        'not-gate' : NotGate,
        'or-gate'  : OrGate,
        'xor-gate' : XOrGate,
        'input-io' : InputIO,
        'output-io': OutputIO,
        'wire'     : Wire,
    },
    data() {
        return {
            dragOffsetX: undefined,
            dragOffsetY: undefined,
            hover: false,
        }
    },
    inject: ['gridSize'],
    methods: {
        drag(evt: MouseEvent) {
            this.dragOffsetX = Math.ceil((evt.offsetX - this.item!.xPix)/20) * 20
            this.dragOffsetY = Math.ceil((evt.offsetY - this.item!.yPix)/20) * 20
            this.$refs.box.addEventListener('mousemove', this.move)
        },
        drop() {
            this.dragOffsetX = this.dragOffsetY = undefined
            this.$refs.box.removeEventListener('mousemove', this.move)
        },
        snap(x: number) :number {
          return Math.round(x / this.gridSize) * this.gridSize
        },
        move(evt: MouseEvent) {
            this.item!.xPix = this.snap(evt.offsetX - this.dragOffsetX!)
            this.item!.yPix = this.snap(evt.offsetY - this.dragOffsetY!)
        },
    },
 })
</script>

<style>
  .circuit-item {
    fill: white; 
    stroke: black;
    stroke-linecap: round;
    stroke-width: 3px;  
  }

  .circuit-text {
    font-family: sans-serif;
    font-size: 20px;
    font-style: normal;
    font-weight: lighter;
    stroke-width: 1px;
  }

  .item-hover {
      cursor: move;
  }
</style>