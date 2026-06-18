<template>
  <div class="min-h-screen">
    <div class="pt-20 px-4 pb-12">
      <div class="max-w-4xl mx-auto">
        <!-- Back Link -->
        <router-link
          to="/tools"
          class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-day-primary dark:hover:text-night-primary mb-6 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t('common.backToTools') }}
        </router-link>

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-day-text dark:text-night-text mb-2">
            {{ $t('fileConverter.title') }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            {{ $t('fileConverter.subtitle') }}
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex flex-wrap justify-center gap-2 mb-8">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
            :class="activeTab === tab.key
              ? 'bg-day-primary dark:bg-night-primary text-white shadow-lg'
              : 'glass text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'"
            @click="switchTab(tab.key)"
          >
            {{ tab.icon }} {{ $t(tab.label) }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="card p-6 md:p-8">

          <!-- ====== IMAGE CONVERT ====== -->
          <div v-if="activeTab === 'image'">
            <div
              class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
              :class="dragOver
                ? 'border-day-primary dark:border-night-primary bg-day-primary/5'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="onImageDrop"
              @click="imageInputRef?.click()"
            >
              <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageSelect" />
              <div class="text-5xl mb-4">🖼️</div>
              <p class="text-gray-600 dark:text-gray-400 mb-2">{{ $t('fileConverter.dropImage') }}</p>
              <p class="text-sm text-gray-400 dark:text-gray-500">{{ $t('fileConverter.supportedImageFormats') }}</p>
            </div>

            <div v-if="sourceImage" class="mt-6">
              <div class="flex flex-col md:flex-row gap-6">
                <!-- Source Preview -->
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{{ $t('fileConverter.source') }}</p>
                  <div class="glass rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                    <img :src="sourceImage" class="max-h-[300px] max-w-full object-contain rounded" />
                  </div>
                  <p class="text-xs text-gray-400 mt-1 text-center">{{ sourceImageName }}</p>
                </div>

                <!-- Format Selection -->
                <div class="flex flex-col justify-center gap-3">
                  <p class="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">{{ $t('fileConverter.targetFormat') }}</p>
                  <div class="flex flex-wrap gap-2 justify-center">
                    <button
                      v-for="fmt in imageFormats"
                      :key="fmt.value"
                      class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      :class="targetFormat === fmt.value
                        ? 'bg-day-primary dark:bg-night-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                      @click="targetFormat = fmt.value"
                    >{{ fmt.label }}</button>
                  </div>
                  <button class="btn-primary py-2.5 px-6 mt-2" :disabled="imageConverting" @click="onConvertImage">
                    <span v-if="imageConverting" class="inline-flex items-center gap-2">
                      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {{ $t('fileConverter.converting') }}
                    </span>
                    <span v-else>{{ $t('fileConverter.convert') }}</span>
                  </button>
                </div>
              </div>

              <!-- Result -->
              <div v-if="imageResult" class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div class="flex items-center justify-between flex-wrap gap-4">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">✅</span>
                    <div>
                      <p class="font-medium text-green-800 dark:text-green-300">{{ $t('fileConverter.conversionComplete') }}</p>
                      <p class="text-sm text-green-600 dark:text-green-400">{{ imageResult.filename }} ({{ formatSize(imageResult.blob.size) }})</p>
                    </div>
                  </div>
                  <button class="btn-primary py-2 px-5" @click="downloadResult(imageResult)">{{ $t('fileConverter.download') }}</button>
                </div>
                <div v-if="targetFormat !== 'svg'" class="mt-3 flex justify-center">
                  <img :src="imageResult.url" class="max-h-[200px] rounded border border-green-200 dark:border-green-800" />
                </div>
              </div>
            </div>
          </div>

          <!-- ====== MD / WORD → PDF ====== -->
          <div v-if="activeTab === 'docPdf'">
            <div
              class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
              :class="dragOver ? 'border-day-primary dark:border-night-primary bg-day-primary/5' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="onDocDrop"
              @click="docInputRef?.click()"
            >
              <input ref="docInputRef" type="file" accept=".md,.markdown,.docx,.txt" class="hidden" @change="onDocSelect" />
              <div class="text-5xl mb-4">📝</div>
              <p class="text-gray-600 dark:text-gray-400 mb-2">{{ $t('fileConverter.dropDocument') }}</p>
              <p class="text-sm text-gray-400 dark:text-gray-500">{{ $t('fileConverter.supportedDocFormats') }}</p>
            </div>

            <div v-if="docSource" class="mt-6">
              <div class="flex items-center gap-3 p-3 glass rounded-lg mb-4">
                <span class="text-2xl">{{ docSource.ext === 'docx' ? '📘' : '📄' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-day-text dark:text-night-text truncate">{{ docSource.file.name }}</p>
                  <p class="text-xs text-gray-400">{{ docSource.ext.toUpperCase() }} · {{ formatSize(docSource.file.size) }}</p>
                </div>
                <button class="text-red-400 hover:text-red-500 text-sm" @click="docSource = null; docHtml = ''; docPdfResult = null">{{ $t('fileConverter.remove') }}</button>
              </div>

              <div v-if="docHtml" class="mb-4">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{{ $t('fileConverter.preview') }}</p>
                <div
                  class="glass rounded-lg p-4 max-h-64 overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
                  v-html="docHtml"
                />
              </div>

              <button class="btn-primary w-full py-2.5" :disabled="docConverting || !docHtml" @click="onDocToPdf">
                <span v-if="docConverting" class="inline-flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  {{ $t('fileConverter.converting') }}
                </span>
                <span v-else>{{ $t('fileConverter.convertToPdf') }}</span>
              </button>
            </div>

            <div v-if="docPdfResult" class="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div class="flex items-center justify-between flex-wrap gap-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">✅</span>
                  <div>
                    <p class="font-medium text-green-800 dark:text-green-300">{{ $t('fileConverter.pdfGenerated') }}</p>
                    <p class="text-sm text-green-600 dark:text-green-400">{{ docPdfResult.filename }} ({{ formatSize(docPdfResult.blob.size) }})</p>
                  </div>
                </div>
                <button class="btn-primary py-2 px-5" @click="downloadResult(docPdfResult)">{{ $t('fileConverter.download') }}</button>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            ⚠️ {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useImageConverter, type ConversionResult } from './composables/useImageConverter'
import { usePdfConverter } from './composables/usePdfConverter'
import { useDocumentParser } from './composables/useDocumentParser'

// Tabs
const activeTab = ref('image')
const tabs = [
  { key: 'image', label: 'fileConverter.tabImage', icon: '🖼️' },
  { key: 'docPdf', label: 'fileConverter.tabDocPdf', icon: '📝' },
]

const switchTab = (key: string) => {
  activeTab.value = key
  clearError()
  dragOver.value = false
}

// Shared
const dragOver = ref(false)
const errorMessage = ref('')

// Image Convert
const { converting: imageConverting, convertImage, imageToSvg } = useImageConverter()
const imageInputRef = ref<HTMLInputElement>()
const sourceImage = ref('')
const sourceImageName = ref('')
const targetFormat = ref<'png' | 'jpeg' | 'webp' | 'svg'>('png')
const imageResult = ref<ConversionResult | null>(null)
const imageFormats = [
  { value: 'png' as const, label: 'PNG' },
  { value: 'jpeg' as const, label: 'JPG' },
  { value: 'webp' as const, label: 'WebP' },
  { value: 'svg' as const, label: 'SVG' },
]

// Doc → PDF
const { convertToPdf } = usePdfConverter()
const { converting: docConverting, parseMarkdown, parseDocx } = useDocumentParser()
const docInputRef = ref<HTMLInputElement>()
const docSource = ref<{ file: File; ext: string } | null>(null)
const docHtml = ref('')
const docText = ref('')
const docPdfResult = ref<ConversionResult | null>(null)

// Helpers
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const downloadResult = (result: ConversionResult) => {
  const a = document.createElement('a')
  a.href = result.url
  a.download = result.filename
  a.click()
}

const clearError = () => { errorMessage.value = '' }

// Image Convert handlers
const onImageSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadSourceImage(file)
}

const onImageDrop = (e: DragEvent) => {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file?.type.startsWith('image/')) loadSourceImage(file)
}

const loadSourceImage = (file: File) => {
  clearError()
  sourceImage.value = URL.createObjectURL(file)
  sourceImageName.value = file.name
  imageResult.value = null
}

const blobToFile = async (url: string, name: string): Promise<File> => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type })
}

