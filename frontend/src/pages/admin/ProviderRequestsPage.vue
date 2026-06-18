<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  listProviderRequests,
  reviewProviderRequest,
  type ProviderRequest,
} from "@/services/providerRequest.service";
import { useZodForm } from "@/composables/useZodForm";
import { reviewProviderRequestSchema } from "@/schemas/admin/providerRequest.schema";
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

const { values, fieldError, touch, submitting, validateAll, reset } = useZodForm(
  reviewProviderRequestSchema,
  { status: "APPROVED" as const, adminNote: "" },
);

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
  reset({ status: "APPROVED", adminNote: "" });
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

  submitting.value = true;
  try {
    const data = reviewProviderRequestSchema.parse(values);
    await reviewProviderRequest(req.id, {
      status: data.status,
      adminNote: data.adminNote || undefined,
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
  <div>
    <PageHeader
      title="درخواست‌های ارائه‌دهنده"
      description="کاربرانی که درخواست فعالیت به عنوان ارائه‌دهنده داده‌اند"
    />

    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <ContentFade v-else-if="error">
      <UiAlert variant="error">{{ error }}</UiAlert>
    </ContentFade>

    <ContentFade v-else-if="!requests.length">
      <UiCard class="text-center text-[var(--color-muted)]">
        درخواست در انتظاری وجود ندارد
      </UiCard>
    </ContentFade>

    <ContentFade v-else>
      <div class="space-y-3">
        <UiCard v-for="request in requests" :key="request.id">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold">{{ request.user?.fullName ?? "کاربر" }}</h2>
              <p class="text-sm text-[var(--color-muted)]">{{ request.user?.email }}</p>
              <p v-if="request.user?.phone" class="text-sm text-[var(--color-muted)]">
                {{ request.user.phone }}
              </p>
              <p v-if="request.note" class="mt-2 text-sm">{{ request.note }}</p>
              <p class="mt-2 text-xs text-[var(--color-muted)]">
                {{ formatJalaliDateTime(request.createdAt) }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-2">
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
