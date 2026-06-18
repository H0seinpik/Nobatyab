<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";
import SkeletonText from "./SkeletonText.vue";
</script>

<template>
  <div class="skeleton-card">
    <SkeletonBase class="skeleton--media" />
    <SkeletonText :lines="2" :widths="['70%', '50%']" />
  </div>
</template>

<style scoped>
.skeleton-card {
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1rem;
}
</style>
