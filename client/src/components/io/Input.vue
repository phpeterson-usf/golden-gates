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
        ref="inputName"
        class="circuit-text"
        :x="tx"
        :y="ty"
    >
        {{ item.name }}
    </text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: "InputIO",
    props: {
        item: Object,
    },
    computed: {
        x: function(): number {
            return this.item!.xPix
        },
        y: function(): number {
            return this.item!.yPix + 1
        },
        cx: function(): number {
            return this.item!.xPix + this.radius + 5
        },
        cy: function(): number {
            return this.item!.yPix + this.radius + 6
        },
        tx: function(): number {
            if (this.$refs.inputName === undefined) {
                return this.item!.xPix - this.square
            } else {
                const len = this.$refs.inputName.getComputedTextLength()
                return this.item!.xPix - len - 4
            }
        },
        ty: function(): number {
            return this.item!.yPix + this.square - 8
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