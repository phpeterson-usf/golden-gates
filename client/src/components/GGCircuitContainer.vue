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
        "kind": "and-gate",
        "x": 0,
        "y": 0,
        "numInputs": 2,
        "invertedInputs": [],
        },
        {
        "key": "1",
        "kind": "or-gate",
        "x": 0,
        "y": 100,
        "numInputs": 2,
        "invertedInputs": [],
        },
        {
        "key": "2",
        "kind": "not-gate",
        "x": 0,
        "y": 200,
        "numInputs": 1,
        "invertedInputs": [],
        },
        {
        "key": "3",
        "kind": "xor-gate",
        "x": 0,
        "y": 300,
        "numInputs": 1,
        "invertedInputs": [],
        },
        {
          "key": "4",
          "kind": "input-io",
          "x": 150,
          "y": 100,
          "name": "D",
        },
        {
          "key": "5",
          "kind": "output-io",
          "x": 150,
          "y": 150,
          "name": "Q",
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