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
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">球员能力</h2>
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

      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">热区图</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PlayerHeatmap
            v-for="player in displayedPlayers"
            :key="`heatmap-${player.id}-${languageStore.currentLang}`"
            :playerName="player.displayName"
            :playerAvatar="player.avatar"
            :data="player.heatmapData"
            :bestPositions="player.bestPositions"
          />
        </div>
      </div>
    </div>

    <!-- Shuttle Box Section -->
    <div class="card mb-8">
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

    <!-- Video Capture & Playback Section -->
    <div class="card">
      <h2 class="text-2xl font-bold mb-6 text-day-text dark:text-night-text">视频截取回放</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">支持足球视频的截取与回放功能演示</p>
      
      <div class="space-y-4">
        <!-- Video Upload -->
        <div>
          <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">上传视频</label>
          <input
            ref="videoInputRef"
            type="file"
            accept="video/*"
            @change="handleVideoUpload"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-day-text dark:text-night-text file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-day-primary file:text-white dark:file:bg-night-primary dark:file:text-white hover:file:bg-day-primary/90 dark:hover:file:bg-night-primary/90 cursor-pointer"
          />
        </div>

        <!-- Video Player with Capture Controls -->
        <div v-if="videoUrl" class="space-y-4">
          <video
            ref="videoRef"
            :src="videoUrl"
            class="w-full rounded-lg"
            controls
            @loadedmetadata="onVideoLoaded"
          ></video>

          <!-- Capture Controls -->
          <div class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-64">
              <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">开始时间 (秒)</label>
              <input
                v-model.number="startTime"
                type="number"
                min="0"
                :max="videoDuration"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-day-text dark:text-night-text"
              />
            </div>
            <div class="flex-1 min-w-64">
              <label class="block text-sm font-medium mb-2 text-day-text dark:text-night-text">结束时间 (秒)</label>
              <input
                v-model.number="endTime"
                type="number"
                min="0"
                :max="videoDuration"
                step="0.1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-day-text dark:text-night-text"
              />
            </div>
            <div class="flex items-end">
              <button
                @click="captureSegment"
                class="px-6 py-2 bg-day-primary text-white dark:bg-night-primary rounded-lg hover:opacity-90 transition-opacity"
              >
                截取片段
              </button>
            </div>
          </div>

          <!-- Captured Segments List -->
          <div v-if="capturedSegments.length > 0">
            <h3 class="text-lg font-semibold mb-3 text-day-text dark:text-night-text">已截取片段</h3>
            <div class="space-y-2">
              <div
                v-for="(segment, index) in capturedSegments"
                :key="index"
                class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <span class="text-sm text-day-text dark:text-night-text">
                  片段 {{ index + 1 }}: {{ segment.start.toFixed(1) }}s - {{ segment.end.toFixed(1) }}s
                </span>
                <div class="flex gap-2">
                  <button
                    @click="playSegment(segment)"
                    class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    回放
                  </button>
                  <button
                    @click="deleteSegment(index)"
                    class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
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
import PlayerHeatmap from '../components/PlayerHeatmap.vue'
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
  heatmapData: number[][]
  bestPositions: {x: number, y: number}[]
}

interface VideoSegment {
  start: number
  end: number
}

// Generate position-based heatmap data (6x9 grid for 68x105 vertical field)
const generateHeatmapData = (bestPositions: {x: number, y: number}[]) => {
  const data = []
  // Add high values at best positions
  bestPositions.forEach(pos => {
    data.push([pos.x, pos.y, 90 + Math.random() * 10])
    // Add surrounding positions with lower values
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx !== 0 || dy !== 0) {
          const nx = pos.x + dx
          const ny = pos.y + dy
          if (nx >= 0 && nx < 6 && ny >= 0 && ny < 9) {
            data.push([nx, ny, 40 + Math.random() * 30])
          }
        }
      }
    }
  })
  // Add some random low values elsewhere
  while (data.length < 54) {
    data.push([
      Math.floor(Math.random() * 6),
      Math.floor(Math.random() * 9),
      Math.random() * 20
    ])
  }
  return data
}

