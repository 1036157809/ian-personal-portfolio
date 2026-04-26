<template>
  <div class="pt-20 px-4 pb-12">
    <div class="max-w-6xl mx-auto">
      <router-link
        to="/projects"
        class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-day-primary dark:hover:text-night-primary mb-6"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        {{ $t('common.backToProjects') }}
      </router-link>

      <h1 class="section-title text-center mb-8">航空地图演示</h1>

      <div class="card">
        <div class="mb-4">
          <h2 class="text-xl font-bold mb-2 text-day-text dark:text-night-text">技术说明</h2>
          <ul class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
            <li>使用 OpenLayers 库构建地图</li>
            <li>配置球面墨卡托投影 (EPSG:3857)</li>
            <li>使用天地图 WMTS 作为底图（地形层 + 注记层）</li>
            <li>中心坐标：北京 (116.4074, 39.9042)</li>
            <li>缩放级别：1-13</li>
          </ul>
        </div>

        <div id="map" class="w-full h-[600px] rounded-lg overflow-hidden"></div>

        <div class="mt-4 flex gap-4">
          <button @click="() => resetView(map, CENTER)" class="btn-primary px-4 py-2 rounded-lg text-sm">重置视图</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'ol/ol.css'
import { onMounted, onUnmounted } from 'vue'

// Import modules
import { createMap } from './utils/mapLayer'
import { 
  createAircraftSource, 
  createTrajectorySource, 
  createActiveSource, 
  createActiveLayer,
  initializeAircraft,
  addTrajectoryFromTracks,
  updateTrajectoryLine
} from './utils/planeLayer'
import { setupMapInteractions, resetView, setupSeamlessDragging } from './utils/event'

// Configuration constants
const TOKEN = 'f68bb17559b334a7ab0ff0e8f5642930'
const CENTER: [number, number] = [116.4074, 39.9042]

// State
let map: any = null
const aircraftSource = createAircraftSource()
const trajectorySource = createTrajectorySource()
const activeSource = createActiveSource()
const activeLayer = createActiveLayer(activeSource)

// Aircraft data
let simulatedAircraft: any[] = []
const aircraftFeatures = new Map()

// Active aircraft state
const activeAircraftId = { value: null as string | number | null }

// Trajectory data
let trajectoryPoints: number[][] = []
const allTrajectories = new Map()

// Initialize map
const initMap = async () => {
  // Create map
  map = createMap('map', aircraftSource, trajectorySource, activeLayer, TOKEN, CENTER)

  // Fetch aircraft data from OpenSky API
  try {
    const response = await fetch('http://localhost:3001/opensky/states')
    const data = await response.json()
    
    const aircraftData = data.states
      .map((state: any) => ({
        id: state.icao24,
        lon: state.lon,
        lat: state.lat,
        heading: state.heading,
        speed: (state.velocity || 0) / 3600,
        velocity: state.velocity || 0
      }))
    
    simulatedAircraft = aircraftData
  } catch (error) {
    console.error('Failed to fetch aircraft data from OpenSky:', error)
    simulatedAircraft = [
      { id: 1, lon: 116.4074, lat: 39.9042, heading: 45, speed: 0.01, velocity: 250 },
      { id: 2, lon: 121.4737, lat: 31.2304, heading: 270, speed: 0.015, velocity: 300 },
      { id: 3, lon: 113.2644, lat: 23.1291, heading: 0, speed: 0.012, velocity: 240 },
      { id: 4, lon: 104.0668, lat: 30.5728, heading: 90, speed: 0.008, velocity: 200 }
    ]
  }

  // Initialize aircraft
  initializeAircraft(simulatedAircraft, aircraftSource, aircraftFeatures)

  // Setup map interactions
  setupMapInteractions(map, activeSource, activeAircraftId, (aircraftId: number, path: number[][]) => {
    addTrajectoryFromTracks(aircraftId, path, trajectorySource, trajectoryPoints, allTrajectories, () => updateTrajectoryLine(trajectorySource, trajectoryPoints))
  })
  setupSeamlessDragging(map)
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined)
  }
})
</script>
