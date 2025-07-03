import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'

// PrimeVue CSS imports
import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/aura-light-blue/theme.css'
import 'primeicons/primeicons.css'

// Custom styles (must come after PrimeVue to override)
import './styles/components.css'

// PrimeVue components
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import TieredMenu from 'primevue/tieredmenu'
import Sidebar from 'primevue/sidebar'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Tooltip from 'primevue/tooltip'
import Dialog from 'primevue/dialog'

const app = createApp(App)

app.use(PrimeVue)

// Register PrimeVue components globally
app.component('Toolbar', Toolbar)
app.component('Button', Button)
app.component('Panel', Panel)
app.component('TieredMenu', TieredMenu)
app.component('Sidebar', Sidebar)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Dialog', Dialog)

// Register PrimeVue directives
app.directive('tooltip', Tooltip)

app.mount('#app')