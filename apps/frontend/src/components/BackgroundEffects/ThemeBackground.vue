<template>
  <Transition name="fade" mode="out-in">
    <Suspense>
      <template #default>
        <StarBackground v-if="isDark" key="star" />
        <CloudSeaBackground v-else key="cloudsea" />
      </template>
      <template #fallback>
        <div class="theme-bg-fallback" />
      </template>
    </Suspense>
  </Transition>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useThemeStore } from 'src/stores/theme';
const StarBackground = defineAsyncComponent(() => import('./StarBackground.vue'));
const CloudSeaBackground = defineAsyncComponent(() => import('./CloudSeaBackground.vue'));

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.theme-bg-fallback {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
  transition: opacity 0.5s ease;
}
</style>
