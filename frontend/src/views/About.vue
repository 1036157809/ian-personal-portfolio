<template>
  <div class="pt-20 max-w-6xl mx-auto">
    <h1 class="section-title text-center">{{ $t('about.title') }}</h1>
    
    <div class="card mb-8">
      <p class="text-lg text-day-text dark:text-night-text leading-relaxed">
        {{ $t('about.description') }}
      </p>
    </div>

    <!-- Professional Skills -->
    <div class="card mb-8">
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">
        {{ $t('about.skills') }}
      </h2>
      
      <!-- Skill Tags -->
      <div class="flex flex-wrap gap-2 mb-6">
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Vue 2/3
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          React 18
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          TypeScript
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          JavaScript
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          HTML5/CSS3
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Quasar
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Node.js
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Webpack
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Vite
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          ECharts
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          ElementUI
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Ant Design
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Canvas
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Git
        </span>
        <span class="px-4 py-2 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary">
          Sequelize
        </span>
      </div>

      <!-- Detailed Skills -->
      <div class="space-y-4">
        <div v-for="(skill, key) in skillsList" :key="key" class="p-4 rounded-lg bg-day-surface/50 dark:bg-night-surface/50">
          <p class="text-day-text dark:text-night-text">{{ skill }}</p>
        </div>
      </div>
    </div>

    <!-- Work Experience -->
    <div class="card mb-8">
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">
        {{ $t('about.experience') }}
      </h2>
      <div class="space-y-8">
        <div class="border-l-4 border-day-primary dark:border-night-primary pl-6">
          <h3 class="text-xl font-semibold text-day-text dark:text-night-text">{{ $t('about.workExp1.company') }}</h3>
          <p class="text-day-primary dark:text-night-primary font-medium">{{ $t('about.workExp1.role') }}</p>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ $t('about.workExp1.period') }}</p>
          <ul class="space-y-2 text-day-text dark:text-night-text text-sm">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp1.desc1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp1.desc2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp1.desc3') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp1.desc4') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp1.desc5') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span class="font-semibold">{{ $t('about.workExp1.desc6') }}</span>
            </li>
          </ul>
        </div>

        <div class="border-l-4 border-day-primary dark:border-night-primary pl-6">
          <h3 class="text-xl font-semibold text-day-text dark:text-night-text">{{ $t('about.workExp2.company') }}</h3>
          <p class="text-day-primary dark:text-night-primary font-medium">{{ $t('about.workExp2.role') }}</p>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ $t('about.workExp2.period') }}</p>
          <ul class="space-y-2 text-day-text dark:text-night-text text-sm">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp2.desc1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp2.desc2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp2.desc3') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp2.desc4') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp2.desc5') }}</span>
            </li>
          </ul>
        </div>

        <div class="border-l-4 border-day-primary dark:border-night-primary pl-6">
          <h3 class="text-xl font-semibold text-day-text dark:text-night-text">{{ $t('about.workExp3.company') }}</h3>
          <p class="text-day-primary dark:text-night-primary font-medium">{{ $t('about.workExp3.role') }}</p>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ $t('about.workExp3.period') }}</p>
          <ul class="space-y-2 text-day-text dark:text-night-text text-sm">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp3.desc1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp3.desc2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.workExp3.desc3') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Project Experience -->
    <div class="card mb-8">
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">
        {{ $t('about.projects') }}
      </h2>
      <div class="space-y-6">
        <div class="p-4 rounded-lg bg-day-surface/50 dark:bg-night-surface/50">
          <h3 class="text-lg font-semibold text-day-text dark:text-night-text">{{ $t('about.project1.name') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ $t('about.project1.period') }}</p>
          <p class="text-day-text dark:text-night-text text-sm mb-3">{{ $t('about.project1.desc') }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3"><strong>Tech:</strong> {{ $t('about.project1.tech') }}</p>
          <ul class="space-y-1 text-day-text dark:text-night-text text-sm">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project1.challenge1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project1.challenge2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project1.challenge3') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project1.challenge4') }}</span>
            </li>
          </ul>
        </div>

        <div class="p-4 rounded-lg bg-day-surface/50 dark:bg-night-surface/50">
          <h3 class="text-lg font-semibold text-day-text dark:text-night-text">{{ $t('about.project2.name') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ $t('about.project2.period') }}</p>
          <p class="text-day-text dark:text-night-text text-sm mb-3">{{ $t('about.project2.desc') }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3"><strong>Tech:</strong> {{ $t('about.project2.tech') }}</p>
          <ul class="space-y-1 text-day-text dark:text-night-text text-sm">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project2.highlight1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project2.highlight2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project2.highlight3') }}</span>
            </li>
          </ul>
        </div>

        <div class="p-4 rounded-lg bg-day-surface/50 dark:bg-night-surface/50">
          <h3 class="text-lg font-semibold text-day-text dark:text-night-text">{{ $t('about.project3.name') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ $t('about.project3.period') }}</p>
          <p class="text-day-text dark:text-night-text text-sm mb-3">{{ $t('about.project3.desc') }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3"><strong>Tech:</strong> {{ $t('about.project3.tech') }}</p>
          <ul class="space-y-1 text-day-text dark:text-night-text text-sm">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project3.achievement1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project3.achievement2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project3.achievement3') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project3.achievement4') }}</span>
            </li>
          </ul>
        </div>

        <div class="p-4 rounded-lg bg-day-surface/50 dark:bg-night-surface/50">
          <h3 class="text-lg font-semibold text-day-text dark:text-night-text">{{ $t('about.project4.name') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-2">{{ $t('about.project4.period') }}</p>
          <p class="text-day-text dark:text-night-text text-sm mb-3">{{ $t('about.project4.desc') }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-3"><strong>Tech:</strong> {{ $t('about.project4.tech') }}</p>
          <ul class="space-y-1 text-day-text dark:text-night-text text-sm">
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project4.achievement1') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project4.achievement2') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project4.achievement3') }}</span>
            </li>
            <li class="flex items-start">
              <span class="mr-2">•</span>
              <span>{{ $t('about.project4.achievement4') }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Education -->
    <div class="card">
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">
        {{ $t('about.education') }}
      </h2>
      <div class="space-y-4">
        <div class="border-l-4 border-day-primary dark:border-night-primary pl-4">
          <h3 class="font-semibold text-day-text dark:text-night-text">{{ $t('about.education1.school') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">{{ $t('about.education1.degree') }} - {{ $t('about.education1.major') }}</p>
          <p class="text-gray-500 dark:text-gray-500 text-xs">{{ $t('about.education1.period') }}</p>
        </div>
        <div class="border-l-4 border-day-primary dark:border-night-primary pl-4">
          <h3 class="font-semibold text-day-text dark:text-night-text">{{ $t('about.education2.school') }}</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">{{ $t('about.education2.degree') }} - {{ $t('about.education2.major') }}</p>
          <p class="text-gray-500 dark:text-gray-500 text-xs">{{ $t('about.education2.period') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const skillsList = computed(() => ({
  frontend: t('about.skillsList.frontend'),
  javascript: t('about.skillsList.javascript'),
  frameworks: t('about.skillsList.frameworks'),
  engineering: t('about.skillsList.engineering'),
  nodejs: t('about.skillsList.nodejs'),
  git: t('about.skillsList.git'),
  visualization: t('about.skillsList.visualization'),
  crossPlatform: t('about.skillsList.crossPlatform'),
  special: t('about.skillsList.special')
}))
</script>
