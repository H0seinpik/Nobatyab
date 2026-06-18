<script setup lang="ts">
import UiButton from "@/components/ui/UiButton.vue";
import type { PaginationMeta } from "@/types/dataTable";

defineProps<{
  meta: PaginationMeta;
  pageSizeOptions?: number[];
}>();

const emit = defineEmits<{
  "page-change": [page: number];
  "page-size-change": [size: number];
}>();
</script>

<template>
  <div class="data-table-pagination">
    <p class="data-table-pagination__meta">
      {{ meta.total }} مورد — صفحه {{ meta.page }} از {{ meta.totalPages }}
    </p>
    <div class="data-table-pagination__controls">
      <select
        class="form-control form-control--compact"
        :value="meta.pageSize"
        @change="emit('page-size-change', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="size in pageSizeOptions ?? [10, 20, 50]" :key="size" :value="size">
          {{ size }} در صفحه
        </option>
      </select>
      <UiButton
        variant="secondary"
        :disabled="meta.page <= 1"
        @click="emit('page-change', meta.page - 1)"
      >
        قبلی
      </UiButton>
      <UiButton
        variant="secondary"
        :disabled="meta.page >= meta.totalPages"
        @click="emit('page-change', meta.page + 1)"
      >
        بعدی
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.data-table-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-top: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.data-table-pagination__meta {
  color: var(--color-muted);
}

.data-table-pagination__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
</style>
