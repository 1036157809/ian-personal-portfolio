<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
    :class="[
      isDesktop && !isScrolled
        ? 'bg-transparent border-transparent'
        : 'backdrop-blur-xl bg-transparent border-day-border/20 dark:border-night-border/20'
    ]">
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
            class="relative text-day-text dark:text-night-text hover:text-day-primary dark:hover:text-night-primary transition-colors py-1"
            active-class="text-day-primary dark:text-night-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-day-primary dark:after:bg-night-primary after:rounded-full"
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
          @click.stop="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
      
      <!-- Mobile Menu Backdrop -->
      <Teleport to="body">
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-40 bg-transparent md:hidden"
          @click="mobileMenuOpen = false"
        ></div>
      </Teleport>

      <!-- Mobile Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden mt-4 space-y-4 pb-4 relative z-10"
      >
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="block text-day-text dark:text-night-text hover:text-day-primary dark:hover:text-night-primary transition-colors"
          active-class="!text-day-primary dark:!text-night-primary font-semibold bg-day-primary/10 dark:bg-night-primary/10 rounded-lg px-3 py-1"
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from 'src/stores/theme'
import { useLanguageStore } from 'src/stores/language'
import { useI18n } from 'vue-i18n'

const themeStore = useThemeStore()
const languageStore = useLanguageStore()
const { locale } = useI18n()

const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const isDesktop = ref(window.innerWidth >= 768)

const onScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const onResize = () => {
  isDesktop.value = window.innerWidth >= 768
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
  onScroll()
  onResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})

const navItems = [
  { path: '/', label: 'nav.home' },
  { path: '/projects', label: 'nav.projects' },
  { path: '/about', label: 'nav.about' },
  { path: '/tools', label: 'nav.tools' },
  { path: '/contact', label: 'nav.contact' }
]

const toggleLanguage = () => {
  languageStore.toggleLanguage()
  locale.value = languageStore.currentLang
}
</script>
