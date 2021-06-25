<template>
  <div class="p-grid">
    <div class="pcol">
      <Breadcrumb :home="home" :model="items"/>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import 'primeflex/primeflex.css'
import Breadcrumb from 'primevue/breadcrumb'

export default defineComponent({
  name: 'GGBreadcrumb',
  components: {
    Breadcrumb,
  },
  data() {
        return {
            home: {label: 'CS315-03'},
            items: [
                {label: 'Project05 - phpeterson'},
            ]
        }
    }
})

</script>