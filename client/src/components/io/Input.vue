<template>
    <rect 
        :x="x"
        :y="y"
        :width="square"
        :height="square"
    />
    <circle 
        :cx="cx"
        :cy="cy"
        :r="radius"
    />
    <text 
        class="circuit-text"
        text-anchor="end"
        :x="tx"
        :y="ty"
    >
        {{ item.name }}
    </text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CInput }          from '../../sim/io'

export default defineComponent({
    name: "InputIO",
    props: {
        item: CInput,
    },
    computed: {
        x: function(): number {
            return this.item!.xPix()
        },
        y: function(): number {
            return this.item!.yPix() + 1
        },
        cx: function(): number {
            return this.item!.xPix() + this.radius + 5
        },
        cy: function(): number {
            return this.item!.yPix() + this.radius + 6
        },
        tx: function(): number {
            return this.item!.xPix() - 5
        },
        ty: function(): number {
            return this.item!.yPix() + this.square - 8
        },
    },
    data() {
        return {
            square: 30,
            radius: 10,
        }
    },
})
</script>