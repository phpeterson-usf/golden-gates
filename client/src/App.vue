<template>
  <AppBar/>
  <SplitterContainer/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppBar from './components/AppBar.vue'
import SplitterContainer from './components/SplitterContainer.vue'

export default defineComponent({
  name: 'App',
  components: {
    AppBar,
    SplitterContainer,
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
