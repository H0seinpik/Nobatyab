<script setup lang="ts">
import type { DataTableColumn, RowAction } from "@/types/dataTable";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import DataTableRowActions from "./DataTableRowActions.vue";
import DataTableEmpty from "./DataTableEmpty.vue";
import { getVisibleRowActions } from "@/config/statuses";

const props = defineProps<{
  columns: DataTableColumn[];
  rows: Record<string, unknown>[];
  rowKey: string;
  selectable?: boolean;
  selectedIds: string[];
  rowActions?: RowAction[];
  emptyText?: string;
}>();

const emit = defineEmits<{
  "toggle-row": [id: string];
  "row-action": [action: string, row: Record<string, unknown>];
}>();

function cellValue(row: Record<string, unknown>, col: DataTableColumn) {
  if (col.formatter) return col.formatter(row);
  const val = row[col.key];
  if (val === null || val === undefined) return "—";
  return String(val);
}

function rowId(row: Record<string, unknown>, rowKey: string) {
  return String(row[rowKey]);
}

function hasRowActions(row: Record<string, unknown>) {
  return getVisibleRowActions(props.rowActions, row).length > 0;
}
</script>

<template>
  <tbody>
    <tr v-if="!rows.length">
      <td :colspan="columns.length + (selectable ? 1 : 0) + (rowActions?.length ? 1 : 0)">
        <slot name="empty">
          <DataTableEmpty :text="emptyText" />
        </slot>
      </td>
    </tr>
    <tr
      v-for="row in rows"
      :key="rowId(row, rowKey)"
      class="data-table-body__row"
    >
      <td v-if="selectable" class="data-table-body__cell">
        <input
          type="checkbox"
          :checked="selectedIds.includes(rowId(row, rowKey))"
          @change="emit('toggle-row', rowId(row, rowKey))"
        />
      </td>
      <td v-for="col in columns" :key="col.key" class="data-table-body__cell">
        <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
          <StatusBadge
            v-if="col.statusKind"
            :kind="col.statusKind"
            :value="row[col.key]"
          />
          <template v-else>{{ cellValue(row, col) }}</template>
        </slot>
      </td>
      <td v-if="rowActions?.length" class="data-table-body__cell">
        <DataTableRowActions
          v-if="hasRowActions(row)"
          :row="row"
          :actions="rowActions"
          @action="(key, r) => emit('row-action', key, r)"
        />
      </td>
    </tr>
  </tbody>
</template>

<style scoped>
.data-table-body__row {
  border-top: 1px solid var(--color-border);
}

.data-table-body__row:hover {
  background-color: var(--color-bg);
}

.data-table-body__cell {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}
</style>
