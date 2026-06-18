<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { apiGet, apiPost } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { serviceRequestFormSchema } from "@/schemas/provider.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiPriceInput from "@/components/ui/UiPriceInput.vue";
import UiNumberInput from "@/components/ui/UiNumberInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import { getApiErrorMessage } from "@/utils/apiError";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

interface ServiceRequest {
  id: string;
  status: string;
  proposedName: string | null;
  adminNote: string | null;
  service: { name: string } | null;
}

const requests = ref<ServiceRequest[]>([]);
const listLoading = ref(true);

const { values, fieldError, touch, submitting, submitError, validateAll, reset } = useZodForm(
  serviceRequestFormSchema,
  {
    serviceId: "",
    proposedName: "",
    proposedDescription: "",
    proposedPrice: undefined as number | undefined,
    proposedDuration: 30,
  },
);

const isNewService = computed(() => !values.serviceId);

const canSubmit = computed(() => {
  if (values.serviceId) return true;
  return serviceRequestFormSchema.safeParse(values).success;
});

async function load() {
  listLoading.value = true;
  try {
    const res = await apiGet<ServiceRequest[]>("/provider/service-requests");
    requests.value = res.data;
  } finally {
    listLoading.value = false;
  }
}

async function submit() {
  if (!validateAll()) return;
  submitting.value = true;
  submitError.value = null;
  try {
    const data = serviceRequestFormSchema.parse(values);
    await apiPost("/provider/service-requests", {
      serviceId: data.serviceId || undefined,
      proposedName: data.serviceId ? undefined : data.proposedName,
      proposedDescription: data.serviceId ? undefined : data.proposedDescription || undefined,
      proposedPrice: data.serviceId ? undefined : data.proposedPrice,
      proposedDuration: data.serviceId ? undefined : data.proposedDuration,
    });
    reset({
      serviceId: "",
      proposedName: "",
      proposedDescription: "",
      proposedPrice: undefined,
      proposedDuration: 30,
    });
    await load();
  } catch (e) {
    submitError.value = getApiErrorMessage(e, "ارسال ناموفق بود");
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="provider-service-requests-page">
    <UiCard class="provider-service-requests-page__form-card">
      <h2 class="provider-service-requests-page__form-title">درخواست خدمت جدید</h2>
      <form class="provider-service-requests-page__form" @submit.prevent="submit">
        <UiInput
          v-model="values.serviceId"
          label="شناسه خدمت موجود (اختیاری)"
          placeholder="برای پیشنهاد خدمت جدید خالی بگذارید"
        />
        <template v-if="isNewService">
          <UiInput
            v-model="values.proposedName"
            label="نام پیشنهادی"
            required
            :error="fieldError('proposedName')"
            @blur="touch('proposedName')"
          />
          <UiInput v-model="values.proposedDescription" label="توضیحات" />
          <UiPriceInput
            :model-value="values.proposedPrice"
            label="قیمت (تومان)"
            required
            :min="0"
            :error="fieldError('proposedPrice')"
            @update:model-value="(v) => (values.proposedPrice = v)"
            @blur="touch('proposedPrice')"
          />
          <UiNumberInput
            :model-value="values.proposedDuration"
            label="مدت (دقیقه)"
            required
            :min="5"
            :error="fieldError('proposedDuration')"
            @update:model-value="(v) => (values.proposedDuration = v ?? 30)"
            @blur="touch('proposedDuration')"
          />
        </template>
        <p v-if="submitError" class="provider-service-requests-page__error">{{ submitError }}</p>
        <UiButton type="submit" :loading="submitting" :disabled="!canSubmit || submitting">
          ارسال درخواست
        </UiButton>
      </form>
    </UiCard>

    <div>
      <h2 class="provider-service-requests-page__list-title">درخواست‌های من</h2>
      <div v-if="listLoading" class="provider-service-requests-page__list">
        <SkeletonCard v-for="i in 3" :key="i" />
      </div>
      <ContentFade v-else>
        <div class="provider-service-requests-page__list">
          <UiCard v-for="r in requests" :key="r.id">
            <div class="provider-service-requests-page__item">
              <span>{{ r.service?.name ?? r.proposedName }}</span>
              <StatusBadge kind="review" :value="r.status" />
            </div>
            <p v-if="r.adminNote" class="provider-service-requests-page__note">{{ r.adminNote }}</p>
          </UiCard>
        </div>
      </ContentFade>
    </div>
  </div>
</template>

<style scoped>
.provider-service-requests-page > * + * {
  margin-top: 2rem;
}

.provider-service-requests-page__form-card {
  max-width: 32rem;
}

.provider-service-requests-page__form-card > * + * {
  margin-top: 1rem;
}

.provider-service-requests-page__form-title {
  font-weight: 600;
}

.provider-service-requests-page__form > * + * {
  margin-top: 1rem;
}

.provider-service-requests-page__error {
  font-size: 0.875rem;
  color: var(--color-danger);
}

.provider-service-requests-page__list-title {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.provider-service-requests-page__list > * + * {
  margin-top: 0.75rem;
}

.provider-service-requests-page__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.provider-service-requests-page__note {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}
</style>
