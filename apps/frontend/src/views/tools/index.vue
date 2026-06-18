<template>
  <div class="pt-20 max-w-4xl mx-auto">
    <h1 class="section-title text-center">{{ $t('tools.title') }}</h1>

    <p class="text-center text-gray-600 dark:text-gray-400 mb-8">
      {{ $t('tools.subtitle') }}
    </p>

    <div class="grid md:grid-cols-2 gap-6">
      <router-link
        v-for="tool in tools"
        :key="tool.path"
        :to="tool.path"
        class="card group hover:border-day-primary dark:hover:border-night-primary transition-colors"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-day-primary/10 dark:bg-night-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-day-primary/20 dark:group-hover:bg-night-primary/20 transition-colors">
            <svg class="w-6 h-6 text-day-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tool.icon"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-day-text dark:text-night-text mb-1">
              {{ $t(tool.titleKey) }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $t(tool.descKey) }}
            </p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROUTES } from 'src/constants'

const tools = [
  {
    path: ROUTES.DEMO_FILE_CONVERTER,
    titleKey: 'fileConverter.title',
    descKey: 'fileConverter.subtitle',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
]
</script>
