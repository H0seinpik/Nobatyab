<script setup lang="ts">
import type { DataTableColumn, RowAction } from "@/types/dataTable";
import DataTableRowActions from "./DataTableRowActions.vue";
import DataTableEmpty from "./DataTableEmpty.vue";

defineProps<{
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
      class="border-t border-[var(--color-border)] hover:bg-[var(--color-bg)]"
    >
      <td v-if="selectable" class="px-4 py-3">
        <input
          type="checkbox"
          :checked="selectedIds.includes(rowId(row, rowKey))"
          @change="emit('toggle-row', rowId(row, rowKey))"
        />
      </td>
      <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm">
        <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
          {{ cellValue(row, col) }}
        </slot>
      </td>
      <td v-if="rowActions?.length" class="px-4 py-3">
        <DataTableRowActions
          :row="row"
          :actions="rowActions"
          @action="(key, r) => emit('row-action', key, r)"
        />
      </td>
    </tr>
  </tbody>
</template>
