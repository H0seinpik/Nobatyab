<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { apiGet, apiPost } from "@/services/api";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  paymentStatus: string;
  providerService: { service: { name: string } };
  provider: { user: { fullName: string } };
}

const route = useRoute();
const appointments = ref<Appointment[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);

const justBooked = computed(() => route.query.booked === "1");

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    const res = await apiGet<Appointment[]>("/appointments/my");
    appointments.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    loadError.value = "خطا در بارگذاری نوبت‌ها. لطفاً صفحه را رفرش کنید.";
    appointments.value = [];
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
  <div class="my-appointments-page">
    <h1 class="my-appointments-page__title">نوبت‌های من</h1>

    <UiAlert v-if="justBooked" variant="success" class="my-appointments-page__alert">
      نوبت شما با موفقیت ثبت شد.
    </UiAlert>

    <UiAlert v-if="loadError" variant="error" class="my-appointments-page__alert">{{ loadError }}</UiAlert>

    <div v-if="loading" class="my-appointments-page__list">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <ContentFade v-else-if="!appointments.length">
      <UiCard class="my-appointments-page__empty">
        <p class="my-appointments-page__empty-text">نوبتی ثبت نشده است</p>
        <RouterLink to="/smart-booking">
          <UiButton type="button">رزرو هوشمند</UiButton>
        </RouterLink>
      </UiCard>
    </ContentFade>

    <ContentFade v-else>
      <div class="my-appointments-page__list">
        <UiCard v-for="apt in appointments" :key="apt.id">
          <div class="my-appointments-page__item">
            <div>
              <h2 class="my-appointments-page__item-title">{{ apt.providerService.service.name }}</h2>
              <p class="my-appointments-page__item-provider">{{ apt.provider.user.fullName }}</p>
              <p class="my-appointments-page__item-date">{{ formatJalaliDateTime(apt.startAt) }}</p>
              <div class="my-appointments-page__badges">
                <AppointmentStatusBadge :status="apt.status" />
                <AppointmentStatusBadge kind="payment" :status="apt.paymentStatus" />
              </div>
            </div>
            <div class="my-appointments-page__item-actions">
              <UiButton
                v-if="apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'"
                variant="danger"
                @click="cancel(apt.id)"
              >
                لغو
              </UiButton>
              <UiButton
                v-if="apt.paymentStatus === 'PENDING' && apt.status !== 'CANCELLED'"
                @click="pay(apt.id)"
              >
                پرداخت
              </UiButton>
            </div>
          </div>
        </UiCard>
      </div>
    </ContentFade>
  </div>
</template>

<style scoped>
.my-appointments-page__title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.my-appointments-page__alert {
  margin-bottom: 1rem;
}

.my-appointments-page__list > * + * {
  margin-top: 1rem;
}

.my-appointments-page__empty {
  text-align: center;
}

.my-appointments-page__empty-text {
  margin-bottom: 1rem;
  color: var(--color-muted);
}

.my-appointments-page__item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.my-appointments-page__item-title {
  font-weight: 600;
}

.my-appointments-page__item-provider {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.my-appointments-page__item-date {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.my-appointments-page__badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.my-appointments-page__item-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
