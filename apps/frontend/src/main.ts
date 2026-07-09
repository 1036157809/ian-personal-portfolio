import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from 'src/App.vue'
import router from 'src/router'
import i18n from 'src/i18n'
import { useLanguageStore } from 'src/stores/language'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Detect locale by browser language before mounting
const langStore = useLanguageStore()
if ((navigator.language || '').startsWith('en')) {
  langStore.setLanguage('en')
  i18n.global.locale.value = 'en'
}
app.mount('#app')
