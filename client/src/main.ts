// Vue setup
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)

// Primevue setup
import PrimeVue from 'primevue/config'
app.use(PrimeVue)

// Vue-router setup
import { createRouter, createWebHashHistory } from 'vue-router'
const Home = { template: '<div>Home</div> '}
const routes = [
    {path: '/', component: Home}
]
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
app.use(router)

// Vuex setup
// import { createStore } from 'vuex'
// const store = createStore({
//     state () {
//       return {
//       }
//     },
//     mutations: {
//     }
//   })
// app.use(store)

app.mount('#app')
