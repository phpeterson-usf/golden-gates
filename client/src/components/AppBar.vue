<template>
    <div class="p-grid" style="height: 60px">
        <BreadcrumbBar/>
        <SimulationBar
          @toggleSimulation="handleToggleSimulation"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BreadcrumbBar from './BreadcrumbBar.vue'
import SimulationBar from './SimulationBar.vue'

export default defineComponent({
  name: 'App',
  components: {
    BreadcrumbBar,
    SimulationBar,
  },
  methods: {
    handleToggleSimulation() {
      this.$emit("toggleSimulation")
    },
  },
})

</script>