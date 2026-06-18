import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from 'src/App.vue'
import router from 'src/router'
import i18n from 'src/i18n'
import { visitorApi } from 'src/api/visitor.api'
import { useLanguageStore } from 'src/stores/language'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// Detect locale by IP before mounting
const langStore = useLanguageStore()
visitorApi.getLocation().then((res) => {
  if (!res.isChineseRegion) {
    langStore.setLanguage('en')
    i18n.global.locale.value = 'en'
  }
}).catch(() => {
  // Default to Chinese on error
}).finally(() => {
  app.mount('#app')
})
