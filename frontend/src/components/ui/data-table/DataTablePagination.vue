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
  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm">
    <p class="text-[var(--color-muted)]">
      {{ meta.total }} مورد — صفحه {{ meta.page }} از {{ meta.totalPages }}
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <select
        class="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1"
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
