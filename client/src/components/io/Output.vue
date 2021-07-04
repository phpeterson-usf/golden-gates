<template>
    <circle
        :cx="cx"
        :cy="cy"
        :r="radius"
    />
    <circle
        :cx="cx"
        :cy="cy"
        :r="radius - 6"
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
import { COutput }         from '../../sim/io'

export default defineComponent({
    name: "OutputIO",
    props: {
        item: COutput,
    },
    data() {
        return {
            radius: 15,
        }
    },
    computed: {
        cx: function(): number {
            return this.item!.xPix()
        },
        cy: function(): number {
            return this.item!.yPix()
        },
        tx: function(): number {
            return this.item!.xPix() + (this.radius * 2) + 5
        },
        ty: function(): number {
            return this.item!.yPix() + this.radius - 10
        },
    },
})
</script>