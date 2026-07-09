<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        <!-- 遮罩层 -->
      <div
        class="absolute inset-0 bg-black/80"
        @click="handleCancel"
      />

        <!-- 弹窗内容 -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="visible"
            class="glass-solid rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
          >
            <!-- 图标 -->
            <div class="flex justify-center pt-6 pb-2">
              <div class="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>

            <!-- 标题 -->
            <h3 class="text-center text-base font-semibold text-day-text dark:text-night-text px-6 pb-1">
              {{ title }}
            </h3>

            <!-- 描述 -->
            <p class="text-center text-sm text-day-text-secondary dark:text-night-text-secondary px-6 pb-6">
              {{ message }}
            </p>

            <!-- 按钮 -->
            <div class="flex border-t border-day-border/30 dark:border-night-border/30">
              <button
                class="flex-1 py-3.5 text-sm font-medium text-day-text-secondary dark:text-night-text-secondary hover:bg-day-surface-elevated/50 dark:hover:bg-night-surface-elevated/50 transition-colors"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
              <div class="w-px bg-day-border/30 dark:bg-night-border/30" />
              <button
                class="flex-1 py-3.5 text-sm font-medium text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition-colors"
                @click="handleConfirm"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function handleConfirm() {
  emit('confirm');
}

function handleCancel() {
  emit('cancel');
}
</script>
