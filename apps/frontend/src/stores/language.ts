import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLanguageStore = defineStore('language', () => {
  const currentLang = ref('zh')

  const setLanguage = (lang: 'en' | 'zh') => {
    currentLang.value = lang
  }

  const toggleLanguage = () => {
    currentLang.value = currentLang.value === 'en' ? 'zh' : 'en'
  }

  return {
    currentLang,
    setLanguage,
    toggleLanguage
  }
})
