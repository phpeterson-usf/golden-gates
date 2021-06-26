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
        ref="svgText"
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
            radius: 15,
        }
    },
    computed: {
        cx: function(): number {
            return this.item!.xPix
        },
        cy: function(): number {
            return this.item!.yPix
        },
        tx: function(): number {
            if (this.getTextElement() === undefined) {
                // This is why text draws wrong until drag. How to fix?
                return this.item!.xPix - this.radius
            } else {
                const len = this.getTextElement().getComputedTextLength()
                return this.item!.xPix + len + 5
            }
        },
        ty: function(): number {
            return this.item!.yPix + this.radius - 10
        },
    },
    methods: {
        getTextElement(): SVGTextContentElement {
            // Typesafe way to call getComputedTextLength
            return this.$refs.svgText as InstanceType<typeof SVGTextContentElement>
        }
    },
})
</script>