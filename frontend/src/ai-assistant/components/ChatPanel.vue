<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div
      v-if="chatStore.isOpen"
      class="fixed bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-[380px] h-[560px] glass-solid rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      <div class="flex items-center justify-between px-5 py-4 border-b border-day-border/30 dark:border-night-border/30">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-r from-day-primary to-day-secondary dark:from-night-primary dark:to-night-secondary flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 class="section-title !text-lg !m-0">{{ t('chat.title') }}</h3>
        </div>
        <button
          @click="chatStore.closeChat"
          class="p-1.5 rounded-lg hover:bg-day-primary/10 dark:hover:bg-night-primary/10 transition-colors text-day-text-secondary dark:text-night-text-secondary"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref="scrollRef" class="flex-1 overflow-y-auto p-4 space-y-1">
        <div v-if="!chatStore.hasMessages" class="text-center py-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-day-primary to-day-secondary dark:from-night-primary dark:to-night-secondary flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p class="text-day-text dark:text-night-text font-medium mb-2">{{ t('chat.welcomeTitle') }}</p>
          <p class="text-day-text-secondary dark:text-night-text-secondary text-sm">{{ t('chat.welcomeDesc') }}</p>
        </div>

        <ChatMessage
          v-for="(msg, index) in chatStore.messages"
          :key="index"
          :message="msg"
        />

        <div v-if="chatStore.isLoading && !chatStore.error" class="flex justify-start mb-4">
          <div class="card rounded-xl px-4 py-3">
            <div class="flex space-x-1">
              <div class="w-2 h-2 rounded-full bg-day-primary dark:bg-night-primary animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 rounded-full bg-day-primary dark:bg-night-primary animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 rounded-full bg-day-primary dark:bg-night-primary animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>

        <div v-if="chatStore.error" class="flex justify-start mb-4">
          <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
            {{ chatStore.error === '__DAILY_LIMIT__' ? t('chat.dailyLimitMessage') : chatStore.error }}
          </div>
        </div>
      </div>

      <ChatInput
        :disabled="chatStore.isLoading"
        @send="onSend"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChatStore } from '../stores/chat.store';
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';

const { t } = useI18n();

const chatStore = useChatStore();
const scrollRef = ref<HTMLElement | null>(null);

async function onSend(text: string) {
  await chatStore.sendMessageStream(text);
}

watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick();
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
    }
  }
);
</script>
