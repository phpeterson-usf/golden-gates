<template>
    <rect 
        :x="item.x"
        :y="item.y"
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
    data() {
        return {
            square: 30,
            radius: 10,
        }
    },
    computed: {
        cx: function(): number {
            return this.item?.x + this.radius + 5
        },
        cy: function(): number {
            return this.item?.y + this.radius + 5
        },
        tx: function(): number {
            if (this.$refs.inputName === undefined) {
                return this.item?.x - this.square
            } else {
                const len = this.$refs.inputName.getComputedTextLength()
                return this.item?.x - len - 4;
            }
        },
        ty: function(): number {
            return this.item?.y + this.square - 8
        },
    }
})
</script>