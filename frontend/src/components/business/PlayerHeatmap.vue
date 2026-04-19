<template>
  <div class="w-full h-80 min-h-80 relative flex items-center justify-center">
    <!-- Football Field Background (Vertical/Portrait) -->
    <div class="relative" style="aspect-ratio: 68/105; max-height: 100%">
      <svg
        viewBox="0 0 68 105"
        class="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Field -->
        <rect
          x="0"
          y="0"
          width="68"
          height="105"
          fill="#2d5a27"
          stroke="#ffffff"
          stroke-width="1"
        />

        <!-- Center line -->
        <line
          x1="0"
          y1="52.5"
          x2="68"
          y2="52.5"
          stroke="#ffffff"
          stroke-width="1"
        />

        <!-- Center circle -->
        <circle
          cx="34"
          cy="52.5"
          r="9.15"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
        />
        <circle cx="34" cy="52.5" r="0.5" fill="#ffffff" />

        <!-- Top goal area (front) -->
        <rect
          x="13.84"
          y="0"
          width="40.32"
          height="16.5"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
        />
        <rect
          x="24.84"
          y="0"
          width="18.32"
          height="5.5"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
        />
        <rect x="30.34" y="-1" width="7.32" height="1" fill="#ffffff" />

        <!-- Bottom goal area -->
        <rect
          x="13.84"
          y="88.5"
          width="40.32"
          height="16.5"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
        />
        <rect
          x="24.84"
          y="99.5"
          width="18.32"
          height="5.5"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
        />
        <rect x="30.34" y="105" width="7.32" height="1" fill="#ffffff" />

        <!-- Penalty arcs -->
        <path
          d="M 34 16.5 A 9.15 9.15 0 0 1 24.84 16.5"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
        />
        <path
          d="M 34 88.5 A 9.15 9.15 0 0 0 43.16 88.5"
          fill="none"
          stroke="#ffffff"
          stroke-width="1"
        />
      </svg>

      <!-- Heatmap Overlay -->
      <div ref="chartRef" class="absolute inset-0"></div>

      <!-- Player Avatars at Best Positions -->
      <div
        v-for="(pos, index) in bestPositions"
        :key="index"
        class="absolute w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden z-10"
        :style="{
          left: `${((pos.x + 0.5) / 6) * 100}%`,
          top: `${((pos.y + 0.5) / 9) * 100}%`,
          transform: 'translate(-50%, -50%)',
        }"
      >
        <img
          :src="playerAvatar"
          :alt="playerName"
          class="w-full h-full object-cover"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps<{
  playerName: string;
  playerAvatar: string;
  data: number[][];
  bestPositions: { x: number; y: number }[];
}>();

const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const initChart = () => {
  if (!chartRef.value) return;

  chart = echarts.init(chartRef.value);

  // Generate heatmap data with field positions (6x9 grid)
  // Limit to upper half of field (y: 0-4) for forwards
  const data = props.data
    .map((item, index) => {
      const x = index % 6; // 0 to 5 (6 categories for x)
      const y = Math.floor(index / 6); // 0 to 8 (9 categories for y)
      return [x, y, item[2] || Math.random() * 100];
    })
    .filter(([, y]) => {
      if (props.playerName === "武磊") {
        return y < 2;
      }
      if (props.playerName === "梅西") {
        return y < 3;
      }
      return y < 4;
    });

  const option = {
    tooltip: {
      position: "top",
      formatter: (params: any) => {
        return `X: ${params.data[0]}<br/>Y: ${params.data[1]}<br/>Value: ${params.data[2].toFixed(2)}`;
      },
    },
    grid: {
      left: "0%",
      right: "0%",
      top: "0%",
      bottom: "0%",
    },
    xAxis: {
      type: "category",
      data: Array.from({ length: 6 }, (_, i) => i),
      show: false,
    },
    yAxis: {
      type: "category",
      data: Array.from({ length: 9 }, (_, i) => i),
      show: false,
    },
    visualMap: {
      min: 0,
      max: 100,
      show: false,
      inRange: {
        color: [
          "rgba(255, 255, 128, 0.1)",
          "rgba(255, 255, 128, 0.25)",
          "rgba(255, 255, 128, 0.4)",
        ],
      },
    },
    series: [
      {
        name: props.playerName,
        type: "heatmap",
        data: data,
        itemSize: 20,
        blur: 25,
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  chart.setOption(option);
};

// Watch for prop changes and update chart
watch(
  () => [props.playerName, props.data],
  () => {
    if (chart) {
      const data = props.data
        .map((item, index) => {
          const x = index % 6;
          const y = Math.floor(index / 6);
          return [x, y, item[2] || Math.random() * 100];
        })
        .filter(([, y]) => {
          if (props.playerName.includes("武磊")) {
            return y <= 2;
          }
          if (props.playerName.includes("梅西")) {
            return y <= 3;
          }
          if (props.playerName.includes("C罗")) {
            return y <= 4;
          }
          return y < 4;
        });

      chart.setOption({
        series: [
          {
            data: data,
          },
        ],
      });
    }
  },
  { deep: true },
);

onMounted(() => {
  initChart();

  setTimeout(() => {
    chart?.resize();
  }, 100);

  // Use ResizeObserver for more reliable container size detection
  const resizeObserver = new ResizeObserver(() => {
    chart?.resize();
  });

  if (chartRef.value) {
    resizeObserver.observe(chartRef.value);
  }

  // Cleanup on unmount
  onUnmounted(() => {
    resizeObserver.disconnect();
    chart?.dispose();
  });
});
</script>
