<template>
  <div class="flex gap-4 items-start">
    <!-- Source Box -->
    <div class="flex-1 border rounded-lg p-4 bg-white dark:bg-gray-800 h-80 flex flex-col">
      <div class="mb-3 flex items-center gap-2">
        <input
          v-model="sourceSearch"
          type="text"
          :placeholder="$t('shuttleBox.search')"
          class="flex-1 px-3 py-2 border rounded text-sm text-black"
        />
        <button
          @click="selectAllSource"
          class="px-3 py-2 btn-primary min-w-16 text-sm"
        >
          {{ $t('shuttleBox.selectAll') }}
        </button>
      </div>
      <div class="flex-1 overflow-y-auto space-y-1">
        <div
          v-for="item in filteredSourceItems"
          :key="item.id"
          class="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          @click="toggleSourceSelection(item.id)"
        >
          <input
            type="checkbox"
            :checked="selectedSourceIds.includes(item.id)"
            class="rounded"
          />
          <span class="text-sm day-text dark:night-text">{{ item.displayName || item.name }}</span>
        </div>
        <div v-if="filteredSourceItems.length === 0" class="text-center text-gray-500 py-8">
          {{ $t('shuttleBox.noResults') }}
        </div>
      </div>
    </div>

    <!-- Transfer Buttons -->
    <div class="flex flex-col gap-2 pt-8">
      <button
        @click="moveToTarget"
        :disabled="selectedSourceIds.length === 0"
        class="px-4 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        →
      </button>
      <button
        @click="moveToSource"
        :disabled="selectedTargetIds.length === 0"
        class="px-4 py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ←
      </button>
    </div>

    <!-- Target Box -->
    <div class="flex-1 border rounded-lg p-4 bg-white dark:bg-gray-800 h-80 flex flex-col">
      <div class="mb-3 flex items-center gap-2">
        <input
          v-model="targetSearch"
          type="text"
          :placeholder="$t('shuttleBox.search')"
          class="flex-1 px-3 py-2 border rounded text-sm text-black"
        />
        <button
          @click="selectAllTarget"
          class="px-3 py-2 btn-primary min-w-16 text-sm"
        >
          {{ $t('shuttleBox.selectAll') }}
        </button>
      </div>
      <div class="flex-1 overflow-y-auto space-y-1">
        <div
          v-for="item in filteredTargetItems"
          :key="item.id"
          class="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
          @click="toggleTargetSelection(item.id)"
        >
          <input
            type="checkbox"
            :checked="selectedTargetIds.includes(item.id)"
            class="rounded"
          />
          <span class="text-sm day-text dark:night-text">{{ item.displayName || item.name }}</span>
        </div>
        <div v-if="filteredTargetItems.length === 0" class="text-center text-gray-500 py-8">
          {{ $t('shuttleBox.noResults') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Item {
  id: number
  name: string
  displayName?: string
  flag?: string
  avatar?: string
  stats?: number[]
}

const props = defineProps<{
  sourceItems: Item[]
  targetItems: Item[]
}>()

const emit = defineEmits<{
  update: [source: Item[], target: Item[]]
}>()

const sourceItems = ref<Item[]>([...props.sourceItems])
const targetItems = ref<Item[]>([...props.targetItems])
const selectedSourceIds = ref<number[]>([])
const selectedTargetIds = ref<number[]>([])
const sourceSearch = ref('')
const targetSearch = ref('')

// Sync with props when they change
watch(() => props.sourceItems, (newVal) => {
  sourceItems.value = [...newVal]
}, { deep: true })

watch(() => props.targetItems, (newVal) => {
  targetItems.value = [...newVal]
}, { deep: true })

const filteredSourceItems = computed(() => {
  return sourceItems.value.filter(item =>
    (item.displayName || item.name).toLowerCase().includes(sourceSearch.value.toLowerCase())
  )
})

const filteredTargetItems = computed(() => {
  return targetItems.value.filter(item =>
    (item.displayName || item.name).toLowerCase().includes(targetSearch.value.toLowerCase())
  )
})

const toggleSourceSelection = (id: number) => {
  const index = selectedSourceIds.value.indexOf(id)
  if (index > -1) {
    selectedSourceIds.value.splice(index, 1)
  } else {
    selectedSourceIds.value.push(id)
  }
}

const toggleTargetSelection = (id: number) => {
  const index = selectedTargetIds.value.indexOf(id)
  if (index > -1) {
    selectedTargetIds.value.splice(index, 1)
  } else {
    selectedTargetIds.value.push(id)
  }
}

const selectAllSource = () => {
  selectedSourceIds.value = filteredSourceItems.value.map(item => item.id)
}

const selectAllTarget = () => {
  selectedTargetIds.value = filteredTargetItems.value.map(item => item.id)
}

const moveToTarget = () => {
  const itemsToMove = sourceItems.value.filter(item =>
    selectedSourceIds.value.includes(item.id)
  )
  sourceItems.value = sourceItems.value.filter(item =>
    !selectedSourceIds.value.includes(item.id)
  )
  targetItems.value = [...targetItems.value, ...itemsToMove]
  selectedSourceIds.value = []
  emit('update', sourceItems.value, targetItems.value)
}

const moveToSource = () => {
  const itemsToMove = targetItems.value.filter(item =>
    selectedTargetIds.value.includes(item.id)
  )
  targetItems.value = targetItems.value.filter(item =>
    !selectedTargetIds.value.includes(item.id)
  )
  sourceItems.value = [...sourceItems.value, ...itemsToMove]
  selectedTargetIds.value = []
  emit('update', sourceItems.value, targetItems.value)
}
</script>
