<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";
</script>

<template>
  <div class="skeleton-chart">
    <SkeletonBase class="skeleton-chart__title" />
    <SkeletonBase class="skeleton-chart__body" />
  </div>
</template>

<style scoped>
.skeleton-chart {
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.skeleton-chart__title {
  height: 1rem;
  width: 40%;
  margin-bottom: var(--space-4);
}

.skeleton-chart__body {
  height: 16rem;
  width: 100%;
}
</style>
