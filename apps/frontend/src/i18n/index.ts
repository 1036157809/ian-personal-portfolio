import { createI18n } from 'vue-i18n'
import en from 'src/i18n/locales/en'
import zh from 'src/i18n/locales/zh'

const messages = {
  en,
  zh
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'en',
  messages
})

export default i18n
