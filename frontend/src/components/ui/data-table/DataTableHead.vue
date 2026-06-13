<script setup lang="ts">
import type { DataTableColumn } from "@/types/dataTable";
import JalaliDateFilter from "@/components/ui/JalaliDateFilter.vue";

const props = defineProps<{
  columns: DataTableColumn[];
  selectable?: boolean;
  hasActions?: boolean;
  filtersOpen?: boolean;
  getSortDirection: (field: string) => "asc" | "desc" | null;
  filterValues: Record<string, unknown>;
}>();

const emit = defineEmits<{
  sort: [field: string];
  "filter-change": [key: string, value: unknown];
  "toggle-all": [];
}>();

function textFilterValue(key: string): string {
  const raw = props.filterValues[key];
  if (raw == null) return "";
  if (typeof raw === "object" && "value" in raw) {
    return String((raw as { value?: unknown }).value ?? "");
  }
  return String(raw);
}
</script>

<template>
  <thead class="bg-[var(--color-bg)]">
    <tr>
      <th v-if="selectable" class="w-10 px-4 py-3">
        <input type="checkbox" @change="emit('toggle-all')" />
      </th>
      <th
        v-for="col in columns"
        :key="col.key"
        class="px-4 py-3 text-right font-medium text-[var(--color-muted)]"
        :style="col.width ? { width: col.width } : undefined"
      >
        <button
          v-if="col.sortable"
          type="button"
          class="inline-flex items-center gap-1 hover:text-[var(--color-text)]"
          @click="emit('sort', col.key)"
        >
          {{ col.label }}
          <span v-if="getSortDirection(col.key) === 'asc'">↑</span>
          <span v-else-if="getSortDirection(col.key) === 'desc'">↓</span>
        </button>
        <span v-else>{{ col.label }}</span>
      </th>
      <th v-if="hasActions" class="w-12 px-4 py-3" />
    </tr>
    <tr v-if="filtersOpen">
      <th v-if="selectable" />
      <th v-for="col in columns" :key="`f-${col.key}`" class="px-4 pb-3">
        <template v-if="col.filterable">
          <select
            v-if="col.filterType === 'select' && col.filterOptions"
            class="form-control text-xs"
            :value="String(filterValues[col.key] ?? '')"
            @change="
              emit(
                'filter-change',
                col.key,
                ($event.target as HTMLSelectElement).value || undefined,
              )
            "
          >
            <option value="">همه</option>
            <option v-for="opt in col.filterOptions" :key="String(opt.value)" :value="String(opt.value)">
              {{ opt.label }}
            </option>
          </select>
          <select
            v-else-if="col.filterType === 'boolean'"
            class="form-control text-xs"
            :value="String(filterValues[col.key] ?? '')"
            @change="
              emit(
                'filter-change',
                col.key,
                ($event.target as HTMLSelectElement).value === ''
                  ? undefined
                  : ($event.target as HTMLSelectElement).value === 'true',
              )
            "
          >
            <option value="">همه</option>
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>
          <JalaliDateFilter
            v-else-if="col.filterType === 'date'"
            :model-value="(filterValues[col.key] as { gte?: string })?.gte"
            @update:model-value="
              (v) =>
                emit('filter-change', col.key, {
                  gte: v,
                })
            "
          />
          <input
            v-else
            type="text"
            class="form-control text-xs"
            :value="textFilterValue(col.key)"
            @input="emit('filter-change', col.key, { op: 'contains', value: ($event.target as HTMLInputElement).value })"
          />
        </template>
      </th>
      <th v-if="hasActions" />
    </tr>
  </thead>
</template>
