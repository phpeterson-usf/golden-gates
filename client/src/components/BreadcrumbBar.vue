<template>
  <div class="p-col">
    <Breadcrumb :home="home" :model="items"/>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import 'primeflex/primeflex.css'
import Breadcrumb from 'primevue/breadcrumb'

export default defineComponent({
  name: 'BreadcrumbBar',
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