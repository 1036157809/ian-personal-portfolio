<template>
  <div class="w-full flex flex-col items-center">
    <h3 class="text-lg font-semibold text-day-text dark:text-night-text mb-2">{{ props.playerName }}</h3>
    <img :src="props.playerAvatar" :alt="props.playerName" class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mb-4" />
    <div class="w-full h-80 min-h-80">
      <div ref="chartRef" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  playerName: string
  playerAvatar: string
  data: number[]
  indicators: string[]
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item'
    },
    radar: {
      indicator: props.indicators.map((name, index) => ({
        name,
        max: 100
      })),
      radius: '70%',
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(59, 130, 246, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(59, 130, 246, 0.3)'
        }
      }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: props.data,
            name: props.playerName,
            itemStyle: {
              color: '#3b82f6'
            },
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.3)'
            },
            lineStyle: {
              color: '#3b82f6',
              width: 2
            }
          }
        ]
      }
    ]
  }
  
  chart.setOption(option)
}

// Watch for prop changes and update chart
watch(() => [props.playerName, props.indicators], () => {
  if (chart) {
    const option = {
      radar: {
        indicator: props.indicators.map((name, index) => ({
          name,
          max: 100
        }))
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: props.data,
              name: props.playerName,
              itemStyle: {
                color: '#3b82f6'
              },
              areaStyle: {
                color: 'rgba(59, 130, 246, 0.3)'
              },
              lineStyle: {
                color: '#3b82f6',
                width: 2
              }
            }
          ]
        }
      ]
    }
    chart.setOption(option)
  }
}, { deep: true })

onMounted(() => {
  initChart()
  
  // Force resize after a short delay to ensure chart renders
  setTimeout(() => {
    chart?.resize()
  }, 100)
  
  window.addEventListener('resize', () => {
    chart?.resize()
  })
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => {
    chart?.resize()
  })
})
</script>
