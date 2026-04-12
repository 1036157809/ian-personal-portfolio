<template>
  <div class="pt-20 max-w-6xl mx-auto px-4">
    <div class="mb-6">
      <router-link to="/projects" class="inline-flex items-center gap-2 text-day-primary dark:text-night-primary hover:underline">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ $t('tongdaoDemo.backToProjects') }}
      </router-link>
    </div>
    
    <h1 class="section-title text-center mb-8">{{ $t('tongdaoDemo.title') }}</h1>
    
    <!-- Player Radar Charts Section -->
    <div class="card mb-8">
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">{{ $t('tongdaoDemo.radarChartTitle') }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ $t('tongdaoDemo.radarChartDesc') }}</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlayerRadarChart
          v-for="player in displayedPlayers"
          :key="`${player.id}-${languageStore.currentLang}`"
          :playerName="player.displayName"
          :playerAvatar="player.avatar"
          :data="player.stats"
          :indicators="radarIndicators"
        />
      </div>
    </div>

    <!-- Shuttle Box Section -->
    <div class="card">
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">{{ $t('tongdaoDemo.playerSelection') }}</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ $t('tongdaoDemo.playerSelectionDesc') }}</p>
      
      <ShuttleBox
        :source-items="sourceItemsWithDisplay as any[]"
        :target-items="targetItemsWithDisplay as any[]"
        @update="handleUpdate as any"
      />
      
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2 text-day-text dark:text-night-text">{{ $t('tongdaoDemo.selectedPlayers') }}</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="player in targetPlayers"
            :key="player.id"
            class="px-3 py-1 rounded-full bg-day-primary/10 dark:bg-night-primary/10 text-day-primary dark:text-night-primary"
          >
            {{ player.flag }} {{ languageStore.currentLang === 'en' ? player.nameEn : player.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '../stores/language'
import PlayerRadarChart from '../components/PlayerRadarChart.vue'
import ShuttleBox from '../components/ShuttleBox.vue'

const { t } = useI18n()
const languageStore = useLanguageStore()

interface Player {
  id: number
  name: string
  nameEn: string
  flag: string
  avatar: string
  stats: number[]
}

const allPlayers = ref<Player[]>([
  { id: 1, name: '梅西', flag: '🇦🇷', nameEn: 'Messi', avatar: '/images/players/Messi.png', stats: [91, 89, 92, 95, 35, 94] },
  { id: 2, name: 'C罗', flag: '🇵🇹', nameEn: 'Cristiano Ronaldo', avatar: '/images/players/Cristiano Ronaldo.png', stats: [89, 94, 81, 87, 34, 90] },
  { id: 3, name: '内马尔', flag: '🇧🇷', nameEn: 'Neymar', avatar: '/images/players/Neymar.png', stats: [91, 85, 87, 94, 38, 88] },
  { id: 4, name: '姆巴佩', flag: '🇫🇷', nameEn: 'Kylian Mbappé', avatar: '/images/players/Kylian Mbappé.png', stats: [97, 90, 80, 92, 36, 85] },
  { id: 5, name: '哈兰德', flag: '🇳🇴', nameEn: 'Erling Haaland', avatar: '/images/players/Erling Haaland.png', stats: [89, 92, 75, 80, 45, 82] },
  { id: 6, name: '德布劳内', flag: '🇧🇪', nameEn: 'Kevin De Bruyne', avatar: '/images/players/Kevin De Bruyne.png', stats: [72, 85, 94, 87, 65, 91] },
  { id: 7, name: '莫德里奇', flag: '🇭🇷', nameEn: 'Luka Modrić', avatar: '/images/players/Luka Modric.png', stats: [74, 76, 91, 88, 68, 90] },
  { id: 8, name: '莱万多夫斯基', flag: '🇵🇱', nameEn: 'Robert Lewandowski', avatar: '/images/players/Robert Lewandowski.png', stats: [78, 91, 83, 82, 45, 85] },
  { id: 9, name: '萨拉赫', flag: '🇪🇬', nameEn: 'Mohamed Salah', avatar: '/images/players/Mohamed Salah.png', stats: [89, 87, 81, 90, 45, 86] },
  { id: 10, name: '武磊', flag: '🇨🇳', nameEn: 'Wu Lei', avatar: '/images/players/Wu Lei.png', stats: [85, 78, 74, 82, 42, 76] }
])

const sourcePlayers = ref<Player[]>([])
const targetPlayers = ref<Player[]>([])

// Computed properties for reactive language switching
const displayedPlayers = computed(() => {
  return [allPlayers.value[0], allPlayers.value[1], allPlayers.value[9]].map(player => ({
    ...player,
    displayName: `${player.flag} ${languageStore.currentLang === 'en' ? player.nameEn : player.name}`
  }))
})

const radarIndicators = computed(() => {
  return languageStore.currentLang === 'en' 
    ? ['Speed', 'Shooting', 'Passing', 'Dribbling', 'Defense', 'Awareness']
    : ['速度', '射门', '传球', '盘带', '防守', '意识']
})

const sourceItemsWithDisplay = computed(() => {
  return sourcePlayers.value.map(p => ({
    ...p,
    displayName: `${p.flag} ${languageStore.currentLang === 'en' ? p.nameEn : p.name}`
  }))
})

const targetItemsWithDisplay = computed(() => {
  return targetPlayers.value.map(p => ({
    ...p,
    displayName: `${p.flag} ${languageStore.currentLang === 'en' ? p.nameEn : p.name}`
  }))
})

// Initialize with Messi, Ronaldo, Wu Lei selected
const initializePlayers = () => {
  const defaultIds = [1, 2, 10] // Messi, Ronaldo, Wu Lei
  targetPlayers.value = allPlayers.value.filter(p => defaultIds.includes(p.id)) // 3 selected in target (right)
  sourcePlayers.value = allPlayers.value.filter(p => !defaultIds.includes(p.id)) // 7 remaining in source (left)
}

const handleUpdate = (source: Player[], target: Player[]) => {
  sourcePlayers.value = source
  targetPlayers.value = target
}

onMounted(() => {
  initializePlayers()
})
</script>
