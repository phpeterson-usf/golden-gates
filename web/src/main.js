import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'

// PrimeVue CSS imports
import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/aura-light-blue/theme.css'
import 'primeicons/primeicons.css'

// PrimeVue components
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import TieredMenu from 'primevue/tieredmenu'

const app = createApp(App)

app.use(PrimeVue)

// Register PrimeVue components globally
app.component('Toolbar', Toolbar)
app.component('Button', Button)
app.component('Panel', Panel)
app.component('TieredMenu', TieredMenu)

app.mount('#app')