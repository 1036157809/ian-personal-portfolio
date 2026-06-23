<template>
  <div class="fixed bottom-6 right-4 md:right-6 z-50">
    <button
      class="w-14 h-14 rounded-full bg-gradient-to-r from-day-primary to-day-secondary dark:from-night-primary dark:to-night-secondary text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
      @click="chatStore.toggleChat"
    >
      <svg v-if="!chatStore.isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '../stores/chat.store';
const chatStore = useChatStore();
</script>
