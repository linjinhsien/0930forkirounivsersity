import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n, isSupportedLocale, setLocale } from './i18n'
import { usePlayerStore } from './stores/player'
import './styles/main.css'

const app = createApp(App)
const pinia = createPinia()
const playerStore = usePlayerStore(pinia)
const profile = playerStore.initializeProfile()

app.use(pinia)
app.use(router)
app.use(i18n)

if (isSupportedLocale(profile.language)) {
  await setLocale(profile.language)
}

app.mount('#app')
