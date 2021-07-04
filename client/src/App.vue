<template>
  <AppBar 
    @toggleSimulation="handleToggleSimulation"
  />
  <SplitterContainer :circuit="circuit"/>
</template>

<script lang="ts">
import { defineComponent, provide, reactive } from 'vue'
import AppBar from './components/AppBar.vue'
import SplitterContainer from './components/SplitterContainer.vue'
import { CSimState } from './sim/base'
import { CAndGate } from './sim/gates'
import { CInput, COutput } from './sim/io'
import { CWire, CWireSegment } from './sim/wires'

import { CCircuit} from './sim/base'
export default defineComponent({
  name: 'App',
  components: {
    AppBar,
    SplitterContainer,
  },
  methods: {
    handleToggleSimulation() {
      if (this.simState.simulating === true) {
        console.log("stop simulation")
      } else {
        console.log("start simulation ")
      }
      this.simState.simulating = !this.simState.simulating
    },
    makeCircuit() {
      // I'm sure this isn't how we'll create it from JSON but
      // I want to start testing simulation ideas
      const a = new CAndGate("0", 13, 4, 2)
      const i1 = new CInput("1", "A", 6, 3, 0)
      const i2 = new CInput("2", "B", 6, 6, 0)
      const o = new COutput("3", "R", 22, 6)

      const s1 = new CWireSegment(8, 4, 11, 4)
      const s2 = new CWireSegment(11, 4, 11, 5)
      const s3 = new CWireSegment(11, 5, 13, 5)
      const w1 = new CWire("4")
      w1.segments.push(s1, s2, s3)

      const s4 = new CWireSegment(8, 7, 13, 7)
      const w2 = new CWire("5")
      w2.segments.push(s4)

      const s5 = new CWireSegment(17, 6, 21, 6)
      const w3 = new CWire("6")
      w3.segments.push(s5)
  
      const circuit = new CCircuit("test", "deadbeef")
      circuit.items.push(a, i1, i2, o, w1, w2, w3)
      return circuit
    },
  },
  data() {
    return {
      "circuit": this.makeCircuit(),
    }
  },
  setup() {
    let simState = reactive(new CSimState(false))
    provide("simState", simState)
    return {
      simState,
    }
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.p-component {
  border-width: 0px;
}
</style>
