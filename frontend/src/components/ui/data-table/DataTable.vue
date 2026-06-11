<script setup lang="ts">
import { ref, watch } from "vue";
import { useDataTable } from "@/composables/useDataTable";
import type { BulkAction, DataTableColumn, PaginationMeta, RowAction } from "@/types/dataTable";
import SkeletonTable from "@/components/ui/skeleton/SkeletonTable.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import DataTableToolbar from "./DataTableToolbar.vue";
import DataTableHead from "./DataTableHead.vue";
import DataTableBody from "./DataTableBody.vue";
import DataTablePagination from "./DataTablePagination.vue";
import DataTableBulkBar from "./DataTableBulkBar.vue";

const props = withDefaults(
  defineProps<{
    endpoint: string;
    columns: DataTableColumn[];
    rowKey?: string;
    rowActions?: RowAction[];
    bulkActions?: BulkAction[];
    defaultPageSize?: number;
    defaultSort?: string;
    selectable?: boolean;
    searchable?: boolean;
    advancedFilters?: boolean;
    emptyText?: string;
    title?: string;
  }>(),
  {
    rowKey: "id",
    defaultPageSize: 20,
    selectable: false,
    searchable: false,
    advancedFilters: false,
  },
);

const emit = defineEmits<{
  loaded: [payload: { rows: Record<string, unknown>[]; meta: PaginationMeta }];
  error: [error: string];
  "selection-change": [ids: string[]];
  "row-action": [payload: { action: string; row: Record<string, unknown> }];
  "bulk-action": [payload: { action: string; rows: Record<string, unknown>[] }];
}>();

const filtersOpen = ref(false);
const hasFilterableColumns = () => props.columns.some((c) => c.filterable);

const {
  rows,
  meta,
  loading,
  error,
  query,
  selectedIds,
  setPage,
  setPageSize,
  setSearch,
  setFilter,
  setSort,
  getSortDirection,
  toggleRow,
  toggleAll,
  clearSelection,
  refresh,
} = useDataTable<Record<string, unknown>>({
  endpoint: props.endpoint,
  defaultPageSize: props.defaultPageSize,
  defaultSort: props.defaultSort,
});

watch(
  () => rows.value,
  (r) => emit("loaded", { rows: r, meta: meta.value }),
);
watch(error, (e) => {
  if (e) emit("error", e);
});
watch(selectedIds, (ids) => emit("selection-change", ids), { deep: true });

function onToggleAll() {
  toggleAll(rows.value.map((r) => String(r[props.rowKey])));
}

function onBulkAction(key: string) {
  const selected = rows.value.filter((r) => selectedIds.value.includes(String(r[props.rowKey])));
  emit("bulk-action", { action: key, rows: selected });
}

function onRowAction(action: string, row: Record<string, unknown>) {
  emit("row-action", { action, row });
}

defineExpose({ refresh, clearSelection });
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
    <DataTableToolbar
      :title="title"
      :searchable="searchable"
      :search="query.search"
      :show-filters="advancedFilters && hasFilterableColumns()"
      :filters-open="filtersOpen"
      @update:search="setSearch"
      @toggle-filters="filtersOpen = !filtersOpen"
    >
      <template #toolbar-extra>
        <slot name="toolbar-extra" />
      </template>
    </DataTableToolbar>

    <DataTableBulkBar
      v-if="selectable && bulkActions?.length"
      :count="selectedIds.length"
      :actions="bulkActions"
      @action="onBulkAction"
      @clear="clearSelection"
    />

    <SkeletonTable
      v-if="loading"
      :columns="columns.length"
      :rows="defaultPageSize"
      :show-checkbox="selectable"
      :show-actions="!!rowActions?.length"
    />

    <ContentFade v-else>
      <div v-if="error" class="px-4 py-6 text-center text-red-600">{{ error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-[640px] w-full text-sm">
          <DataTableHead
            :columns="columns"
            :selectable="selectable"
            :has-actions="!!rowActions?.length"
            :filters-open="filtersOpen && advancedFilters"
            :get-sort-direction="getSortDirection"
            :filter-values="query.filter"
            @sort="setSort"
            @filter-change="setFilter"
            @toggle-all="onToggleAll"
          />
          <DataTableBody
            :columns="columns"
            :rows="rows"
            :row-key="rowKey"
            :selectable="selectable"
            :selected-ids="selectedIds"
            :row-actions="rowActions"
            :empty-text="emptyText"
            @toggle-row="toggleRow"
            @row-action="onRowAction"
          >
            <template v-for="col in columns" :key="col.key" #[`cell-${col.key}`]="slotProps">
              <slot :name="`cell-${col.key}`" v-bind="slotProps" />
            </template>
          </DataTableBody>
        </table>
      </div>
      <DataTablePagination
        v-if="!error"
        :meta="meta"
        @page-change="setPage"
        @page-size-change="setPageSize"
      />
    </ContentFade>
  </div>
</template>
