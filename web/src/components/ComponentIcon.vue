<template>
  <svg :width="size" :height="size" :viewBox="iconViewBox" class="gate-icon">
    <!-- Render splitter/merger as multiple path elements -->
    <template v-if="componentType === 'splitter' || componentType === 'merger'">
      <path
        v-for="(pathSegment, index) in pathSegments"
        :key="index"
        :d="pathSegment"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
    </template>

    <!-- Render other components as single path -->
    <template v-else>
      <path :d="componentPath" :fill="fillColor" :stroke="color" :stroke-width="strokeWidth" />
      <!-- Add concave line for XOR and XNOR gates -->
      <path
        v-if="(componentType === 'xor' || componentType === 'xnor') && xorConcaveLine"
        :d="xorConcaveLine"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
      />
      <!-- Add a clear, prominent negation circle for small icons -->
      <circle
        v-if="
          size <= 20 &&
          (componentType === 'not' ||
            componentType === 'nand' ||
            componentType === 'nor' ||
            componentType === 'xnor')
        "
        :cx="negationCircleX"
        :cy="15"
        :r="3"
        fill="white"
        :stroke="color"
        :stroke-width="2"
      />
    </template>
  </svg>
</template>

<script>
import { getGateDefinition } from '../config/gateDefinitions'

export default {
  name: 'ComponentIcon',
  props: {
    componentType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 16
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  computed: {
    componentPath() {
      // Handle logic gates
      if (['and', 'or', 'xor', 'not', 'nand', 'nor', 'xnor'].includes(this.componentType)) {
        const definition = getGateDefinition(this.componentType)
        if (!definition) return ''

        // Use a standard height for icon rendering
        const iconHeight = 30
        const padding = 5

        let path = definition.getSvgPath(iconHeight, padding)

        // For small icons, remove the negation circles from the path (we'll add them as separate elements)
        if (
          this.size <= 20 &&
          (this.componentType === 'not' ||
            this.componentType === 'nand' ||
            this.componentType === 'nor' ||
            this.componentType === 'xnor')
        ) {
          // Remove the negation circle arcs from the path entirely
          path = path.replace(/M [0-9\.\s\*\+\-]+A 5 5[^Z]+A 5 5[^Z]+/g, '')
        }

        // For XOR and XNOR gates, also need to handle the additional concave line
        if (this.componentType === 'xor' || this.componentType === 'xnor') {
          // Split the path into main body and concave line
          const pathParts = path.split('M 5')
          if (pathParts.length > 1) {
            // Return just the main body for now, we'll add the concave line as a separate stroke below
            return pathParts[0].trim()
          }
        }

        return path
      }

      // Handle I/O components
      if (this.componentType === 'input') {
        // Rectangle for input - much larger to match gate icon prominence
        const width = 35
        const height = 22
        const x = 4
        const y = 15 - height / 2
        return `M ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`
      }

      if (this.componentType === 'output') {
        // Circle for output - much larger radius to match gate icon prominence
        const radius = 14
        const cx = 15
        const cy = 15
        return `M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`
      }

      if (this.componentType === 'splitter') {
        // Splitter: one input line to thick vertical body, multiple output lines
        // Make it really large and prominent to match gate icons
        // Thick vertical body line (like the actual component)
        const body = `M 15 1 L 15 29`
        // Input line from left - goes all the way to edge
        const input = `M 1 15 L 15 15`
        // Output lines to right - spread out wide, go to edge
        const output1 = `M 15 6 L 29 6`
        const output2 = `M 15 15 L 29 15`
        const output3 = `M 15 24 L 29 24`
        return `${body} ${input} ${output1} ${output2} ${output3}`
      }

      if (this.componentType === 'merger') {
        // Merger: multiple input lines to thick vertical body, one output line
        // Make it really large and prominent to match gate icons
        // Thick vertical body line (like the actual component)
        const body = `M 15 1 L 15 29`
        // Input lines from left - spread out wide, go to edge
        const input1 = `M 1 6 L 15 6`
        const input2 = `M 1 15 L 15 15`
        const input3 = `M 1 24 L 15 24`
        // Output line to right - goes all the way to edge
        const output = `M 15 15 L 29 15`
        return `${body} ${input1} ${input2} ${input3} ${output}`
      }

      return ''
    },

    strokeWidth() {
      // Use thicker strokes for small icons to improve visibility
      // Make splitter and merger much thicker since they're line-based
      if (this.componentType === 'splitter' || this.componentType === 'merger') {
        return this.size <= 20 ? 5 : 4
      }
      return this.size <= 20 ? 3 : 2
    },

    negationCircleX() {
      // Position the negation circle at the right edge of the gate
      if (this.componentType === 'not') {
        return 35 // Right edge of NOT triangle for small icons
      } else if (this.componentType === 'nand') {
        return 38 // Right edge of AND gate for small icons
      } else if (this.componentType === 'nor') {
        return 42 // Right edge of OR gate for small icons
      } else if (this.componentType === 'xnor') {
        return 85 // Position for negation circle in XNOR gate (adjusted for wider viewBox)
      }
      return 0
    },

    fillColor() {
      // Different fill for different component types
      if (this.componentType === 'output') {
        return this.color // Solid fill for output
      }
      return 'none' // No fill for gates and inputs
    },

    pathSegments() {
      // Split the componentPath into individual path segments for splitter/merger
      if (this.componentType === 'splitter' || this.componentType === 'merger') {
        return this.componentPath
          .split(' M ')
          .map((segment, index) => {
            return index === 0 ? segment : 'M ' + segment
          })
          .filter(segment => segment.trim())
      }
      return []
    },

    xorConcaveLine() {
      // Generate the concave line path for XOR and XNOR gates
      if (this.componentType === 'xor' || this.componentType === 'xnor') {
        const definition = getGateDefinition(this.componentType)
        if (definition) {
          const iconHeight = 30
          const padding = 5
          const fullPath = definition.getSvgPath(iconHeight, padding)

          // Extract the concave line part (after "M 5")
          const pathParts = fullPath.split('M 5')
          if (pathParts.length > 1) {
            // For XNOR, stop before the negation circle part
            let concaveLine = 'M 5' + pathParts[1]
            if (this.componentType === 'xnor') {
              // Remove the negation circle part (starts with "M")
              const negationStart = concaveLine.indexOf('M', 3) // Find next M after "M 5"
              if (negationStart > 0) {
                concaveLine = concaveLine.substring(0, negationStart).trim()
              }
            }
            return concaveLine
          }
        }
      }
      return null
    },

    iconViewBox() {
      // Adjust viewBox based on gate type to ensure all elements are visible
      if (this.componentType === 'xnor') {
        return '0 0 95 30' // Wider to accommodate negation circle
      } else if (this.componentType === 'xor') {
        return '0 0 75 30' // Standard XOR width
      }
      return '0 0 60 30' // Standard width for other gates
    }
  }
}
</script>

<style scoped>
.gate-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
