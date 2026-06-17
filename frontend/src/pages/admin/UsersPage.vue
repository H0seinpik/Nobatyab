<script setup lang="ts">
import { ref } from "vue";
import { apiPatch } from "@/services/api";
import { useCrudForm } from "@/composables/useCrudForm";
import { createUserSchema, updateUserSchema } from "@/schemas/admin/user.schema";
import {
  createAdminUser,
  getAdminUser,
  mapAdminUserToForm,
  updateAdminUser,
} from "@/services/adminUser.service";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import UiButton from "@/components/ui/UiButton.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import UserForm from "@/components/forms/admin/UserForm.vue";
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

const initialValues = {
  email: "",
  password: "",
  fullName: "",
  firstName: "",
  lastName: "",
  nationalCode: "",
  age: undefined as number | undefined,
  address: "",
  phone: "",
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  role: "USER" as const,
  isActive: true,
};

const {
  isOpen,
  mode,
  formError,
  modalTitle,
  formLoading,
  values,
  fieldError,
  touch,
  submitting,
  openCreate,
  openEdit,
  close,
  submit,
} = useCrudForm({
  schemas: { create: createUserSchema, update: updateUserSchema },
  initialValues,
  create: (data) => createAdminUser(data),
  update: (id, data) => updateAdminUser(id, data),
  fetchEdit: async (id) => mapAdminUserToForm(await getAdminUser(id)),
  onSuccess: () => tableRef.value?.refresh(),
});

async function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const user = row as unknown as UserRow;
  if (action === "edit") {
    await openEdit(row);
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
    <PageHeader title="کاربران" description="مدیریت کاربران سیستم">
      <template #actions>
        <UiButton @click="openCreate()">افزودن کاربر</UiButton>
      </template>
    </PageHeader>

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

    <UiModal
      v-model:open="isOpen"
      :title="`${modalTitle} کاربر`"
      size="lg"
      :closable="!formLoading && !submitting"
    >
      <form @submit.prevent="submit">
        <CrudFormShell
          :loading="formLoading"
          :submitting="submitting"
          :error="formError"
          submit-label="ذخیره"
          @submit="submit"
          @cancel="close"
        >
          <UserForm
            :mode="mode"
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
          />
        </CrudFormShell>
      </form>
    </UiModal>
  </div>
</template>
