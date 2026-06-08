<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet } from "@/services/api";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";

interface Appointment {
  id: string;
  startAt: string;
  status: string;
  paymentStatus: string;
  provider: { user: { fullName: string } };
  providerService: { service: { name: string } };
}

const appointments = ref<Appointment[]>([]);

onMounted(async () => {
  const res = await apiGet<Appointment[]>("/admin/appointments");
  appointments.value = res.data;
});
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">همه نوبت‌ها</h1>
    <div class="space-y-3">
      <UiCard v-for="apt in appointments" :key="apt.id">
        <p class="font-semibold">{{ apt.providerService.service.name }}</p>
        <p class="text-sm">{{ apt.provider.user.fullName }}</p>
        <p class="text-sm text-[var(--color-muted)]">{{ formatJalaliDateTime(apt.startAt) }}</p>
        <div class="mt-2 flex gap-2">
          <AppointmentStatusBadge :status="apt.status" />
          <AppointmentStatusBadge :status="apt.paymentStatus" />
        </div>
      </UiCard>
    </div>
  </div>
</template>
