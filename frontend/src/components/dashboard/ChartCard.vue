<script setup lang="ts">
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import SkeletonBase from "@/components/ui/skeleton/SkeletonBase.vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps<{
  title: string;
  labels: string[];
  data: number[];
  color?: string;
  loading?: boolean;
}>();

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      data: props.data,
      borderColor: props.color ?? "#006bff",
      backgroundColor: `${props.color ?? "#006bff"}20`,
      fill: true,
      tension: 0.3,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
    x: { grid: { display: false } },
  },
};
</script>

<template>
  <div class="chart-card">
    <h3 class="chart-card__title">{{ title }}</h3>
    <div v-if="loading" class="chart-card__skeleton">
      <SkeletonBase height="100%" />
    </div>
    <div v-else class="chart-card__canvas">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.chart-card__title {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--color-text);
}

.chart-card__canvas {
  height: 16rem;
}

.chart-card__skeleton {
  height: 16rem;
}
</style>
