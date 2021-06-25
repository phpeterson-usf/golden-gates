<template>
  <GGBreadcrumb/>
  <GGCircuitContainer/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GGBreadcrumb from './components/GGBreadcrumb.vue'
import GGCircuitContainer from './components/GGCircuitContainer.vue'

export default defineComponent({
  name: 'App',
  components: {
    GGBreadcrumb,
    GGCircuitContainer
  },
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
