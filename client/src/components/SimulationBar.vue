<template>
    <div class="p-col-fixed" style="width: 100px">
        <Toolbar>
            <template #right>
                <Button
                    @click="simulate"
                    icon="pi pi-power-off"
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
  methods: {
      simulate(): void {
          console.log("simulate")
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