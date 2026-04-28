<template>
  <div class="pt-20 px-4 pb-12">
    <div class="max-w-6xl mx-auto">
      <router-link
        to="/projects"
        class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-day-primary dark:hover:text-night-primary mb-6"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        {{ $t("common.backToProjects") }}
      </router-link>

      <h1 class="section-title text-center mb-8">航空地图演示</h1>

      <div class="card">
        <div
          id="map"
          ref="mapRef"
          class="w-full h-[600px] rounded-lg overflow-hidden"
        ></div>

        <div class="mt-4 flex gap-4">
          <button
            @click="() => resetView()"
            class="btn-primary px-4 py-2 rounded-lg text-sm"
          >
            重置视图
          </button>
        </div>
      </div>

      <div class="card mt-6">
        <div>
          <h2 class="text-xl font-bold mb-2 text-day-text dark:text-night-text">
            技术说明
          </h2>
          <ul
            class="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1"
          >
            <li>使用 OpenLayers 库构建地图</li>
            <li>配置球面墨卡托投影 (EPSG:3857)</li>
            <li>使用天地图 WMTS 作为底图（地形层 + 注记层）</li>
            <li>中心坐标：北京 (116.4074, 39.9042)</li>
            <li>缩放级别：1-13</li>
          </ul>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { initMap, destroyMap, resetView, setToast } from ".";
import Toast from "src/components/common/toast/index.vue";

const mapRef = useTemplateRef<HTMLElement>("mapRef");
const toastRef = useTemplateRef<{ show: (message: string) => void }>("toastRef");

onMounted(() => {
  if (mapRef.value) {
    initMap(mapRef.value);
  }
  if (toastRef.value) {
    setToast(toastRef.value);
  }
});

onUnmounted(() => {
  destroyMap();
});
</script>
