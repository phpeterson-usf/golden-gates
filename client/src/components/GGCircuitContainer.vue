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
          "xGrid": 13,
          "yGrid": 4,
          "numInputs": 2,
          "invertedInputs": [],
        },
        {
          "key": "1",
          "kind": "or-gate",
          "xGrid": 0,
          "yGrid": 10,
          "numInputs": 2,
          "invertedInputs": [],
        },
        {
          "key": "2",
          "kind": "not-gate",
          "xGrid": 0,
          "yGrid": 16,
          "numInputs": 1,
          "invertedInputs": [],
        },
        {
          "key": "3",
          "kind": "xor-gate",
          "xGrid": 0,
          "yGrid": 22,
          "numInputs": 1,
          "invertedInputs": [],
        },
        {
          "key": "4",
          "kind": "input-io",
          "xGrid": 6,
          "yGrid": 3,
          "name": "A",
        },
        {
          "key": "5",
          "kind": "output-io",
          "xGrid": 22,
          "yGrid": 6,
          "name": "R",
        },
        {
          "key": "6",
          "kind": "wire",
          "segments": [
            {
              "x1Grid": 8,
              "y1Grid": 4,
              "x2Grid": 11,
              "y2Grid": 4,
            },
            {
              "x1Grid": 11,
              "y1Grid": 4,
              "x2Grid": 11,
              "y2Grid": 5,
            },
            {
              "x1Grid": 11,
              "y1Grid": 5,
              "x2Grid": 13,
              "y2Grid": 5,
            },
          ]
        },
        {
          "key": "7",
          "kind": "wire",
          "segments": [
            {
              "x1Grid": 8,
              "y1Grid": 7,
              "x2Grid": 13,
              "y2Grid": 7,
            },
          ]
        },
        {
          "key": "8",
          "kind": "input-io",
          "xGrid": 6,
          "yGrid": 6,
          "name": "B", 
        },
        {
          "key": "9",
          "kind": "wire",
          "segments": [
            {
              "x1Grid": 17,
              "y1Grid": 6,
              "x2Grid": 21,
              "y2Grid": 6,
            },
          ],
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