<script setup lang="ts">
import { ref } from "vue";
import { apiPost, apiPatch, apiDelete } from "@/services/api";
import { useCrudForm } from "@/composables/useCrudForm";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import { createCategorySchema, updateCategorySchema } from "@/schemas/admin/category.schema";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiConfirmDialog from "@/components/ui/UiConfirmDialog.vue";
import UiButton from "@/components/ui/UiButton.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import CategoryForm from "@/components/forms/admin/CategoryForm.vue";
import {
  categoriesColumns,
  categoriesRowActions,
  type CategoryRow,
} from "@/config/tables/categories.columns";

const tableRef = ref<{ refresh: () => void } | null>(null);
const {
  open: confirmOpen,
  title: confirmTitle,
  message: confirmMessage,
  confirm: showConfirm,
  onConfirm,
  onCancel,
} = useConfirmDialog();

const initialValues = { name: "", slug: "", description: "", isActive: true };

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
  schemas: { create: createCategorySchema, update: updateCategorySchema },
  initialValues,
  create: (data) => apiPost("/admin/categories", data),
  update: (id, data) => apiPatch(`/admin/categories/${id}`, data),
  mapEditValues: (row) => {
    const cat = row as unknown as CategoryRow;
    return {
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      isActive: cat.isActive,
    };
  },
  onSuccess: () => tableRef.value?.refresh(),
});

async function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const cat = row as unknown as CategoryRow;
  if (action === "edit") {
    openEdit(row);
    return;
  }
  if (action === "delete") {
    const ok = await showConfirm(`حذف «${cat.name}»؟`, { title: "حذف دسته" });
    if (!ok) return;
    await apiDelete(`/admin/categories/${cat.id}`);
    tableRef.value?.refresh();
  }
}
</script>

<template>
  <div class="categories-page">
    <PageHeader title="دسته‌بندی‌ها" description="مدیریت دسته‌بندی خدمات">
      <template #actions>
        <UiButton @click="openCreate()">افزودن دسته</UiButton>
      </template>
    </PageHeader>

    <DataTable
      ref="tableRef"
      title="دسته‌بندی‌ها"
      endpoint="/admin/categories"
      :columns="categoriesColumns"
      :row-actions="categoriesRowActions"
      searchable
      advanced-filters
      default-sort="name:asc"
      @row-action="onRowAction"
    />

    <UiModal v-model:open="isOpen" :title="`${modalTitle} دسته`">
      <form @submit.prevent="submit">
        <CrudFormShell
          :submitting="submitting"
          :error="formError"
          @submit="submit"
          @cancel="close"
        >
          <CategoryForm
            :mode="mode"
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
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
