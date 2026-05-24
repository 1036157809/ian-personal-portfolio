<template>
  <div id="app" class="min-h-screen flex flex-col">
    <ThemeBackground />
    <Navbar />
    <main class="container mx-auto px-4 py-8 relative z-10 flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useThemeStore } from 'src/stores/theme'
import { useThemeDetector } from 'src/composables/useThemeDetector'
import Navbar from 'src/components/common/navbar/index.vue'
import Footer from 'src/components/common/footer/index.vue'
import ThemeBackground from 'src/components/BackgroundEffects/ThemeBackground.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
  const cleanup = useThemeDetector()
  onUnmounted(cleanup)
})
</script>