const onConvertImage = async () => {
  clearError()
  try {
    const file = await blobToFile(sourceImage.value, sourceImageName.value)
    if (targetFormat.value === 'svg') {
      imageResult.value = await imageToSvg(file)
    } else {
      imageResult.value = await convertImage(file, targetFormat.value)
    }
  } catch (e: any) {
    errorMessage.value = e.message
  }
}

// Doc → PDF handlers
const onDocSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadDoc(file)
}

const onDocDrop = (e: DragEvent) => {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) loadDoc(file)
}

const loadDoc = async (file: File) => {
  clearError()
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  if (!['md', 'markdown', 'docx', 'txt'].includes(ext)) {
    errorMessage.value = 'Unsupported file format. Please upload .md, .docx, or .txt files.'
    return
  }
  docSource.value = { file, ext }
  docHtml.value = ''
  docText.value = ''
  docPdfResult.value = null

  try {
    if (ext === 'docx') {
      const result = await parseDocx(file)
      docHtml.value = result.html
      docText.value = result.text
    } else {
      const result = await parseMarkdown(file)
      docHtml.value = result.html
      docText.value = result.text
    }
  } catch (e: any) {
    errorMessage.value = e.message
  }
}

const onDocToPdf = async () => {
  const sourceText = docText.value || docHtml.value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!sourceText) return
  clearError()
  try {
    const filename = (docSource.value?.file.name.replace(/\.[^.]+$/, '') || 'document') + '.pdf'
    docPdfResult.value = await convertToPdf(sourceText, filename)
  } catch (e: any) {
    errorMessage.value = e.message
  }
}
</script>
