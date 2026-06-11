<script setup lang="ts">
import SkeletonBase from "./SkeletonBase.vue";

withDefaults(
  defineProps<{
    columns?: number;
    rows?: number;
    showCheckbox?: boolean;
    showActions?: boolean;
  }>(),
  { columns: 5, rows: 8, showCheckbox: false, showActions: true },
);
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-[var(--color-border)]">
    <div class="flex gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <SkeletonBase v-if="showCheckbox" class="h-4 w-4 shrink-0" />
      <SkeletonBase
        v-for="c in columns"
        :key="`h-${c}`"
        class="h-4 flex-1"
        :style="{ maxWidth: c === columns ? '80px' : undefined }"
      />
      <SkeletonBase v-if="showActions" class="h-4 w-8 shrink-0" />
    </div>
    <div
      v-for="r in rows"
      :key="r"
      class="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-4 last:border-0"
    >
      <SkeletonBase v-if="showCheckbox" class="h-4 w-4 shrink-0" />
      <SkeletonBase v-for="c in columns" :key="`r-${r}-${c}`" class="h-3 flex-1" />
      <SkeletonBase v-if="showActions" class="h-6 w-6 shrink-0 rounded-full" />
    </div>
  </div>
</template>
