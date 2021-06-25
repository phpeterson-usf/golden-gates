// Vue setup
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
app.provide('gridSize', 15)

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
import { createStore } from 'vuex'
const store = createStore({
    state () {
      // Mock this for now. Should get from server.
      return {
        "name": "project06",
        "_id": "foobar",
        "circuits": [
          {
            "_id": "deadbeef",
            "numRuns": 0,
            "items": [
              {
                "key": "0",
                "itemType": "AndGate",
                "x": 20,
                "y": 20,
                "numInputs": 2,
                "invertedInputs": [],
              },
            ]
          },
        ]
      }
    },
    mutations: {
    }
  })
app.use(store)

app.mount('#app')
