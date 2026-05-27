<template>
  <div id="app" class="min-h-screen flex flex-col">
    <ThemeBackground />
    <Navbar />
    <main class="container mx-auto px-4 py-8 relative z-10 flex-1">
      <router-view />
    </main>
    <Footer />
    <ChatWidget />
    <ChatPanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useThemeStore } from 'src/stores/theme'
import { useThemeDetector } from 'src/composables/useThemeDetector'
import Navbar from 'src/components/common/navbar/index.vue'
import Footer from 'src/components/common/footer/index.vue'
import ThemeBackground from 'src/components/BackgroundEffects/ThemeBackground.vue'
import { ChatWidget, ChatPanel } from 'src/ai-assistant'
import { visitorApi } from 'src/api/visitor.api'

const themeStore = useThemeStore()

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

onMounted(() => {
  themeStore.initTheme()
  const cleanup = useThemeDetector()

  // 记录访问（同一天只记录一次）
  const todayKey = getTodayKey();
  const recorded = sessionStorage.getItem(`visitor_recorded_${todayKey}`);
  if (!recorded) {
    visitorApi.recordVisit().then(() => {
      sessionStorage.setItem(`visitor_recorded_${todayKey}`, '1');
    }).catch(() => {
      // 静默失败，不影响用户体验
    });
  }

  onUnmounted(cleanup)
})
</script>
