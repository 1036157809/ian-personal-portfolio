<template>
  <div class="min-h-screen flex items-center justify-center pt-20">
    <div class="text-center px-4">
      <h1 class="text-5xl md:text-7xl font-bold mb-4">
        {{ $t('home.greeting') }}
        <span class="bg-gradient-to-r from-day-primary to-day-secondary dark:from-night-primary dark:to-night-secondary bg-clip-text text-transparent">
          {{ $t('home.name') }}
        </span>
      </h1>
      
      <p class="text-2xl md:text-3xl text-day-text dark:text-night-text mb-2">
        {{ $t('home.title') }}
      </p>
      
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        {{ $t('home.subtitle') }}
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link to="/projects" class="btn-primary">
          {{ $t('home.cta') }}
        </router-link>
        <router-link to="/about" class="btn-secondary">
          {{ $t('home.learnMore') }}
        </router-link>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-day-primary dark:text-night-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
