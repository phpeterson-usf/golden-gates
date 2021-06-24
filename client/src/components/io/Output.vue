<template>
    <circle
        :cx="cx"
        :cy="cy"
        :r="radius"
    />
    <text
        class="circuit-text"
        ref="outputName"
        :x="tx"
        :y="ty"
    >
        {{ item.name }}
    </text>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    name: "OutputIO",
    props: {
        item: Object,
    },
    data() {
        return {
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
            if (this.$refs.outputName === undefined) {
                return this.item?.x - this.radius
            } else {
                const len = this.$refs.outputName.getComputedTextLength()
                return this.item?.x + len + this.radius + 4
            }
        },
        ty: function(): number {
            return this.item?.y + this.radius + 12
        },
    }
})
</script>