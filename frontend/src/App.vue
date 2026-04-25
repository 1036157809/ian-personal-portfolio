<template>
  <div id="app" class="min-h-screen">
    <Navbar />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from 'src/stores/theme'
import Navbar from 'src/components/common/navbar/index.vue'
import Footer from 'src/components/common/footer/index.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>
