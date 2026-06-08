<script setup lang="ts">
defineProps<{ columns: string[]; rows: Record<string, unknown>[]; emptyText?: string }>();
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-[var(--color-border)]">
    <table class="min-w-full text-sm">
      <thead class="bg-[var(--color-bg)]">
        <tr>
          <th v-for="col in columns" :key="col" class="px-4 py-3 text-right font-medium text-[var(--color-muted)]">
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-[var(--color-muted)]">
            {{ emptyText ?? "موردی یافت نشد" }}
          </td>
        </tr>
        <tr
          v-for="(row, i) in rows"
          :key="i"
          class="border-t border-[var(--color-border)] hover:bg-[var(--color-bg)]"
        >
          <slot name="row" :row="row" />
        </tr>
      </tbody>
    </table>
  </div>
</template>
