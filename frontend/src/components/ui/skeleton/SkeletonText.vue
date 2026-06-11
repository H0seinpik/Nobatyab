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
  <div class="space-y-2">
    <SkeletonBase
      v-for="i in lines"
      :key="i"
      class="h-3"
      :style="{ width: widths[i - 1] ?? '100%' }"
    />
  </div>
</template>
