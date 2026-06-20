<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";
</script>

<template>
  <div class="skeleton-hero">
    <SkeletonBase class="skeleton--label" />
    <SkeletonBase class="skeleton-hero__title" />
    <SkeletonBase class="skeleton--line" />
    <SkeletonBase class="skeleton-hero__short" />
    <div class="skeleton-hero__actions">
      <SkeletonBase class="skeleton-hero__btn" />
      <SkeletonBase class="skeleton-hero__btn" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-block: var(--space-10);
}

.skeleton-hero__title {
  height: 2.5rem;
  width: 70%;
}

.skeleton-hero__short {
  height: 0.75rem;
  width: 60%;
}

.skeleton-hero__actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.skeleton-hero__btn {
  height: 2.5rem;
  width: 8rem;
  border-radius: var(--radius-md);
}
</style>
