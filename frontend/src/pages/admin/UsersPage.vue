<script setup lang="ts">
import { ref } from "vue";
import { apiPatch } from "@/services/api";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import {
  usersColumns,
  usersRowActions,
  type UserRow,
} from "@/config/tables/users.columns";

const tableRef = ref<{ refresh: () => void } | null>(null);

const roleLabels: Record<string, string> = {
  ADMIN: "مدیر",
  PROVIDER: "ارائه‌دهنده",
  USER: "کاربر",
};

async function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const user = row as unknown as UserRow;
  if (action === "toggle-active") {
    await apiPatch(`/admin/users/${user.id}`, { isActive: !user.isActive });
  } else if (action === "set-provider") {
    await apiPatch(`/admin/users/${user.id}`, { role: "PROVIDER" });
  } else if (action === "set-user") {
    await apiPatch(`/admin/users/${user.id}`, { role: "USER" });
  }
  tableRef.value?.refresh();
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">کاربران</h1>
    <DataTable
      ref="tableRef"
      endpoint="/admin/users"
      :columns="usersColumns"
      :row-actions="usersRowActions"
      searchable
      advanced-filters
      default-sort="createdAt:desc"
      @row-action="onRowAction"
    >
      <template #cell-role="{ row }">
        <UiBadge>{{ roleLabels[String(row.role)] ?? row.role }}</UiBadge>
      </template>
    </DataTable>
  </div>
</template>
