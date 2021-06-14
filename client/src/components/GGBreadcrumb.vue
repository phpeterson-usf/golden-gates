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
            home: {icon: 'pi pi-home'},
            items: [
                {label: 'Project05'},
                {label: 'Decoder'},
            ]
        }
    }
})

</script>