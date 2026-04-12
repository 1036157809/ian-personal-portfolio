<template>
  <nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-day-background/80 dark:bg-night-background/80 border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <router-link to="/" class="text-2xl font-bold bg-gradient-to-r from-day-primary to-day-secondary dark:from-night-primary dark:to-night-secondary bg-clip-text text-transparent">
          Ian
        </router-link>
        
        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-day-text dark:text-night-text hover:text-day-primary dark:hover:text-night-primary transition-colors"
            active-class="text-day-primary dark:text-night-primary font-semibold"
          >
            {{ $t(item.label) }}
          </router-link>
          
          <button
            @click="toggleLanguage"
            class="px-3 py-1 rounded-lg border border-day-primary dark:border-night-primary text-day-primary dark:text-night-primary hover:bg-day-primary/10 dark:hover:bg-night-primary/10 transition-colors"
          >
            {{ languageStore.currentLang === 'en' ? '中文' : 'EN' }}
          </button>
          
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg v-if="themeStore.isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
        </div>
        
        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden mt-4 space-y-4 pb-4">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="block text-day-text dark:text-night-text hover:text-day-primary dark:hover:text-night-primary transition-colors"
          @click="mobileMenuOpen = false"
        >
          {{ $t(item.label) }}
        </router-link>
        
        <div class="flex space-x-4">
          <button
            @click="toggleLanguage"
            class="px-3 py-1 rounded-lg border border-day-primary dark:border-night-primary text-day-primary dark:text-night-primary"
          >
            {{ languageStore.currentLang === 'en' ? '中文' : 'EN' }}
          </button>
          
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg v-if="themeStore.isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useLanguageStore } from '../stores/language'
import { useI18n } from 'vue-i18n'

const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const { locale } = useI18n()

const mobileMenuOpen = ref(false)

const navItems = [
  { path: '/', label: 'nav.home' },
  { path: '/projects', label: 'nav.projects' },
  { path: '/about', label: 'nav.about' },
  { path: '/contact', label: 'nav.contact' }
]

const toggleLanguage = () => {
  languageStore.toggleLanguage()
  locale.value = languageStore.currentLang
}
</script>
