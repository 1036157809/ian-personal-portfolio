<template>
  <div class="border-t border-day-border dark:border-night-border p-4">
    <form class="flex items-end gap-3" @submit.prevent="onSubmit">
      <textarea
        v-model="input"
        :placeholder="disabled ? t('chat.thinkingPlaceholder') : t('chat.inputPlaceholder')"
        :disabled="disabled"
        rows="1"
        class="flex-1 resize-none rounded-xl border border-day-border dark:border-night-border bg-day-surface dark:bg-night-surface text-day-text dark:text-night-text px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-day-primary dark:focus:ring-night-primary transition-all duration-300 disabled:opacity-50"
        @keydown.enter.exact.prevent="onSubmit"
      />
      <button
        type="submit"
        :disabled="disabled || !input.trim()"
        class="btn-primary flex-shrink-0 !px-4 !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="!disabled" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  send: [message: string];
}>();

const input = ref('');

function onSubmit() {
  const text = input.value.trim();
  if (!text || props.disabled) return;
  emit('send', text);
  input.value = '';
}
</script>
