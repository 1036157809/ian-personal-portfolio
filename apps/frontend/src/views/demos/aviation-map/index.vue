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

      <h1 class="section-title text-center mb-8">{{ $t('projects.aviationMap.title') }}</h1>

      <div class="card">
        <div
          id="map"
          ref="mapRef"
          class="w-full h-[600px] rounded-lg overflow-hidden"
        ></div>

        <div class="mt-4 flex gap-4">
          <button
            class="btn-primary px-4 py-2 rounded-lg text-sm"
            @click="() => resetView()"
          >
            {{ $t('projects.aviationMap.resetView') }}
          </button>
          <button
            class="btn-primary px-4 py-2 rounded-lg text-sm"
            @click="handleToggleMode"
          >
            {{ dataMode === 'cache' ? $t('projects.aviationMap.switchToRemote') : $t('projects.aviationMap.switchToCache') }}
          </button>
        </div>
      </div>

      <div class="card mt-6">
        <div>
          <h2 class="text-xl font-bold mb-4 text-day-text dark:text-night-text">
            {{ $t('projects.aviationMap.techTitle') }}
          </h2>
          
          <!-- 设计思路 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-day-text dark:text-night-text flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm">1</span>
              {{ $t('projects.aviationMap.designTitle') }}
            </h3>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 ml-8">
              <p class="flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span><strong>{{ $t('projects.aviationMap.design1') }}</strong>：{{ $t('projects.aviationMap.design1Desc') }}</span>
              </p>
              <p class="flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span><strong>{{ $t('projects.aviationMap.design2') }}</strong>：{{ $t('projects.aviationMap.design2Desc') }}</span>
              </p>
              <p class="flex items-start gap-2">
                <span class="text-blue-500 mt-1">▸</span>
                <span><strong>{{ $t('projects.aviationMap.design3') }}</strong>：{{ $t('projects.aviationMap.design3Desc') }}</span>
              </p>
            </div>
          </div>

          <!-- 技术难点 -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3 text-day-text dark:text-night-text flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-sm">2</span>
              {{ $t('projects.aviationMap.challengesTitle') }}
            </h3>
            <div class="space-y-3 text-sm text-gray-600 dark:text-gray-400 ml-8">
              <div class="glass rounded-lg p-3">
                <p class="font-medium text-day-text dark:text-night-text mb-1">{{ $t('projects.aviationMap.challenge1Title') }}</p>
                <p>{{ $t('projects.aviationMap.challenge1Desc') }}</p>
              </div>
              <div class="glass rounded-lg p-3">
                <p class="font-medium text-day-text dark:text-night-text mb-1">{{ $t('projects.aviationMap.challenge2Title') }}</p>
                <p>{{ $t('projects.aviationMap.challenge2Desc') }}</p>
              </div>
              <div class="glass rounded-lg p-3">
                <p class="font-medium text-day-text dark:text-night-text mb-1">{{ $t('projects.aviationMap.challenge3Title') }}</p>
                <p>{{ $t('projects.aviationMap.challenge3Desc') }}</p>
              </div>
            </div>
          </div>

          <!-- 解决方案 -->
          <div>
            <h3 class="text-lg font-semibold mb-3 text-day-text dark:text-night-text flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm">3</span>
              {{ $t('projects.aviationMap.solutionsTitle') }}
            </h3>
            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400 ml-8">
              <p class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span><strong>{{ $t('projects.aviationMap.solution1Title') }}</strong>：{{ $t('projects.aviationMap.solution1Desc') }}</span>
              </p>
              <p class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span><strong>{{ $t('projects.aviationMap.solution2Title') }}</strong>：{{ $t('projects.aviationMap.solution2Desc') }}</span>
              </p>
              <p class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span><strong>{{ $t('projects.aviationMap.solution3Title') }}</strong>：{{ $t('projects.aviationMap.solution3Desc') }}</span>
              </p>
              <p class="flex items-start gap-2">
                <span class="text-green-500 mt-1">✓</span>
                <span><strong>{{ $t('projects.aviationMap.solution4Title') }}</strong>：{{ $t('projects.aviationMap.solution4Desc') }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { initMap, destroyMap, resetView, setToast, getDataMode, switchDataMode, checkNetworkQuality } from ".";
import Toast from "src/components/common/toast/index.vue";

const mapRef = useTemplateRef<HTMLElement>("mapRef");
const toastRef = useTemplateRef<{ show: (_message: string) => void }>("toastRef");
const dataMode = ref<"cache" | "remote">("cache");

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

/**
 * 处理数据模式切换按钮点击
 */
const handleToggleMode = async () => {
  const current = getDataMode();
  if (current === "cache") {
    // cache → remote：先做网络检测
    const quality = await checkNetworkQuality();
    if (quality === "weak") {
      // 弱网提示后直接切换
      toastRef.value?.show("当前网络不佳，切换到真实数据可能失败");
      switchDataMode("remote");
      dataMode.value = "remote";
    } else {
      switchDataMode("remote");
      dataMode.value = "remote";
    }
  } else {
    // remote → cache：直接切，无提示
    switchDataMode("cache");
    dataMode.value = "cache";
  }
};
</script>
