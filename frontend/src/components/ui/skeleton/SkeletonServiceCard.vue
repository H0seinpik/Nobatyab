<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";
</script>

<template>
  <div class="skeleton-service-card">
    <SkeletonBase class="skeleton--label" />
    <SkeletonBase class="skeleton-service-card__title" />
    <SkeletonBase class="skeleton--line" />
    <SkeletonBase class="skeleton--line skeleton-service-card__short" />
    <div class="skeleton-service-card__meta">
      <SkeletonBase class="skeleton--line skeleton-service-card__price" />
      <SkeletonBase class="skeleton--line skeleton-service-card__duration" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-service-card {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-service-card__title {
  height: 1.25rem;
  width: 70%;
}

.skeleton-service-card__short {
  width: 85%;
}

.skeleton-service-card__meta {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-subtle);
}

.skeleton-service-card__price {
  width: 30%;
}

.skeleton-service-card__duration {
  width: 25%;
}
</style>
