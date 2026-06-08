<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";

interface ServiceRequest {
  id: string;
  status: string;
  proposedName: string | null;
  adminNote: string | null;
  service: { name: string } | null;
}

const requests = ref<ServiceRequest[]>([]);
const serviceId = ref("");
const proposedName = ref("");
const proposedDescription = ref("");
const proposedPrice = ref("");
const proposedDuration = ref("30");
const loading = ref(false);
const error = ref("");

async function load() {
  const res = await apiGet<ServiceRequest[]>("/provider/service-requests");
  requests.value = res.data;
}

async function submit() {
  loading.value = true;
  error.value = "";
  try {
    await apiPost("/provider/service-requests", {
      serviceId: serviceId.value || undefined,
      proposedName: proposedName.value || undefined,
      proposedDescription: proposedDescription.value || undefined,
      proposedPrice: serviceId.value ? undefined : Number(proposedPrice.value),
      proposedDuration: serviceId.value ? undefined : Number(proposedDuration.value),
    });
    serviceId.value = "";
    proposedName.value = "";
    proposedDescription.value = "";
    proposedPrice.value = "";
    proposedDuration.value = "30";
    await load();
  } catch {
    error.value = "ارسال ناموفق — برای خدمت جدید نام، قیمت و مدت الزامی است";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-8">
    <UiCard class="max-w-lg space-y-4">
      <h2 class="font-semibold">درخواست خدمت جدید</h2>
      <UiInput v-model="serviceId" label="شناسه خدمت موجود (اختیاری)" />
      <template v-if="!serviceId">
        <UiInput v-model="proposedName" label="نام پیشنهادی" required />
        <UiInput v-model="proposedDescription" label="توضیحات" />
        <UiInput v-model="proposedPrice" label="قیمت (تومان)" type="number" />
        <UiInput v-model="proposedDuration" label="مدت (دقیقه)" type="number" />
      </template>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <UiButton :loading="loading" @click="submit">ارسال درخواست</UiButton>
    </UiCard>

    <div>
      <h2 class="mb-4 text-xl font-bold">درخواست‌های من</h2>
      <div class="space-y-3">
        <UiCard v-for="r in requests" :key="r.id">
          <div class="flex items-center justify-between">
            <span>{{ r.service?.name ?? r.proposedName }}</span>
            <UiBadge>{{ r.status }}</UiBadge>
          </div>
          <p v-if="r.adminNote" class="mt-2 text-sm text-[var(--color-muted)]">{{ r.adminNote }}</p>
        </UiCard>
      </div>
    </div>
  </div>
</template>
