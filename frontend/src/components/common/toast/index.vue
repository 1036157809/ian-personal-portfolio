<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div
      v-if="visible"
      class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="close"
            class="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');

const show = (msg: string) => {
  message.value = msg;
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, 3000);
};

const close = () => {
  visible.value = false;
};

defineExpose({
  show
});
</script>
