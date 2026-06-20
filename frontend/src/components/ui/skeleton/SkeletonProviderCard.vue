<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";
</script>

<template>
  <div class="skeleton-provider-card">
    <div class="skeleton-provider-card__header">
      <SkeletonBase class="skeleton-provider-card__avatar" />
      <div class="skeleton-provider-card__lines">
        <SkeletonBase class="skeleton--label" />
        <SkeletonBase class="skeleton--line" />
      </div>
    </div>
    <SkeletonBase class="skeleton--line" />
    <SkeletonBase class="skeleton--line skeleton-provider-card__short" />
  </div>
</template>

<style scoped>
.skeleton-provider-card {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-provider-card__header {
  display: flex;
  gap: var(--space-3);
}

.skeleton-provider-card__avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.skeleton-provider-card__lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-provider-card__short {
  width: 80%;
}
</style>
