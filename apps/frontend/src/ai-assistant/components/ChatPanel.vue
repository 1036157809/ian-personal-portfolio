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
      class="fixed z-50 glass-solid rounded-2xl shadow-2xl flex overflow-hidden
        bottom-24 right-4 md:right-6 w-[calc(100vw-2rem)] max-w-[720px] h-[560px]
        max-md:bottom-0 max-md:right-0 max-md:w-full max-md:max-w-full max-md:h-[100dvh] max-md:rounded-none"
    >
      <!-- 移动端遮罩层（侧边栏打开时） -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/30 z-10 md:hidden"
        @click="sidebarOpen = false"
      />

      <!-- 侧边栏：对话列表 -->
      <div
        class="flex-shrink-0 border-r border-day-border/30 dark:border-night-border/30 flex flex-col bg-day-surface/50 dark:bg-night-surface/50
          w-56
          max-md:fixed max-md:left-0 max-md:top-0 max-md:h-full max-md:w-[280px] max-md:z-20 max-md:transition-transform max-md:duration-300"
        :class="sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'"
      >
        <!-- 侧边栏顶部：新建对话 -->
        <div class="p-3">
          <button
            class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-day-border dark:border-night-border transition-colors text-sm font-medium hover:bg-day-primary/10 dark:hover:bg-night-primary/10 text-day-text dark:text-night-text"
            @click="handleNewChat"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ t('chat.newChat') }}
          </button>
        </div>

        <!-- 对话列表 -->
        <div class="flex-1 overflow-y-auto px-2 space-y-1">
          <div
            v-for="conv in chatStore.sortedConversations"
            :key="conv.id"
            class="group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors text-sm"
            :class="conv.id === chatStore.currentConversationId
              ? 'bg-day-primary/15 dark:bg-night-primary/15 text-day-primary dark:text-night-primary font-medium'
              : 'hover:bg-day-primary/5 dark:hover:bg-night-primary/5 text-day-text-secondary dark:text-night-text-secondary'"
            @click="chatStore.switchConversation(conv.id); sidebarOpen = false"
          >
            <svg class="w-3.5 h-3.5 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span class="flex-1 truncate">{{ conv.title }}</span>
            <button
              class="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 transition-all"
              @click.stop="handleDeleteConversation(conv.id)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- 顶部栏 -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-day-border/30 dark:border-night-border/30">
          <div class="flex items-center gap-3">
            <button
              class="md:hidden p-1.5 rounded-lg hover:bg-day-primary/10 dark:hover:bg-night-primary/10 transition-colors text-day-text-secondary dark:text-night-text-secondary"
              @click="sidebarOpen = !sidebarOpen"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-day-primary to-day-secondary dark:from-night-primary dark:to-night-secondary flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 class="section-title !text-lg !m-0">{{ t('chat.title') }}</h3>
          </div>
          <button
            class="p-1.5 rounded-lg hover:bg-day-primary/10 dark:hover:bg-night-primary/10 transition-colors text-day-text-secondary dark:text-night-text-secondary"
            @click="chatStore.closeChat"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 消息列表 -->
        <div ref="scrollRef" class="flex-1 overflow-y-auto p-4 space-y-1">
          <!-- 新对话欢迎页 -->
          <div v-if="chatStore.isNewConversation" class="text-center py-8">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-day-primary to-day-secondary dark:from-night-primary dark:to-night-secondary flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p class="text-day-text dark:text-night-text font-medium mb-2">{{ t('chat.welcomeTitle') }}</p>
            <p class="text-day-text-secondary dark:text-night-text-secondary text-sm">{{ t('chat.welcomeDesc') }}</p>
          </div>

          <!-- 对话消息 -->
          <template v-else>
            <ChatMessage
              v-for="(msg, index) in chatStore.messages"
              :key="`${index}-${msg.role}`"
              :message="msg"
              :is-last="index === lastAssistantIndex && msg.role === 'assistant'"
              :is-last-user="index === lastUserIndex && msg.role === 'user'"
              :is-loading="chatStore.isLoading"
              :on-confirm-edit="index === lastUserIndex ? (newContent: string) => handleEditSubmit(index, newContent) : undefined"
              :on-delete="msg.role === 'user' ? () => handleDeleteMessage(index) : undefined"
              :on-regenerate="index === lastAssistantIndex && msg.role === 'assistant' ? () => handleRegenerate(index) : undefined"
            />
          </template>

          <div v-if="chatStore.error" class="flex justify-start mb-4">
            <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
              {{ chatStore.error === '__DAILY_LIMIT__' ? t('chat.dailyLimitMessage') : chatStore.error }}
            </div>
          </div>
        </div>

        <!-- 输入框 -->
        <ChatInput
          :disabled="chatStore.isLoading"
          @send="onSend"
        />
      </div>
    </div>
  </Transition>

  <!-- 确认弹窗 -->
  <ConfirmDialog
    :visible="showConfirm"
    :title="t('chat.confirmDeleteTitle')"
    :message="confirmTarget?.type === 'conversation' ? t('chat.confirmDelete') : t('chat.confirmDeleteMessage')"
    :confirm-text="t('chat.confirm')"
    :cancel-text="t('chat.cancel')"
    @confirm="handleConfirmDelete"
    @cancel="confirmTarget = null; showConfirm = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChatStore } from '../stores/chat.store';
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';
import ConfirmDialog from 'src/components/common/ConfirmDialog.vue';

const { t } = useI18n();

const chatStore = useChatStore();
const scrollRef = ref<HTMLElement | null>(null);
const sidebarOpen = ref(false);
const showConfirm = ref(false);
const confirmTarget = ref<{ type: 'conversation'; id: string } | { type: 'message'; index: number } | null>(null);

// Find the last assistant message index
const lastAssistantIndex = computed(() => {
  const msgs = chatStore.messages;
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === 'assistant') return i;
  }
  return -1;
});

// Find the last user message index (the one right before the last assistant)
const lastUserIndex = computed(() => {
  const lastAst = lastAssistantIndex.value;
  if (lastAst <= 0) return -1;
  for (let i = lastAst - 1; i >= 0; i--) {
    if (chatStore.messages[i].role === 'user') return i;
  }
  return -1;
});

function handleNewChat() {
  const switched = chatStore.newConversation();
  if (!switched) {
    showToast(t('chat.alreadyNew'));
  } else {
    sidebarOpen.value = false;
  }
}

function handleDeleteConversation(id: string) {
  confirmTarget.value = { type: 'conversation', id };
  showConfirm.value = true;
}

function handleConfirmDelete() {
  if (confirmTarget.value?.type === 'conversation') {
    chatStore.deleteConversation(confirmTarget.value.id);
  } else if (confirmTarget.value?.type === 'message') {
    chatStore.deleteMessagePair(confirmTarget.value.index);
  }
  showConfirm.value = false;
  confirmTarget.value = null;
}

async function onSend(text: string) {
  await chatStore.sendMessageStream(text);
}

function handleEditSubmit(index: number, newContent: string) {
  chatStore.editMessage(index, newContent);
}

function handleDeleteMessage(index: number) {
  confirmTarget.value = { type: 'message', index };
  showConfirm.value = true;
}

function handleRegenerate(index: number) {
  chatStore.regenerateMessage(index);
}

function showToast(message: string) {
  const el = document.createElement('div');
  el.textContent = message;
  el.className = 'fixed top-[85px] left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-lg bg-day-surface-elevated dark:bg-night-surface-elevated text-day-text dark:text-night-text text-sm shadow-lg border border-day-border dark:border-night-border transition-opacity duration-300';
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2000);
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
