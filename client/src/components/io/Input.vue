<template>
    <rect :x="item.x" :y="item.y" :width="square" :height="square"/>
    <circle :cx="cx" :cy="cy" :r="radius"/>
    <text 
        ref="inputtext" 
        class="circuit-text" 
        :x="textx" 
        :y="texty"
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
        textx: function(): number {
            if (this.$refs.inputtext === undefined) {
                return this.item?.x - this.square
            } else {
                const len = this.$refs.inputtext.getComputedTextLength()
                return this.item?.x - len - 4;
            }
        },
        texty: function(): number {
            return this.item?.y + this.square - 8
        },
    }
})
</script>