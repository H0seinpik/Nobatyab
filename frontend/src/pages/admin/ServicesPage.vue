<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/api";
import { useCrudForm } from "@/composables/useCrudForm";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import { createServiceSchema, updateServiceSchema } from "@/schemas/admin/service.schema";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiConfirmDialog from "@/components/ui/UiConfirmDialog.vue";
import UiButton from "@/components/ui/UiButton.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import ServiceForm from "@/components/forms/admin/ServiceForm.vue";
import {
  servicesColumns,
  servicesRowActions,
  type ServiceRow,
} from "@/config/tables/services.columns";

interface Category {
  id: string;
  name: string;
}

const tableRef = ref<{ refresh: () => void } | null>(null);
const categories = ref<Category[]>([]);
const {
  open: confirmOpen,
  title: confirmTitle,
  message: confirmMessage,
  confirm: showConfirm,
  onConfirm,
  onCancel,
} = useConfirmDialog();

const initialValues = {
  categoryId: "",
  name: "",
  description: "",
  defaultDuration: 30,
  basePrice: 0,
  isActive: true,
};

const {
  isOpen,
  mode,
  formError,
  modalTitle,
  values,
  fieldError,
  touch,
  submitting,
  openCreate,
  openEdit,
  close,
  submit,
} = useCrudForm({
  schemas: { create: createServiceSchema, update: updateServiceSchema },
  initialValues,
  create: (data) => apiPost("/admin/services", data),
  update: (id, data) => apiPatch(`/admin/services/${id}`, data),
  mapEditValues: (row) => {
    const svc = row as unknown as ServiceRow;
    return {
      categoryId: svc.category?.id ?? "",
      name: svc.name,
      description: svc.description ?? "",
      defaultDuration: svc.defaultDuration,
      basePrice: Number(svc.basePrice),
      isActive: svc.isActive,
    };
  },
  onSuccess: () => tableRef.value?.refresh(),
});

async function loadCategories() {
  const res = await apiGet<Category[]>("/admin/categories", { page: 1, pageSize: 100 });
  categories.value = res.data;
  if (categories.value.length && !values.categoryId) {
    values.categoryId = categories.value[0].id;
  }
}

async function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const svc = row as unknown as ServiceRow;
  if (action === "edit") {
    openEdit(row);
    return;
  }
  if (action === "delete") {
    const ok = await showConfirm(`حذف «${svc.name}»؟`, { title: "حذف خدمت" });
    if (!ok) return;
    await apiDelete(`/admin/services/${svc.id}`);
    tableRef.value?.refresh();
  }
}

onMounted(loadCategories);
</script>

<template>
  <div class="admin-services-page">
    <PageHeader title="خدمات" description="مدیریت خدمات و قیمت‌گذاری">
      <template #actions>
        <UiButton @click="openCreate()">افزودن خدمت</UiButton>
      </template>
    </PageHeader>

    <DataTable
      ref="tableRef"
      title="خدمات"
      endpoint="/admin/services"
      :columns="servicesColumns"
      :row-actions="servicesRowActions"
      searchable
      advanced-filters
      default-sort="name:asc"
      @row-action="onRowAction"
    />

    <UiModal v-model:open="isOpen" :title="`${modalTitle} خدمت`" size="lg">
      <form @submit.prevent="submit">
        <CrudFormShell
          :submitting="submitting"
          :error="formError"
          :submit-label="mode === 'create' ? 'ایجاد' : 'ذخیره'"
          @submit="submit"
          @cancel="close"
        >
          <ServiceForm
            :mode="mode"
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
            :categories="categories"
          />
        </CrudFormShell>
      </form>
    </UiModal>

    <UiConfirmDialog
      v-model:open="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      variant="danger"
      confirm-label="حذف"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>
