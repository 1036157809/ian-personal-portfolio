<template>
  <div
    class="flex mb-4 group"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div class="max-w-[80%] relative">
      <!-- 消息气泡 -->
      <div
        class="rounded-xl px-4 py-3 text-sm leading-relaxed"
        :class="
          message.role === 'user'
            ? 'bg-gradient-to-r from-day-primary to-day-secondary text-white dark:from-night-primary dark:to-night-secondary'
            : 'card text-day-text dark:text-night-text'
        "
      >
        <!-- 编辑模式：用户消息 -->
        <template v-if="isEditing">
          <textarea
            ref="textareaEl"
            v-model="editContent"
            rows="2"
            class="w-full resize-none bg-transparent border border-white/30 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/50 text-white placeholder-white/50"
            :placeholder="t('chat.editPlaceholder')"
            @keydown.enter.exact.prevent="handleEnterKey"
            @keydown.escape="cancelEdit"
          />
          <div class="flex items-center gap-2 mt-2 justify-end">
            <button
              @click="cancelEdit"
              class="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {{ t('chat.cancel') }}
            </button>
            <button
              @click="confirmEdit"
              :disabled="!isContentChanged"
              class="px-3 py-1 text-xs rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ t('chat.confirm') }}
            </button>
          </div>
        </template>

        <!-- 正常显示 -->
        <template v-else>
          <template v-if="message.role === 'assistant'">
            <div v-if="!message.content.trim()" class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-day-primary dark:bg-night-primary animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 rounded-full bg-day-primary dark:bg-night-primary animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 rounded-full bg-day-primary dark:bg-night-primary animate-bounce" style="animation-delay: 300ms"></div>
            </div>
            <div
              v-else
              class="markdown-body"
              v-html="renderedContent"
            />
          </template>
          <p v-else class="whitespace-pre-wrap">{{ message.content }}</p>
        </template>
      </div>

      <!-- 操作按钮栏（AI思考中隐藏） -->
      <div
        v-if="!isEditing && !isLoading"
        class="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <!-- 复制按钮（用户和 AI 都有） -->
        <button
          @click="copyMessage"
          class="p-1.5 rounded-md hover:bg-day-primary/10 dark:hover:bg-night-primary/10 transition-colors text-day-text-secondary dark:text-night-text-secondary"
          :title="copied ? t('chat.copied') : t('chat.copy')"
        >
          <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        <!-- 用户消息：编辑和删除（AI思考中只显示复制） -->
        <template v-if="message.role === 'user' && !isLoading">
          <button
            v-if="isLastUser"
            @click="startEdit"
            class="p-1.5 rounded-md hover:bg-day-primary/10 dark:hover:bg-night-primary/10 transition-colors text-day-text-secondary dark:text-night-text-secondary"
            :title="t('chat.edit')"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="onDelete && onDelete()"
            class="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors text-day-text-secondary dark:text-night-text-secondary"
            :title="t('chat.deleteMsg')"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </template>

        <!-- AI 消息：重新生成（仅最后一条） -->
        <template v-else-if="isLast && onRegenerate">
          <button
            @click="onRegenerate"
            class="p-1.5 rounded-md hover:bg-day-primary/10 dark:hover:bg-night-primary/10 transition-colors text-day-text-secondary dark:text-night-text-secondary"
            :title="t('chat.regenerate')"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { marked } from 'marked';
import type { ChatMessage } from '../api/chat.api';

const { t } = useI18n();

const props = defineProps<{
  message: ChatMessage;
  isLast?: boolean;
  isLastUser?: boolean;
  isLoading?: boolean;
  onDelete?: () => void;
  onRegenerate?: () => void;
  onConfirmEdit?: (newContent: string) => void;
}>();

const isEditing = ref(false);
const editContent = ref('');
const copied = ref(false);
const textareaEl = ref<HTMLTextAreaElement | null>(null);

const isContentChanged = computed(() => editContent.value.trim() !== props.message.content.trim());

const renderedContent = computed(() => {
  if (!props.message.content.trim()) return '';
  return marked.parse(props.message.content, { async: false }) as string;
});

function startEdit() {
  editContent.value = props.message.content;
  isEditing.value = true;
  nextTick(() => textareaEl.value?.focus());
}

function cancelEdit() {
  isEditing.value = false;
  editContent.value = '';
}

function handleEnterKey() {
  if (isContentChanged.value) {
    confirmEdit();
  }
}

function confirmEdit() {
  const trimmed = editContent.value.trim();
  if (!trimmed || !isContentChanged.value) return;
  if (props.onConfirmEdit) {
    props.onConfirmEdit(trimmed);
  }
  cancelEdit();
}

function copyMessage() {
  navigator.clipboard.writeText(props.message.content).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = props.message.content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  });
}
</script>

<style scoped>
@reference "../../style.css";
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  @apply font-bold mt-3 mb-2;
}
.markdown-body :deep(h1) { @apply text-xl; }
.markdown-body :deep(h2) { @apply text-lg; }
.markdown-body :deep(h3) { @apply text-base; }
.markdown-body :deep(h4) { @apply text-sm; }

.markdown-body :deep(p) {
  @apply mb-2;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  @apply ml-4 mb-2;
}
.markdown-body :deep(ul) { @apply list-disc; }
.markdown-body :deep(ol) { @apply list-decimal; }

.markdown-body :deep(li) {
  @apply mb-1;
}

.markdown-body :deep(strong) {
  @apply font-semibold;
}

.markdown-body :deep(em) {
  @apply italic;
}

.markdown-body :deep(code) {
  @apply bg-day-surface-elevated dark:bg-night-surface-elevated px-1 py-0.5 rounded text-xs font-mono;
}

.markdown-body :deep(pre) {
  @apply bg-day-surface-elevated dark:bg-night-surface-elevated p-3 rounded-lg overflow-x-auto mb-2;
}
.markdown-body :deep(pre code) {
  @apply bg-transparent p-0;
}

.markdown-body :deep(blockquote) {
  @apply border-l-4 border-day-primary dark:border-night-primary pl-3 italic text-day-text-secondary dark:text-night-text-secondary my-2;
}

.markdown-body :deep(a) {
  @apply text-day-primary dark:text-night-primary underline;
}

.markdown-body :deep(hr) {
  @apply border-day-border dark:border-night-border my-3;
}

.markdown-body :deep(table) {
  @apply w-full border-collapse mb-2;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  @apply border border-day-border dark:border-night-border px-2 py-1 text-left;
}
.markdown-body :deep(th) {
  @apply bg-day-surface-elevated dark:bg-night-surface-elevated font-semibold;
}
</style>
