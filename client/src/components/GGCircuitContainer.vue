<template>
  <div class="p-grid">
    <div class="p-col">
      <Splitter>
        <SplitterPanel :size="20">
          <GGToolTree/>
        </SplitterPanel>
        <SplitterPanel :size="80" class="full-height">
          <GGCircuitView :items="items"/>
        </SplitterPanel>
      </Splitter>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import GGToolTree from './GGToolTree.vue'
import GGCircuitView from './GGCircuitView.vue'

export default defineComponent({
  name: 'GGCircuitContainer',
  components: {
    Splitter,
    SplitterPanel,
    GGToolTree,
    GGCircuitView,
  },
  props: {
    circuit: Object,
  },
  data() {
    return {
      "items": [
        {
        "key": "0",
        "kind": "AndGate",
        "x": 20,
        "y": 20,
        "numInputs": 2,
        "invertedInputs": [],
        },
        {
        "key": "1",
        "kind": "OrGate",
        "x": 30,
        "y": 30,
        "numInputs": 2,
        "invertedInputs": [],
        },
        {
        "key": "2",
        "kind": "NotGate",
        "x": 30,
        "y": 30,
        "numInputs": 1,
        "invertedInputs": [],
        },
      ],
    }
  }

})
</script>

<style scoped>
.full-height {
  height: 100vh;
}
</style>