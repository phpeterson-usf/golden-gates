<template>
  <svg 
    class="circuit-panel"
    :style="{ 'background-size': gridSize + 'px ' + gridSize + 'px' }"
  >
    <g 
      v-for="item in items"
      :key="item.key"
    >
      <DraggableItem 
        :item="addPixelCoords(item)"
      />
    </g>
  </svg>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import DraggableItem from './DraggableItem.vue'

  export default defineComponent({
    name: 'GGCircuitView',
    components: {
      DraggableItem,
    },
    inject: ['gridSize'],
    methods: {
      makePixelCoord(i: number): number {
        return i * this.gridSize
      },
      addPixelCoords(o: Object): Object {
        if (o.kind === 'wire') {
          for (const seg of o.segments) {
            seg.x1Pix = this.makePixelCoord(seg.x1Grid)
            seg.y1Pix = this.makePixelCoord(seg.y1Grid)
            seg.x2Pix = this.makePixelCoord(seg.x2Grid)
            seg.y2Pix = this.makePixelCoord(seg.y2Grid)
          }
        } else {
          o.xPix = this.makePixelCoord(o.xGrid)
          o.yPix = this.makePixelCoord(o.yGrid)
        }
        return o
      },
    },
    props: {
      items: Array,
    },
  })
  </script>

<style scoped>
  .circuit-panel {
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(to right, lightgray 1px, transparent 1px),
      linear-gradient(to bottom, lightgray 1px, transparent 1px);
  }
</style>
