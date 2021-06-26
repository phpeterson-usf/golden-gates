<template>
  <div class="p-grid">
    <div class="p-col">
      <Splitter>
        <SplitterPanel :size="20">
          <ToolTree/>
        </SplitterPanel>
        <SplitterPanel :size="80" class="full-height">
          <Circuit :items="circuit.items"/>
        </SplitterPanel>
      </Splitter>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Splitter      from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import ToolTree      from './ToolTree.vue'
import Circuit       from './Circuit.vue'

export default defineComponent({
  name: 'SplitterContainer',
  components: {
    Splitter,
    SplitterPanel,
    ToolTree,
    Circuit,
  },
  props: {
    circuit: Object,
  },
})
</script>

<style scoped>
.full-height {
  height: 100vh;
}
</style>