<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { apiGet, apiPost } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { serviceRequestFormSchema } from "@/schemas/provider.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
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
    await apiPost("/provider/service-requests", {
      serviceId: values.serviceId || undefined,
      proposedName: values.serviceId ? undefined : values.proposedName,
      proposedDescription: values.serviceId ? undefined : values.proposedDescription || undefined,
      proposedPrice: values.serviceId ? undefined : values.proposedPrice,
      proposedDuration: values.serviceId ? undefined : values.proposedDuration,
    });
    reset({
      serviceId: "",
      proposedName: "",
      proposedDescription: "",
      proposedPrice: undefined,
      proposedDuration: 30,
    });
    await load();
  } catch {
    submitError.value = "ارسال ناموفق بود";
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-8">
    <UiCard class="max-w-lg space-y-4">
      <h2 class="font-semibold">درخواست خدمت جدید</h2>
      <form class="space-y-4" @submit.prevent="submit">
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
          <UiInput
            v-model="values.proposedPrice"
            label="قیمت (تومان)"
            type="number"
            required
            :error="fieldError('proposedPrice')"
            @blur="touch('proposedPrice')"
          />
          <UiInput
            v-model="values.proposedDuration"
            label="مدت (دقیقه)"
            type="number"
            required
            :error="fieldError('proposedDuration')"
            @blur="touch('proposedDuration')"
          />
        </template>
        <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
        <UiButton type="submit" :loading="submitting" :disabled="!canSubmit || submitting">
          ارسال درخواست
        </UiButton>
      </form>
    </UiCard>

    <div>
      <h2 class="mb-4 text-xl font-bold">درخواست‌های من</h2>
      <div v-if="listLoading" class="space-y-3">
        <SkeletonCard v-for="i in 3" :key="i" />
      </div>
      <ContentFade v-else>
        <div class="space-y-3">
          <UiCard v-for="r in requests" :key="r.id">
            <div class="flex items-center justify-between">
              <span>{{ r.service?.name ?? r.proposedName }}</span>
              <UiBadge>{{ r.status }}</UiBadge>
            </div>
            <p v-if="r.adminNote" class="mt-2 text-sm text-[var(--color-muted)]">{{ r.adminNote }}</p>
          </UiCard>
        </div>
      </ContentFade>
    </div>
  </div>
</template>
