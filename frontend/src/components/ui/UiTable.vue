<script setup lang="ts">
defineProps<{ columns: string[]; rows: Record<string, unknown>[]; emptyText?: string }>();
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead class="table__head">
        <tr>
          <th v-for="col in columns" :key="col" class="table__th">
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="table__empty">
            {{ emptyText ?? "موردی یافت نشد" }}
          </td>
        </tr>
        <tr v-for="(row, i) in rows" :key="i" class="table__row">
          <slot name="row" :row="row" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
}

.table {
  width: 100%;
  min-width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
}

.table__head {
  background-color: var(--color-bg);
}

.table__th {
  padding: 0.75rem 1rem;
  text-align: right;
  font-weight: 500;
  color: var(--color-muted);
}

.table__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-muted);
}

.table__row {
  border-top: 1px solid var(--color-border);
}

.table__row:hover {
  background-color: var(--color-bg);
}
</style>
