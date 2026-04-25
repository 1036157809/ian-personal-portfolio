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
          <button @click="resetView" class="btn-primary px-4 py-2 rounded-lg text-sm">重置视图</button>
          <button @click="addMarker" class="btn-secondary px-4 py-2 rounded-lg text-sm">添加标记</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'ol/ol.css'
import { onMounted, onUnmounted } from 'vue'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Vector as VectorSource } from 'ol/source'
import { createAviationMap, CENTER } from './utils/mapCreator'

let map: ReturnType<typeof createAviationMap> | null = null
const vectorSource = new VectorSource()

const initMap = () => {
  map = createAviationMap({
    target: 'map',
    center: CENTER,
    zoom: 1,
    minZoom: 1,
    maxZoom: 13
  }, vectorSource)
}

const resetView = () => {
  if (map) {
    map.getView().setCenter(fromLonLat(CENTER))
    map.getView().setZoom(1)
  }
}

const addMarker = () => {
  const lon = 116.4074 + (Math.random() - 0.5) * 2
  const lat = 39.9042 + (Math.random() - 0.5) * 2
  const feature = new Feature({
    geometry: new Point(fromLonLat([lon, lat]))
  })
  vectorSource.addFeature(feature)
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined)
    map = null
  }
})
</script>
