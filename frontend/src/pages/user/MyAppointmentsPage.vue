<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "@/services/api";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  paymentStatus: string;
  providerService: { service: { name: string } };
  provider: { user: { fullName: string } };
}

const appointments = ref<Appointment[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const res = await apiGet<Appointment[]>("/appointments/my");
    appointments.value = res.data;
  } finally {
    loading.value = false;
  }
}

async function cancel(id: string) {
  await apiPost(`/appointments/${id}/cancel`, { reason: "لغو توسط کاربر" });
  await load();
}

async function pay(id: string) {
  await apiPost(`/appointments/${id}/pay`);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">نوبت‌های من</h1>
    <p v-if="loading" class="text-[var(--color-muted)]">در حال بارگذاری...</p>
    <div v-else-if="!appointments.length" class="text-[var(--color-muted)]">نوبتی ثبت نشده است</div>
    <div v-else class="space-y-4">
      <UiCard v-for="apt in appointments" :key="apt.id">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="font-semibold">{{ apt.providerService.service.name }}</h2>
            <p class="text-sm text-[var(--color-muted)]">{{ apt.provider.user.fullName }}</p>
            <p class="mt-2 text-sm">{{ formatJalaliDateTime(apt.startAt) }}</p>
            <div class="mt-2 flex gap-2">
              <AppointmentStatusBadge :status="apt.status" />
              <AppointmentStatusBadge :status="apt.paymentStatus" />
            </div>
          </div>
          <div class="flex gap-2">
            <UiButton
              v-if="apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'"
              variant="danger"
              @click="cancel(apt.id)"
            >
              لغو
            </UiButton>
            <UiButton v-if="apt.paymentStatus === 'PENDING' && apt.status !== 'CANCELLED'" @click="pay(apt.id)">
              پرداخت
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>
