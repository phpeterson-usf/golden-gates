<template>
    <div class="p-col-fixed" style="width: 100px">
        <Toolbar>
            <template #right>
                <Button
                    @click="toggleSimulation"
                    icon="pi pi-power-off"
                    class="p-button-outlined p-button-success"
                    :class="{ 'p-button-danger': simulating }"
                />
            </template>
        </Toolbar>
    </div>
</template>

<script lang="ts">import { defineComponent } from 'vue'
import 'primeflex/primeflex.css'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
export default defineComponent({
  name: 'SimulationBar',
  components: {
    Button,
    Toolbar,
  },
  data() {
      return {
          simulating: false,
      }
  },
  methods: {
      toggleSimulation() {
          if (this.simulating) {
            this.$emit("stopSimulation")
          } else {
              this.$emit("startSimulation")
          }
          this.simulating = !this.simulating
      },
  },
})
</script>

<style scoped>
.p-toolbar {
  background-color: transparent;
  padding: 0px;
}
</style>