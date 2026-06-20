<script setup lang="ts">
import type { Component } from "vue";
import { TrendingUp, TrendingDown } from "lucide-vue-next";

defineProps<{
  label: string;
  value: string | number;
  icon?: Component;
  trend?: number;
  loading?: boolean;
}>();
</script>

<template>
  <div class="dashboard-stat-card">
    <div class="dashboard-stat-card__header">
      <span class="dashboard-stat-card__label">{{ label }}</span>
      <component :is="icon" v-if="icon" :size="20" class="dashboard-stat-card__icon" />
    </div>
    <p v-if="loading" class="dashboard-stat-card__value dashboard-stat-card__value--loading">
      —
    </p>
    <p v-else class="dashboard-stat-card__value">{{ value }}</p>
    <p v-if="trend != null && !loading" class="dashboard-stat-card__trend">
      <TrendingUp v-if="trend >= 0" :size="14" />
      <TrendingDown v-else :size="14" />
      {{ Math.abs(trend) }}%
    </p>
  </div>
</template>

<style scoped>
.dashboard-stat-card {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.dashboard-stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.dashboard-stat-card__label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  font-weight: 500;
}

.dashboard-stat-card__icon {
  color: var(--color-primary);
}

.dashboard-stat-card__value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.dashboard-stat-card__value--loading {
  opacity: 0.4;
}

.dashboard-stat-card__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-success);
}
</style>
