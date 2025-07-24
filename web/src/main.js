import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import { messages, defaultLocale } from './locales'

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
import Message from 'primevue/message'

// Create i18n instance
const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages,
  legacy: false, // Use Composition API
  globalInjection: true // Enable $t() in templates
})

const app = createApp(App)

app.use(PrimeVue)
app.use(i18n)

// Register PrimeVue components globally
app.component('Toolbar', Toolbar)
app.component('Button', Button)
app.component('Panel', Panel)
app.component('TieredMenu', TieredMenu)
app.component('Sidebar', Sidebar)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Dialog', Dialog)
app.component('Message', Message)

// Register PrimeVue directives
app.directive('tooltip', Tooltip)

app.mount('#app')
