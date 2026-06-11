<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { apiGet, apiPost, apiDelete } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { createServiceFormSchema } from "@/schemas/admin.schema";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
import UiButton from "@/components/ui/UiButton.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
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
const showCreate = ref(false);
const categories = ref<Category[]>([]);
const categoriesLoading = ref(true);

const { values, fieldError, touch, isValid, submitting, handleSubmit, reset } = useZodForm(
  createServiceFormSchema,
  { categoryId: "", name: "", defaultDuration: 30, basePrice: 0 },
);

async function loadCategories() {
  categoriesLoading.value = true;
  try {
    const res = await apiGet<Category[]>("/admin/categories");
    categories.value = res.data;
    if (categories.value.length && !values.categoryId) {
      values.categoryId = categories.value[0].id;
    }
  } finally {
    categoriesLoading.value = false;
  }
}

async function create() {
  await handleSubmit(async (data) => {
    await apiPost("/admin/services", data);
    reset({ categoryId: values.categoryId, name: "", defaultDuration: 30, basePrice: 0 });
    showCreate.value = false;
    tableRef.value?.refresh();
  });
}

async function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const svc = row as unknown as ServiceRow;
  if (action === "delete") {
    if (!confirm(`حذف «${svc.name}»؟`)) return;
    await apiDelete(`/admin/services/${svc.id}`);
    tableRef.value?.refresh();
  }
}

watch(showCreate, (open) => {
  if (open && categories.value.length && !values.categoryId) {
    values.categoryId = categories.value[0].id;
  }
});

onMounted(loadCategories);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">خدمات</h1>
    <DataTable
      ref="tableRef"
      endpoint="/admin/services"
      :columns="servicesColumns"
      :row-actions="servicesRowActions"
      searchable
      advanced-filters
      default-sort="name:asc"
      @row-action="onRowAction"
    >
      <template #toolbar-extra>
        <UiButton @click="showCreate = !showCreate">
          {{ showCreate ? "بستن فرم" : "افزودن خدمت" }}
        </UiButton>
      </template>
    </DataTable>

    <UiCard v-if="showCreate" class="mt-6 max-w-2xl">
      <h2 class="mb-4 font-semibold">افزودن خدمت جدید</h2>
      <SkeletonForm v-if="categoriesLoading" :fields="4" />
      <form v-else class="grid gap-3 sm:grid-cols-2" @submit.prevent="create">
        <div class="sm:col-span-2">
        <UiSelect
          v-model="values.categoryId"
          label="دسته"
          required
          :error="fieldError('categoryId')"
          @blur="touch('categoryId')"
        >
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </UiSelect>
        </div>
        <UiInput
          v-model="values.name"
          label="نام"
          required
          :error="fieldError('name')"
          @blur="touch('name')"
        />
        <UiInput
          v-model="values.defaultDuration"
          label="مدت (دقیقه)"
          type="number"
          required
          :error="fieldError('defaultDuration')"
          @blur="touch('defaultDuration')"
        />
        <UiInput
          v-model="values.basePrice"
          label="قیمت پایه"
          type="number"
          required
          :error="fieldError('basePrice')"
          @blur="touch('basePrice')"
        />
        <UiButton type="submit" class="sm:col-span-2" :loading="submitting" :disabled="!isValid || submitting">
          ذخیره
        </UiButton>
      </form>
    </UiCard>
  </div>
</template>
