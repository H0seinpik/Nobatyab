<script setup lang="ts">
import { ref } from "vue";
import { apiPatch } from "@/services/api";
import { useCrudForm } from "@/composables/useCrudForm";
import { updateUserSchema } from "@/schemas/admin/user.schema";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import UserEditForm from "@/components/forms/admin/UserEditForm.vue";
import {
  usersColumns,
  usersRowActions,
  type UserRow,
} from "@/config/tables/users.columns";

const tableRef = ref<{ refresh: () => void } | null>(null);
const editingUser = ref<UserRow | null>(null);

const roleLabels: Record<string, string> = {
  ADMIN: "مدیر",
  PROVIDER: "ارائه‌دهنده",
  USER: "کاربر",
};

const {
  isOpen,
  formError,
  values,
  fieldError,
  touch,
  submitting,
  openEdit,
  close,
  submit,
} = useCrudForm({
  schemas: { create: updateUserSchema, update: updateUserSchema },
  initialValues: { role: "USER" as const, isActive: true },
  update: (id, data) => apiPatch(`/admin/users/${id}`, data),
  mapEditValues: (row) => {
    const u = row as unknown as UserRow;
    return { role: u.role as "USER" | "PROVIDER" | "ADMIN", isActive: u.isActive };
  },
  onSuccess: () => tableRef.value?.refresh(),
});

async function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const user = row as unknown as UserRow;
  if (action === "edit") {
    editingUser.value = user;
    openEdit(row);
    return;
  }
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
    <PageHeader title="کاربران" description="مدیریت نقش و وضعیت کاربران" />

    <DataTable
      ref="tableRef"
      title="کاربران"
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

    <UiModal v-model:open="isOpen" title="ویرایش کاربر">
      <p v-if="editingUser" class="mb-4 text-sm text-[var(--color-muted)]">
        {{ editingUser.fullName }} — {{ editingUser.email }}
      </p>
      <form @submit.prevent="submit">
        <CrudFormShell
          :submitting="submitting"
          :error="formError"
          submit-label="ذخیره"
          @submit="submit"
          @cancel="close"
        >
          <UserEditForm
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
          />
        </CrudFormShell>
      </form>
    </UiModal>
  </div>
</template>
