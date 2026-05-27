<template>
  <div
    class="flex mb-4"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed"
      :class="
        message.role === 'user'
          ? 'bg-gradient-to-r from-day-primary to-day-secondary text-white dark:from-night-primary dark:to-night-secondary'
          : 'card text-day-text dark:text-night-text'
      "
    >
      <div
        v-if="message.role === 'assistant'"
        class="markdown-body"
        v-html="renderedContent"
      />
      <p v-else class="whitespace-pre-wrap">{{ message.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import type { ChatMessage } from '../api/chat.api';

const props = defineProps<{
  message: ChatMessage;
}>();

const renderedContent = computed(() => {
  return marked.parse(props.message.content, { async: false }) as string;
});
</script>

<style scoped>
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
