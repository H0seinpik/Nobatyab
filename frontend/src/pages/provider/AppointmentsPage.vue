<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { apiGet, apiPatch } from "@/services/api";
import { cancelAppointment, isAppointmentCancellable } from "@/services/appointment.service";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiConfirmDialog from "@/components/ui/UiConfirmDialog.vue";
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
const confirmOpen = ref(false);
const cancelling = ref(false);
const cancelTarget = ref<Appointment | null>(null);
const cancelError = ref("");

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

function openCancel(apt: Appointment) {
  cancelTarget.value = apt;
  cancelError.value = "";
  confirmOpen.value = true;
}

async function onConfirmCancel() {
  if (!cancelTarget.value || cancelling.value) return;

  cancelling.value = true;
  cancelError.value = "";
  try {
    await cancelAppointment(cancelTarget.value.id, "لغو توسط ارائه‌دهنده");
    confirmOpen.value = false;
    cancelTarget.value = null;
    await load();
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 400) {
      const msg = (e.response?.data as { error?: { message?: string } })?.error?.message ?? "";
      cancelError.value = msg.includes("past")
        ? "نوبت گذشته قابل لغو نیست."
        : "این نوبت قابل لغو نیست.";
    } else {
      cancelError.value = "لغو نوبت ناموفق بود.";
    }
  } finally {
    cancelling.value = false;
  }
}

function onCancelDialog() {
  if (!cancelling.value) {
    cancelTarget.value = null;
    cancelError.value = "";
  }
}

onMounted(load);
</script>

<template>
  <div class="provider-appointments-page">
    <h1 class="provider-appointments-page__title">نوبت‌ها</h1>
    <SkeletonTable v-if="loading" :columns="4" :rows="6" :show-actions="true" />
    <ContentFade v-else>
      <div class="provider-appointments-page__list">
        <UiCard v-for="apt in appointments" :key="apt.id">
          <div class="provider-appointments-page__item">
            <div>
              <p class="provider-appointments-page__item-name">{{ apt.providerService.service.name }}</p>
              <p class="provider-appointments-page__item-guest">{{ apt.user?.fullName ?? apt.guestFullName }}</p>
              <p class="provider-appointments-page__item-date">{{ formatJalaliDateTime(apt.startAt) }}</p>
              <AppointmentStatusBadge :status="apt.status" class="provider-appointments-page__badge" />
            </div>
            <div class="provider-appointments-page__item-actions">
              <UiButton v-if="apt.status === 'PENDING'" @click="confirm(apt.id)">تایید</UiButton>
              <UiButton v-if="apt.status === 'CONFIRMED'" @click="complete(apt.id)">تکمیل</UiButton>
              <UiButton
                v-if="isAppointmentCancellable(apt)"
                variant="danger"
                :disabled="cancelling"
                @click="openCancel(apt)"
              >
                لغو
              </UiButton>
            </div>
          </div>
        </UiCard>
      </div>
    </ContentFade>

    <UiConfirmDialog
      v-model:open="confirmOpen"
      title="لغو نوبت"
      message="آیا از لغو این نوبت اطمینان دارید؟"
      variant="danger"
      confirm-label="لغو نوبت"
      :loading="cancelling"
      @confirm="onConfirmCancel"
      @cancel="onCancelDialog"
    />
    <p v-if="cancelError" class="provider-appointments-page__error">{{ cancelError }}</p>
  </div>
</template>

<style scoped>
.provider-appointments-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.provider-appointments-page__list > * + * {
  margin-top: 1rem;
}

.provider-appointments-page__item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.provider-appointments-page__item-name {
  font-weight: 600;
}

.provider-appointments-page__item-guest {
  font-size: 0.875rem;
}

.provider-appointments-page__item-date {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.provider-appointments-page__badge {
  margin-top: 0.5rem;
}

.provider-appointments-page__item-actions {
  display: flex;
  gap: 0.5rem;
}

.provider-appointments-page__error {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-danger);
}
</style>
