<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  listProviderRequests,
  reviewProviderRequest,
  type ProviderRequest,
} from "@/services/providerRequest.service";
import { useZodForm } from "@/composables/useZodForm";
import {
  reviewProviderRequestSchema,
  slugifyCategoryName,
} from "@/schemas/admin/providerRequest.schema";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiCard from "@/components/ui/UiCard.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiModal from "@/components/ui/UiModal.vue";
import CrudFormShell from "@/components/forms/CrudFormShell.vue";
import ProviderRequestReviewForm from "@/components/forms/admin/ProviderRequestReviewForm.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { formatJalaliDateTime } from "@/utils/datetime";
import { getApiErrorMessage } from "@/utils/apiError";

const requests = ref<ProviderRequest[]>([]);
const loading = ref(true);
const error = ref("");
const modalOpen = ref(false);
const reviewingRequest = ref<ProviderRequest | null>(null);
const formError = ref<string | null>(null);

const reviewFormInitial = {
  status: "APPROVED" as const,
  adminNote: "",
  categoryName: "",
  categorySlug: "",
  categoryDescription: "",
};

const { values, fieldError, touch, submitting, validateAll, reset } = useZodForm(
  reviewProviderRequestSchema,
  reviewFormInitial,
);

function requestCategoryLabel(request: ProviderRequest) {
  if (request.category?.name) return request.category.name;
  if (request.proposedCategoryName) return `${request.proposedCategoryName} (پیشنهادی)`;
  return "—";
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    requests.value = await listProviderRequests("PENDING");
  } catch (e: unknown) {
    error.value = getApiErrorMessage(e, "بارگذاری درخواست‌ها ناموفق بود.");
    requests.value = [];
  } finally {
    loading.value = false;
  }
}

function openReview(request: ProviderRequest) {
  if (request.status !== "PENDING") return;
  reviewingRequest.value = request;
  formError.value = null;
  const proposedName = request.proposedCategoryName ?? "";
  reset({
    status: "APPROVED",
    adminNote: "",
    categoryName: proposedName,
    categorySlug: slugifyCategoryName(proposedName),
    categoryDescription: request.proposedCategoryDescription ?? "",
  });
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
    await load();
    return;
  }

  const data = reviewProviderRequestSchema.parse(values);

  if (data.status === "APPROVED" && !req.categoryId) {
    if (!data.categoryName?.trim() || !data.categorySlug?.trim()) {
      formError.value = "نام و شناسه URL دسته‌بندی برای تأیید الزامی است";
      return;
    }
  }

  submitting.value = true;
  try {
    await reviewProviderRequest(req.id, {
      status: data.status,
      adminNote: data.adminNote || undefined,
      categoryName: data.status === "APPROVED" && !req.categoryId ? data.categoryName : undefined,
      categorySlug: data.status === "APPROVED" && !req.categoryId ? data.categorySlug : undefined,
      categoryDescription:
        data.status === "APPROVED" && !req.categoryId ? data.categoryDescription || undefined : undefined,
    });
    modalOpen.value = false;
    reviewingRequest.value = null;
    await load();
  } catch (e) {
    formError.value = getApiErrorMessage(e, "خطا در بررسی درخواست");
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="provider-requests-page">
    <PageHeader
      title="درخواست‌های ارائه‌دهنده"
      description="کاربرانی که درخواست فعالیت به عنوان ارائه‌دهنده داده‌اند"
    />

    <div v-if="loading" class="provider-requests-page__list">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <ContentFade v-else-if="error">
      <UiAlert variant="error">{{ error }}</UiAlert>
    </ContentFade>

    <ContentFade v-else-if="!requests.length">
      <UiCard class="provider-requests-page__empty">
        درخواست در انتظاری وجود ندارد
      </UiCard>
    </ContentFade>

    <ContentFade v-else>
      <div class="provider-requests-page__list">
        <UiCard v-for="request in requests" :key="request.id">
          <div class="provider-requests-page__item">
            <div>
              <h2 class="provider-requests-page__item-name">{{ request.user?.fullName ?? "کاربر" }}</h2>
              <p class="provider-requests-page__item-meta">{{ request.user?.email }}</p>
              <p v-if="request.user?.phone" class="provider-requests-page__item-meta">
                {{ request.user.phone }}
              </p>
              <p class="provider-requests-page__item-note">
                <strong>دسته:</strong> {{ requestCategoryLabel(request) }}
              </p>
              <p class="provider-requests-page__item-note">
                <strong>خدمت:</strong> {{ request.proposedServiceName }} —
                {{ request.proposedServicePrice }} تومان / {{ request.proposedServiceDuration }} دقیقه
              </p>
              <p v-if="request.note" class="provider-requests-page__item-note">{{ request.note }}</p>
              <p class="provider-requests-page__item-date">
                {{ formatJalaliDateTime(request.createdAt) }}
              </p>
            </div>
            <div class="provider-requests-page__item-actions">
              <StatusBadge kind="review" :value="request.status" />
              <UiButton v-if="request.status === 'PENDING'" @click="openReview(request)">
                بررسی
              </UiButton>
            </div>
          </div>
        </UiCard>
      </div>
    </ContentFade>

    <UiModal v-model:open="modalOpen" title="بررسی درخواست ارائه‌دهنده">
      <form @submit.prevent="submitReview">
        <CrudFormShell
          :submitting="submitting"
          :error="formError"
          submit-label="ثبت نتیجه"
          @submit="submitReview"
          @cancel="modalOpen = false"
        >
          <ProviderRequestReviewForm
            :values="values"
            :field-error="(f) => fieldError(f as keyof typeof values)"
            :touch="(f) => touch(f as keyof typeof values)"
            :request="reviewingRequest"
          />
        </CrudFormShell>
      </form>
    </UiModal>
  </div>
</template>

<style scoped>
.provider-requests-page__list > * + * {
  margin-top: 0.75rem;
}

.provider-requests-page__empty {
  text-align: center;
  color: var(--color-muted);
}

.provider-requests-page__item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.provider-requests-page__item-name {
  font-weight: 600;
}

.provider-requests-page__item-meta {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.provider-requests-page__item-note {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.provider-requests-page__item-date {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.provider-requests-page__item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}
</style>
