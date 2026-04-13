<template>
  <div class="pt-20">
    <h1 class="section-title text-center">{{ $t('projects.title') }}</h1>
    
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-day-primary dark:border-night-primary"></div>
    </div>
    
    <div v-else-if="error" class="text-center py-12 text-red-500">
      {{ error }}
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="card h-full flex flex-col"
        :class="{ 'cursor-pointer hover:shadow-xl transition-shadow': project.titleZh.includes('Ipos') }"
        @click="project.titleZh.includes('Ipos') ? openProjectDetail(project) : null"
      >
        <div v-if="project.titleZh.includes('Ipos')" class="aspect-video overflow-hidden rounded-lg mb-4">
          <img
            :src="project.imageUrl"
            :alt="languageStore.currentLang === 'en' ? project.title : project.titleZh"
            class="w-full h-full object-cover"
          />
        </div>
        
        <h3 class="text-xl font-bold mb-2 text-day-text dark:text-night-text">
          {{ languageStore.currentLang === 'en' ? project.title : project.titleZh }}
        </h3>
        
        <p class="text-gray-600 dark:text-gray-400 mb-4 overflow-y-auto max-h-32 flex-1">
          {{ languageStore.currentLang === 'en' ? project.description : project.descriptionZh }}
        </p>
        
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tech in project.technologies"
            :key="tech"
            class="px-3 py-1 text-sm rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary"
          >
            {{ tech }}
          </span>
        </div>

        <div class="mt-auto">
          <router-link
            v-if="project.titleZh.includes('同道')"
            to="/tongdao-demo"
            class="w-full text-center btn-primary text-sm py-2 block"
          >
            {{ $t('projects.viewTongdaoDemo') }}
          </router-link>
          <router-link
            v-if="project.titleZh.includes('首钢')"
            to="/shougang-permission-demo"
            class="w-full text-center btn-primary text-sm py-2 block"
          >
            {{ $t('projects.viewShougangDemo') }}
          </router-link>
          <div v-if="project.titleZh.includes('DS-portal')" class="flex gap-2">
            <router-link
              to="/ds-portal-demo"
              class="flex-1 text-center btn-primary text-sm py-2 block"
            >
              {{ $t('projects.viewDemo') }}
            </router-link>
            <router-link
              to="/ds-portal-demo#code"
              class="flex-1 text-center btn-secondary text-sm py-2 block"
            >
              {{ $t('projects.viewCode') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Detail Modal -->
    <div
      v-if="selectedProject"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeProjectDetail"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold text-day-text dark:text-night-text">
            {{ languageStore.currentLang === 'en' ? selectedProject.title : selectedProject.titleZh }}
          </h3>
          <button
            @click="closeProjectDetail"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ languageStore.currentLang === 'en' ? selectedProject.description : selectedProject.descriptionZh }}
        </p>
        
        <!-- Screenshots -->
        <div class="mb-6">
          <p class="text-sm font-semibold text-day-text dark:text-night-text mb-3">{{ $t('projects.pcIpad') }}</p>
          <img
            :src="selectedProject.imageUrl"
            :alt="languageStore.currentLang === 'en' ? selectedProject.title : selectedProject.titleZh"
            class="w-full rounded-lg shadow-lg mb-4"
          />
          <div v-if="selectedProject.additionalImages && selectedProject.additionalImages.length > 0" class="grid grid-cols-2 gap-4">
            <img
              v-for="(img, idx) in selectedProject.additionalImages.filter((i: string) => i.includes('/pc/'))"
              :key="img"
              :src="img"
              :alt="`${languageStore.currentLang === 'en' ? selectedProject.title : selectedProject.titleZh} - PC Screenshot ${idx + 1}`"
              class="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
        
        <div v-if="selectedProject.mobileImageUrl" class="mb-6">
          <p class="text-sm font-semibold text-day-text dark:text-night-text mb-3">{{ $t('projects.mobile') }}</p>
          <img
            :src="selectedProject.mobileImageUrl"
            :alt="`${languageStore.currentLang === 'en' ? selectedProject.title : selectedProject.titleZh} (Mobile)`"
            class="w-full max-w-md mx-auto rounded-lg shadow-lg mb-4"
          />
          <div v-if="selectedProject.additionalImages && selectedProject.additionalImages.length > 0" class="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <img
              v-for="(img, idx) in selectedProject.additionalImages.filter((i: string) => i.includes('/mobile/'))"
              :key="img"
              :src="img"
              :alt="`${languageStore.currentLang === 'en' ? selectedProject.title : selectedProject.titleZh} - Mobile Screenshot ${idx + 1}`"
              class="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-4">
          <span
            v-for="tech in selectedProject.technologies"
            :key="tech"
            class="px-3 py-1 text-sm rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary"
          >
            {{ tech }}
          </span>
        </div>
        
        <div class="flex gap-4">
          <router-link
            v-if="selectedProject.titleZh.includes('同道')"
            to="/tongdao-demo"
            class="flex-1 text-center btn-primary text-sm py-2"
          >
            {{ $t('projects.viewTongdaoDemo') }}
          </router-link>
          <router-link
            v-if="selectedProject.titleZh.includes('首钢')"
            to="/shougang-permission-demo"
            class="flex-1 text-center btn-primary text-sm py-2"
          >
            {{ $t('projects.viewShougangDemo') }}
          </router-link>
          <div v-if="selectedProject.titleZh.includes('DS-portal')" class="flex gap-4 flex-1">
            <router-link
              to="/ds-portal-demo"
              class="flex-1 text-center btn-primary text-sm py-2"
            >
              {{ $t('projects.viewDemo') }}
            </router-link>
            <router-link
              to="/ds-portal-demo#code"
              class="flex-1 text-center btn-secondary text-sm py-2"
            >
              {{ $t('projects.viewCode') }}
            </router-link>
          </div>
          <a
            v-if="selectedProject.demoUrl && !selectedProject.titleZh.includes('DS-portal')"
            :href="selectedProject.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 text-center btn-primary text-sm py-2"
          >
            {{ $t('projects.viewDemo') }}
          </a>
          <a
            v-if="selectedProject.githubUrl && !selectedProject.titleZh.includes('DS-portal')"
            :href="selectedProject.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 text-center btn-secondary text-sm py-2"
          >
            {{ $t('projects.viewCode') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '../stores/language'
import axios from 'axios'

const languageStore = useLanguageStore()

const projects = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const selectedProject = ref<any>(null)

const fetchProjects = async () => {
  try {
    const response = await axios.get('/api/projects')
    projects.value = response.data
  } catch (err) {
    error.value = 'Failed to load projects'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openProjectDetail = (project: any) => {
  selectedProject.value = project
}

const closeProjectDetail = () => {
  selectedProject.value = null
}

onMounted(() => {
  fetchProjects()
})
</script>
