<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiGet, apiPatch } from "@/services/api";
import { useCrudForm } from "@/composables/useCrudForm";
import { createUserSchema, updateUserSchema, userFormInitialValues } from "@/schemas/admin/user.schema";
import {
  adminPromoteProviderSchema,
  adminPromoteProviderInitialValues,
} from "@/schemas/admin/promoteProvider.schema";
import {
  createAdminUser,
  getAdminUser,
  mapAdminUserToForm,
  updateAdminUser,
} from "@/services/adminUser.service";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiButton from "@/components/ui/UiButton.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import UserForm from "@/components/forms/admin/UserForm.vue";
import AdminPromoteProviderForm from "@/components/forms/admin/AdminPromoteProviderForm.vue";
import {
  usersColumns,
  usersRowActions,
  type UserRow,
} from "@/config/tables/users.columns";
import { getApiErrorMessage } from "@/utils/apiError";
import { useZodForm } from "@/composables/useZodForm";

const tableRef = ref<{ refresh: () => void } | null>(null);
const categories = ref<{ id: string; name: string }[]>([]);
const promoteModalOpen = ref(false);
const promotingUser = ref<UserRow | null>(null);
const promoteError = ref<string | null>(null);

const {
  values: promoteValues,
  fieldError: promoteFieldError,
  touch: promoteTouch,
  submitting: promoteSubmitting,
  validateAll: validatePromote,
  reset: resetPromote,
} = useZodForm(adminPromoteProviderSchema, adminPromoteProviderInitialValues);

const initialValues = userFormInitialValues;

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

async function loadCategories() {
  try {
    const res = await apiGet<{ id: string; name: string }[]>("/admin/categories", {
      page: 1,
      pageSize: 100,
    });
    categories.value = res.data;
  } catch {
    categories.value = [];
  }
}

onMounted(loadCategories);

function openPromoteModal(user: UserRow) {
  promotingUser.value = user;
  promoteError.value = null;
  resetPromote(adminPromoteProviderInitialValues);
  promoteModalOpen.value = true;
}

async function submitPromote() {
  if (promoteSubmitting.value) return;
  promoteError.value = null;
  if (!validatePromote()) return;
  const user = promotingUser.value;
  if (!user) return;

  promoteSubmitting.value = true;
  try {
    const data = adminPromoteProviderSchema.parse(promoteValues);
    await apiPatch(`/admin/users/${user.id}`, {
      role: "PROVIDER",
      categoryId: data.categoryId,
      serviceName: data.serviceName,
      serviceDescription: data.serviceDescription || undefined,
      servicePrice: data.servicePrice,
      serviceDuration: data.serviceDuration,
    });
    promoteModalOpen.value = false;
    promotingUser.value = null;
    tableRef.value?.refresh();
  } catch (e) {
    promoteError.value = getApiErrorMessage(e, "تبدیل به ارائه‌دهنده ناموفق بود");
  } finally {
    promoteSubmitting.value = false;
  }
}

async function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const user = row as unknown as UserRow;
  if (action === "edit") {
    await openEdit(row);
    return;
  }
  if (action === "toggle-active") {
    await apiPatch(`/admin/users/${user.id}`, { isActive: !user.isActive });
  } else if (action === "set-provider") {
    openPromoteModal(user);
    return;
  } else if (action === "set-user") {
    await apiPatch(`/admin/users/${user.id}`, { role: "USER" });
  }
  tableRef.value?.refresh();
}
</script>

<template>
  <div class="users-page">
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
    />

    <UiModal v-model:open="isOpen" :title="`${modalTitle} کاربر`" size="lg" :closable="!formLoading && !submitting">
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
            :categories="categories"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
          />
        </CrudFormShell>
      </form>
    </UiModal>

    <UiModal v-model:open="promoteModalOpen" title="تبدیل به ارائه‌دهنده" size="lg" :closable="!promoteSubmitting">
      <form @submit.prevent="submitPromote">
        <CrudFormShell
          :submitting="promoteSubmitting"
          :error="promoteError"
          submit-label="تأیید و تبدیل"
          @submit="submitPromote"
          @cancel="promoteModalOpen = false"
        >
          <AdminPromoteProviderForm
            :values="promoteValues"
            :field-error="(f) => promoteFieldError(f as keyof typeof promoteValues)"
            :touch="(f) => promoteTouch(f as keyof typeof promoteValues)"
            :categories="categories"
            :user-name="promotingUser?.fullName"
          />
        </CrudFormShell>
      </form>
    </UiModal>
  </div>
</template>
