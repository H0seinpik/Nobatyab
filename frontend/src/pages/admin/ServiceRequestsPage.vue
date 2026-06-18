<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPatch } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { reviewServiceRequestSchema } from "@/schemas/admin/serviceRequest.schema";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import ServiceRequestReviewForm from "@/components/forms/admin/ServiceRequestReviewForm.vue";
import {
  serviceRequestsColumns,
  serviceRequestsRowActions,
  type ServiceRequestRow,
} from "@/config/tables/serviceRequests.columns";

interface Category {
  id: string;
  name: string;
}

const tableRef = ref<{ refresh: () => void } | null>(null);
const modalOpen = ref(false);
const reviewingRequest = ref<ServiceRequestRow | null>(null);
const categories = ref<Category[]>([]);
const formError = ref<string | null>(null);

const { values, fieldError, touch, submitting, validateAll, reset } = useZodForm(
  reviewServiceRequestSchema,
  { status: "APPROVED" as const, adminNote: "", categoryId: "" },
);

async function loadCategories() {
  const res = await apiGet<Category[]>("/admin/categories", { page: 1, pageSize: 100 });
  categories.value = res.data;
}

function openReview(row: Record<string, unknown>) {
  const request = row as unknown as ServiceRequestRow;
  if (request.status !== "PENDING") return;
  reviewingRequest.value = request;
  formError.value = null;
  reset({ status: "APPROVED", adminNote: "", categoryId: "" });
  modalOpen.value = true;
}

async function submitReview() {
  if (submitting.value) return;
  formError.value = null;
  if (!validateAll()) return;
  const req = reviewingRequest.value;
  if (!req) return;
  if (req.status !== "PENDING") {
    formError.value = "این درخواست قبلاً بررسی شده است.";
    modalOpen.value = false;
    reviewingRequest.value = null;
    tableRef.value?.refresh();
    return;
  }
  if (
    values.status === "APPROVED" &&
    !req.serviceId &&
    !values.categoryId
  ) {
    formError.value = "انتخاب دسته برای تایید خدمت جدید الزامی است";
    return;
  }
  submitting.value = true;
  try {
    await apiPatch(`/admin/service-requests/${req.id}`, {
      status: values.status,
      adminNote: values.adminNote || undefined,
      categoryId: values.categoryId || undefined,
    });
    modalOpen.value = false;
    reviewingRequest.value = null;
    tableRef.value?.refresh();
  } catch {
    formError.value = "خطا در بررسی درخواست";
  } finally {
    submitting.value = false;
  }
}

function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  if (action === "review") openReview(row);
}

onMounted(loadCategories);
</script>

<template>
  <div>
    <PageHeader title="درخواست‌های خدمت" description="بررسی و تأیید درخواست‌های ارائه‌دهندگان" />

    <DataTable
      ref="tableRef"
      title="درخواست‌ها"
      endpoint="/admin/service-requests"
      :columns="serviceRequestsColumns"
      :row-actions="serviceRequestsRowActions"
      advanced-filters
      default-sort="createdAt:desc"
      @row-action="onRowAction"
    />

    <UiModal v-model:open="modalOpen" title="بررسی درخواست">
      <form @submit.prevent="submitReview">
        <CrudFormShell
          :submitting="submitting"
          :error="formError"
          submit-label="ثبت نتیجه"
          @submit="submitReview"
          @cancel="modalOpen = false"
        >
          <ServiceRequestReviewForm
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
            :request="reviewingRequest"
            :categories="categories"
          />
        </CrudFormShell>
      </form>
    </UiModal>
  </div>
</template>
