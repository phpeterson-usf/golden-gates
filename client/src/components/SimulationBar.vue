<template>
  <div class="p-col-fixed" style="width: 100px">
    <Toolbar>
        <template #right>
          <Button
            @click="toggleSimulation"
            icon="pi pi-power-off"
            class="p-button-outlined p-button-success"
            :class="{ 'p-button-danger': simState.simulating }"
          />
        </template>
      </Toolbar>
  </div>
</template>

<script lang="ts">import { defineComponent, inject } from 'vue'
import 'primeflex/primeflex.css'
import Toolbar       from 'primevue/toolbar'
import Button        from 'primevue/button'
import { CSimState } from '../sim/base'

export default defineComponent({
  name: 'SimulationBar',
  components: {
    Button,
    Toolbar,
  },
  methods: {
    // toggleSimulation bubbles this event up to the App object
    // which manages the simulation. Maybe could do it here?
    toggleSimulation() {
      this.$emit("toggleSimulation")
    },
  },
  setup() {
    let simState = inject("simState") as CSimState
    return {
      simState,
    }
  },
})
</script>

<style scoped>
.p-toolbar {
  background-color: transparent;
  padding: 0px;
}
</style>