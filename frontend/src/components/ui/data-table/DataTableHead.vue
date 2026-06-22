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
  <thead class="data-table-head">
    <tr>
      <th v-if="selectable" class="data-table-head__cell data-table-head__cell--select">
        <input type="checkbox" @change="emit('toggle-all')" />
      </th>
      <th
        v-for="col in columns"
        :key="col.key"
        class="data-table-head__cell"
        :style="col.width ? { width: col.width } : undefined"
      >
        <button
          v-if="col.sortable"
          type="button"
          class="data-table-head__sort-btn"
          @click="emit('sort', col.key)"
        >
          {{ col.label }}
          <span v-if="getSortDirection(col.key) === 'asc'">↑</span>
          <span v-else-if="getSortDirection(col.key) === 'desc'">↓</span>
        </button>
        <span v-else>{{ col.label }}</span>
      </th>
      <th v-if="hasActions" class="data-table-head__cell data-table-head__cell--actions" />
    </tr>
    <tr v-if="filtersOpen">
      <th v-if="selectable" />
      <th v-for="col in columns" :key="`f-${col.key}`" class="data-table-head__filter-cell">
        <template v-if="col.filterable">
          <select
            v-if="col.filterType === 'select' && col.filterOptions"
            class="form-control form-control--xs"
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
            class="form-control form-control--xs"
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
            class="form-control form-control--xs"
            :value="textFilterValue(col.key)"
            @input="emit('filter-change', col.key, { op: 'contains', value: ($event.target as HTMLInputElement).value })"
          />
        </template>
      </th>
      <th v-if="hasActions" />
    </tr>
  </thead>
</template>

<style scoped>
.data-table-head {
  background-color: var(--color-bg);
}

.data-table-head__cell {
  padding: 0.75rem 1rem;
  text-align: start;
  font-weight: 500;
  color: var(--color-muted);
}

.data-table-head__cell--select {
  width: 2.5rem;
}

.data-table-head__cell--actions {
  width: 3rem;
}

.data-table-head__sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-weight: inherit;
  cursor: pointer;
}

.data-table-head__sort-btn:hover {
  color: var(--color-text);
}

.data-table-head__filter-cell {
  padding: 0 1rem 0.75rem;
}
</style>
