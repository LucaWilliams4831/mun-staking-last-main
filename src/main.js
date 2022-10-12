import starportLibrary from './starportvue'
import { createApp } from 'vue'
import VueSimpleAlert from "@kyvg/vue3-notification";

import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.use(VueSimpleAlert);
app.use(store).use(router).use(starportLibrary).mount('#app')
