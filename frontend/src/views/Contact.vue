<template>
  <div class="pt-20 max-w-2xl mx-auto">
    <h1 class="section-title text-center">{{ $t('contact.title') }}</h1>
    
    <p class="text-center text-gray-600 dark:text-gray-400 mb-8">
      {{ $t('contact.subtitle') }}
    </p>
    
    <div class="card">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">
            {{ $t('contact.name') }}
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-day-background dark:bg-night-background text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-day-primary dark:focus:ring-night-primary"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">
            {{ $t('contact.email') }}
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-day-background dark:bg-night-background text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-day-primary dark:focus:ring-night-primary"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">
            {{ $t('contact.message') }}
          </label>
          <textarea
            v-model="form.message"
            rows="5"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-day-background dark:bg-night-background text-day-text dark:text-night-text focus:outline-none focus:ring-2 focus:ring-day-primary dark:focus:ring-night-primary resize-none"
          ></textarea>
        </div>
        
        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary"
        >
          {{ loading ? 'Sending...' : $t('contact.send') }}
        </button>
        
        <div
          v-if="successMessage"
          class="p-4 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
        >
          {{ $t('contact.success') }}
        </div>
        
        <div
          v-if="errorMessage"
          class="p-4 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
        >
          {{ $t('contact.error') }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()

const form = reactive({
  name: '',
  email: '',
  message: ''
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    await axios.post('/api/contact', form)
    successMessage.value = t('contact.success')
    form.name = ''
    form.email = ''
    form.message = ''
  } catch (err) {
    errorMessage.value = t('contact.error')
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
