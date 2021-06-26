<template>
  <g 
    ref="svgGroup"
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
    name: 'CircuitItem',
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
            dragOffsetX: 0,
            dragOffsetY: 0,
            hover: false,
        }
    },
    inject: ['gridSize'],
    methods: {
        draggedElement(): HTMLElement {
            // Typesafe say to get svgGroup element for event listeners
            return this.$refs.svgGroup as InstanceType<typeof HTMLElement>
        },
        drag(evt: MouseEvent) {
            this.dragOffsetX = Math.ceil(evt.offsetX - this.item!.xPix)
            this.dragOffsetY = Math.ceil(evt.offsetY - this.item!.yPix)
            this.draggedElement().addEventListener('mousemove', this.move)
        },
        drop() {
            this.dragOffsetX = this.dragOffsetY = 0
            this.draggedElement().removeEventListener('mousemove', this.move)
        },
        snap(x: number) :number {
          // https://logaretm.com/blog/2020-12-23-type-safe-provide-inject/
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
    fill: black;
    font-family: sans-serif;
    font-size: 20px;
    font-style: normal;
    font-weight: lighter;
    stroke-width: 1px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .item-hover {
      cursor: move;
  }
</style>