<template>
  <div
    class="music-viz-page"
    :class="{ 'ui-hidden': !uiVisible }"
    @click="handlePageClick"
    @mousemove="handleMouseMove"
  >
    <!-- Background Wallpaper -->
    <div class="fixed inset-0 z-0">
      <img
        src="/wallpapers/car.jpg"
        alt="Background"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/30"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 pt-20 px-4 pb-12">
      <div class="max-w-6xl mx-auto">
        <router-link
          to="/projects"
          class="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-opacity duration-500"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          {{ $t('common.backToProjects') }}
        </router-link>

        <!-- Visualization Canvas with Controls -->
        <div class="relative">
          <canvas
            ref="canvasRef"
            class="w-full rounded-lg"
            :height="canvasHeight"
          ></canvas>

          <!-- Progress Bar below canvas -->
          <div ref="topProgressRef" class="mt-0.5 h-1 relative rounded overflow-visible bg-white/10">
            <div
              class="absolute inset-y-0 left-0 rounded bg-gradient-to-r from-white/10 via-white/40 to-white/70"
              :style="{ width: progressWidth }"
            ></div>
            <span
              class="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white"
              :style="{ left: progressDotLeft, boxShadow: '0 0 36px rgba(255,255,255,0.6), 0 0 48px rgba(0,0,0,0.35), 0 0 24px rgba(0,0,0,0.3)' }"
            ></span>
          </div>

        </div>

        <!-- Center info overlay when paused -->
        <div
          v-if="!isPlaying"
          ref="pauseOverlayRef"
          class="fixed bottom-[112px] flex flex-col items-center gap-2"
          :style="{ left: pauseOverlayLeft }"
        >
          <button
            @click="togglePlay"
            class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
          >
            <svg class="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <p class="text-white/60 text-xs text-center">{{ $t('musicViz.clickToPlay') }}</p>
        </div>
      </div>
    </div>

    <!-- Bottom Player Controller -->
    <div class="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-white/10 transition-all duration-500" :class="uiVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'" @click.stop>
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex items-center gap-6">
          <!-- Play Button -->
          <button
            @click="togglePlay"
            class="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0"
          >
            <svg v-if="!isPlaying" class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </button>

          <!-- Song Info -->
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium truncate">Sacred Play Secret Place</p>
          </div>

          <!-- Progress Bar -->
          <div class="flex items-center gap-3 flex-1">
            <span class="text-white/70 text-xs font-mono w-10 text-right">{{ formatTime(currentTime) }}</span>
            <div
              class="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer group relative"
              @click="seekTo"
              ref="progressRef"
            >
              <div
                class="h-full rounded-full relative"
                :class="isDarkMode ? 'bg-gradient-to-r from-night-primary to-night-secondary' : 'bg-gradient-to-r from-day-primary to-day-secondary'"
                :style="{ width: progress + '%' }"
              >
                <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <span class="text-white/70 text-xs font-mono w-10">{{ formatTime(duration) }}</span>
          </div>

          <!-- Volume -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <svg class="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path v-if="volume > 0" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              <path v-else d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.56-1.42 1.01-2.25 1.31v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="volume"
              @input="setVolume"
              class="w-20 accent-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      ref="audioRef"
      src="/audio/Sacred Play Secret Place.mp3"
      preload="auto"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    ></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useLanguageStore } from 'src/stores/language'

const languageStore = useLanguageStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)
const topProgressRef = ref<HTMLDivElement | null>(null)
const pauseOverlayRef = ref<HTMLDivElement | null>(null)

const canvasHeight = 400
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const progress = ref(0)
const uiVisible = ref(true)
const pauseOverlayLeft = ref('50%')

const progressWidth = computed(() => `${Math.min(Math.max(progress.value, 0), 100)}%`)
const progressDotLeft = computed(() => `calc(${Math.min(Math.max(progress.value, 0), 100)}% - 6px)`)

const isDarkMode = computed(() => document.documentElement.classList.contains('dark'))

const updatePauseOverlayPosition = () => {
  const bar = topProgressRef.value
  const overlay = pauseOverlayRef.value
  if (!bar || !overlay) return

  const barRect = bar.getBoundingClientRect()
  const overlayRect = overlay.getBoundingClientRect()
  const rightEdgeX = barRect.right
  const left = rightEdgeX - overlayRect.width / 2
  const clampedLeft = Math.max(0, Math.min(left, window.innerWidth - overlayRect.width))
  pauseOverlayLeft.value = `${clampedLeft}px`
}

watch(isPlaying, (value) => {
  if (!value) {
    nextTick(() => {
      updatePauseOverlayPosition()
    })
  }
})

let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let source: MediaElementAudioSourceNode | null = null
let animationId: number | null = null
let dataArray: Uint8Array<ArrayBuffer> = new Uint8Array(0) as Uint8Array<ArrayBuffer>
/** Last spectrum while playing; reused when paused so bars do not collapse to zero. */
let lastFrequencySnapshot: Uint8Array<ArrayBuffer> = new Uint8Array(0) as Uint8Array<ArrayBuffer>
let bufferLength = 0

