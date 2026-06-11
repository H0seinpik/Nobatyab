<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPatch } from "@/services/api";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";
import SkeletonTable from "@/components/ui/skeleton/SkeletonTable.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

interface Appointment {
  id: string;
  startAt: string;
  status: string;
  user: { fullName: string } | null;
  guestFullName: string | null;
  providerService: { service: { name: string } };
}

const appointments = ref<Appointment[]>([]);
const loading = ref(true);

async function load() {
  loading.value = true;
  try {
    const res = await apiGet<Appointment[]>("/provider/appointments");
    appointments.value = res.data;
  } finally {
    loading.value = false;
  }
}

async function confirm(id: string) {
  await apiPatch(`/provider/appointments/${id}/confirm`);
  await load();
}

async function complete(id: string) {
  await apiPatch(`/provider/appointments/${id}/complete`);
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">نوبت‌ها</h1>
    <SkeletonTable v-if="loading" :columns="4" :rows="6" :show-actions="true" />
    <ContentFade v-else>
    <div class="space-y-4">
      <UiCard v-for="apt in appointments" :key="apt.id">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="font-semibold">{{ apt.providerService.service.name }}</p>
            <p class="text-sm">{{ apt.user?.fullName ?? apt.guestFullName }}</p>
            <p class="text-sm text-[var(--color-muted)]">{{ formatJalaliDateTime(apt.startAt) }}</p>
            <AppointmentStatusBadge :status="apt.status" class="mt-2" />
          </div>
          <div class="flex gap-2">
            <UiButton v-if="apt.status === 'PENDING'" @click="confirm(apt.id)">تایید</UiButton>
            <UiButton v-if="apt.status === 'CONFIRMED'" @click="complete(apt.id)">تکمیل</UiButton>
          </div>
        </div>
      </UiCard>
    </div>
    </ContentFade>
  </div>
</template>
