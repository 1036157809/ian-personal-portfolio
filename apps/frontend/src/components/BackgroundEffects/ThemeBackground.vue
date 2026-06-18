<template>
  <Transition name="fade" mode="out-in">
    <StarBackground v-if="isDark" key="star" />
    <CloudSeaBackground v-else key="cloudsea" />
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from 'src/stores/theme';
import StarBackground from './StarBackground.vue';
import CloudSeaBackground from './CloudSeaBackground.vue';

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
</style>