const initAudioContext = () => {
  if (audioContext) return
  const audio = audioRef.value
  if (!audio) return

  audioContext = new AudioContext()
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 512
  bufferLength = analyser.frequencyBinCount
  dataArray = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>
  lastFrequencySnapshot = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>

  source = audioContext.createMediaElementSource(audio)
  source.connect(analyser)
  analyser.connect(audioContext.destination)
}

const togglePlay = async () => {
  const audio = audioRef.value
  if (!audio) return
  initAudioContext()

  if (audioContext?.state === 'suspended') {
    await audioContext.resume()
  }

  if (isPlaying.value) {
    // Freeze spectrum at pause; analyser often returns silence on the next frame.
    if (analyser && bufferLength) {
      analyser.getByteFrequencyData(dataArray)
      lastFrequencySnapshot.set(dataArray)
    }
    audio.pause()
    isPlaying.value = false
    // Keep the visualization running even when paused
    if (!animationId) {
      draw()
    }
  } else {
    await audio.play()
    isPlaying.value = true
    draw()
  }
}

const draw = () => {
  if (!analyser || !canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height

  animationId = requestAnimationFrame(draw)
  drawBars(ctx, width, height)
}

const drawBars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  analyser!.getByteFrequencyData(dataArray)
  if (isPlaying.value) {
    lastFrequencySnapshot.set(dataArray)
  }
  const spectrum = isPlaying.value ? dataArray : lastFrequencySnapshot

  ctx.clearRect(0, 0, width, height)

  const totalBarWidth = width
  const barGap = 0.5
  const barWidth = (totalBarWidth - barGap * (bufferLength - 1)) / bufferLength
  const radius = barWidth / 2
  let x = 0

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (spectrum[i] / 255) * height * 0.9

    // White transparent gradient
    const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)')

    ctx.fillStyle = gradient
    
    // Draw bar with rounded top
    if (ctx.roundRect) {
      ctx.beginPath()
      ctx.roundRect(x, height - barHeight, barWidth - barGap, barHeight, [radius, radius, 0, 0])
      ctx.fill()
    } else {
      // Fallback for browsers without roundRect support
      ctx.fillRect(x, height - barHeight, barWidth - barGap, barHeight)
      // Draw semi-circle at top
      ctx.beginPath()
      ctx.arc(x + (barWidth - barGap) / 2, height - barHeight, (barWidth - barGap) / 2, Math.PI, 0)
      ctx.fill()
    }

    x += barWidth + barGap
  }
}


const onTimeUpdate = () => {
  const audio = audioRef.value
  if (!audio) return
  currentTime.value = audio.currentTime
  if (duration.value > 0) {
    progress.value = (audio.currentTime / duration.value) * 100
  }
}

const onLoadedMetadata = () => {
  const audio = audioRef.value
  if (!audio) return
  duration.value = audio.duration
  audio.volume = volume.value
}

const onEnded = () => {
  isPlaying.value = false
  progress.value = 0
  currentTime.value = 0
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

const seekTo = (event: MouseEvent) => {
  const audio = audioRef.value
  const bar = progressRef.value
  if (!audio || !bar) return
  const rect = bar.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audio.currentTime = percent * duration.value
}

const setVolume = (event: Event) => {
  const val = parseFloat((event.target as HTMLInputElement).value)
  volume.value = val
  if (audioRef.value) {
    audioRef.value.volume = val
  }
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const resizeCanvas = () => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = canvasHeight * window.devicePixelRatio
  const ctx = canvas.getContext('2d')!
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
}

const handleResize = () => {
  resizeCanvas()
  updatePauseOverlayPosition()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    event.preventDefault()
    togglePlay()
  }
}

let idleTimer: ReturnType<typeof setTimeout> | null = null

const showUI = () => {
  uiVisible.value = true
  if (idleTimer) {
    clearTimeout(idleTimer)
  }
  idleTimer = setTimeout(() => {
    if (isPlaying.value) {
      uiVisible.value = false
    }
  }, 3000)
}

const handleMouseMove = () => {
  showUI()
}

const handlePageClick = () => {
  togglePlay()
}

onMounted(() => {
  nextTick(() => {
    resizeCanvas()
    updatePauseOverlayPosition()
    // Auto-play music when entering the demo
    togglePlay()
    // Start idle timer
    showUI()
  })
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (audioRef.value) {
    audioRef.value.pause()
  }
  if (audioContext) {
    audioContext.close()
  }
  if (idleTimer) {
    clearTimeout(idleTimer)
  }
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.music-viz-page {
  /* min-height: 100vh; */
  max-height: 100vh;
  cursor: default;
  overflow: hidden;
}

.music-viz-page.ui-hidden {
  cursor: none;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #818cf8;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #818cf8;
  cursor: pointer;
  border: none;
}
</style>
