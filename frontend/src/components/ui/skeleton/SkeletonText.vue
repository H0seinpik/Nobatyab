<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";

withDefaults(
  defineProps<{
    lines?: number;
    widths?: string[];
  }>(),
  { lines: 3, widths: () => ["100%", "80%", "60%"] },
);
</script>

<template>
  <div class="skeleton-text">
    <SkeletonBase
      v-for="i in lines"
      :key="i"
      class="skeleton--line"
      :style="{ width: widths[i - 1] ?? '100%' }"
    />
  </div>
</template>

<style scoped>
.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