const allPlayers = ref<Player[]>([
  { id: 1, name: '梅西', flag: '🇦🇷', nameEn: 'Messi', avatar: '/images/players/Messi.png', stats: [91, 89, 92, 95, 35, 94], heatmapData: generateHeatmapData([{x: 2, y: 6}, {x: 3, y: 5}]), bestPositions: [{x: 2, y: 6}] },
  { id: 2, name: 'C罗', flag: '🇵🇹', nameEn: 'Cristiano Ronaldo', avatar: '/images/players/Cristiano Ronaldo.png', stats: [89, 94, 81, 87, 34, 90], heatmapData: generateHeatmapData([{x: 2, y: 5}, {x: 3, y: 7}, {x: 0, y: 6}]), bestPositions: [{x: 2, y: 5}, {x: 3, y: 7}, {x: 0, y: 6}] },
  { id: 3, name: '内马尔', flag: '🇧🇷', nameEn: 'Neymar', avatar: '/images/players/Neymar.png', stats: [91, 85, 87, 94, 38, 88], heatmapData: generateHeatmapData([{x: 2, y: 5}, {x: 3, y: 4}]), bestPositions: [{x: 2, y: 5}] },
  { id: 4, name: '姆巴佩', flag: '🇫🇷', nameEn: 'Kylian Mbappé', avatar: '/images/players/Kylian Mbappé.png', stats: [97, 90, 80, 92, 36, 85], heatmapData: generateHeatmapData([{x: 2, y: 7}, {x: 3, y: 6}]), bestPositions: [{x: 2, y: 7}] },
  { id: 5, name: '哈兰德', flag: '🇳🇴', nameEn: 'Erling Haaland', avatar: '/images/players/Erling Haaland.png', stats: [89, 92, 75, 80, 45, 82], heatmapData: generateHeatmapData([{x: 2, y: 7}, {x: 3, y: 7}]), bestPositions: [{x: 2, y: 7}] },
  { id: 6, name: '德布劳内', flag: '🇧🇪', nameEn: 'Kevin De Bruyne', avatar: '/images/players/Kevin De Bruyne.png', stats: [72, 85, 94, 87, 65, 91], heatmapData: generateHeatmapData([{x: 2, y: 4}, {x: 3, y: 4}]), bestPositions: [{x: 2, y: 4}] },
  { id: 7, name: '莫德里奇', flag: '🇭🇷', nameEn: 'Luka Modrić', avatar: '/images/players/Luka Modric.png', stats: [74, 76, 91, 88, 68, 90], heatmapData: generateHeatmapData([{x: 2, y: 4}, {x: 3, y: 4}]), bestPositions: [{x: 2, y: 4}] },
  { id: 8, name: '莱万多夫斯基', flag: '🇵🇱', nameEn: 'Robert Lewandowski', avatar: '/images/players/Robert Lewandowski.png', stats: [78, 91, 83, 82, 45, 85], heatmapData: generateHeatmapData([{x: 2, y: 7}, {x: 3, y: 7}]), bestPositions: [{x: 2, y: 7}] },
  { id: 9, name: '萨拉赫', flag: '🇪🇬', nameEn: 'Mohamed Salah', avatar: '/images/players/Mohamed Salah.png', stats: [89, 87, 81, 90, 45, 86], heatmapData: generateHeatmapData([{x: 2, y: 6}, {x: 3, y: 5}]), bestPositions: [{x: 2, y: 6}] },
  { id: 10, name: '武磊', flag: '🇨🇳', nameEn: 'Wu Lei', avatar: '/images/players/Wu Lei.png', stats: [85, 78, 74, 82, 42, 76], heatmapData: generateHeatmapData([{x: 2, y: 7}, {x: 3, y: 6}]), bestPositions: [{x: 2, y: 7}] }
])

const sourcePlayers = ref<Player[]>([])
const targetPlayers = ref<Player[]>([])

// Video capture state
const videoInputRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const videoUrl = ref<string>('')
const videoDuration = ref<number>(0)
const startTime = ref<number>(0)
const endTime = ref<number>(0)
const capturedSegments = ref<VideoSegment[]>([])

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

// Video capture functions
const handleVideoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const url = URL.createObjectURL(file)
    videoUrl.value = url
    capturedSegments.value = []
    startTime.value = 0
    endTime.value = 0
  }
}

const onVideoLoaded = () => {
  if (videoRef.value) {
    videoDuration.value = videoRef.value.duration
    endTime.value = videoDuration.value
  }
}

const captureSegment = () => {
  if (startTime.value >= endTime.value) {
    alert('开始时间必须小于结束时间')
    return
  }
  
  capturedSegments.value.push({
    start: startTime.value,
    end: endTime.value
  })
}

const playSegment = (segment: VideoSegment) => {
  if (videoRef.value) {
    videoRef.value.currentTime = segment.start
    videoRef.value.play()
    
    const checkTime = () => {
      if (videoRef.value && videoRef.value.currentTime >= segment.end) {
        videoRef.value.pause()
        videoRef.value.removeEventListener('timeupdate', checkTime)
      }
    }
    
    videoRef.value.addEventListener('timeupdate', checkTime)
  }
}

const deleteSegment = (index: number) => {
  capturedSegments.value.splice(index, 1)
}

onMounted(() => {
  initializePlayers()
})
</script>
