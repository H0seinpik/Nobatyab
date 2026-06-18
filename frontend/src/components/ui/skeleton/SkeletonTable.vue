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
  <div class="skeleton-table">
    <div class="skeleton-table__header">
      <SkeletonBase v-if="showCheckbox" class="skeleton--icon-sm" />
      <SkeletonBase
        v-for="c in columns"
        :key="`h-${c}`"
        class="skeleton--header-cell"
        :style="{ maxWidth: c === columns ? '80px' : undefined }"
      />
      <SkeletonBase v-if="showActions" class="skeleton--actions-header" />
    </div>
    <div
      v-for="r in rows"
      :key="r"
      class="skeleton-table__row"
    >
      <SkeletonBase v-if="showCheckbox" class="skeleton--icon-sm" />
      <SkeletonBase v-for="c in columns" :key="`r-${r}-${c}`" class="skeleton--body-cell" />
      <SkeletonBase v-if="showActions" class="skeleton--icon-md" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-table {
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
}

.skeleton-table__header {
  display: flex;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
  padding: 0.75rem 1rem;
}

.skeleton-table__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  padding: 1rem;
}

.skeleton-table__row:last-child {
  border-bottom: 0;
}
</style>
