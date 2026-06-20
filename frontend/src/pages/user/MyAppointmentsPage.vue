<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { apiGet, apiPost } from "@/services/api";
import { formatJalaliDateTime } from "@/utils/datetime";
import { useToast } from "@/composables/useToast";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import EmptyState from "@/components/feedback/EmptyState.vue";
import ReviewForm from "@/components/reviews/ReviewForm.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { Calendar } from "lucide-vue-next";

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
const toast = useToast();
const appointments = ref<Appointment[]>([]);
const reviewedIds = ref<Set<string>>(new Set());
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
  try {
    await apiPost(`/appointments/${id}/cancel`, { reason: "لغو توسط کاربر" });
    toast.success("نوبت لغو شد");
    await load();
  } catch {
    toast.error("لغو نوبت ناموفق بود");
  }
}

async function pay(id: string) {
  try {
    await apiPost(`/appointments/${id}/pay`);
    toast.success("پرداخت با موفقیت انجام شد");
    await load();
  } catch {
    toast.error("پرداخت ناموفق بود");
  }
}

function onReviewSubmitted(id: string) {
  reviewedIds.value.add(id);
}

onMounted(load);
</script>

<template>
  <div class="my-appointments-page">
    <h1 class="heading-page">نوبت‌های من</h1>

    <UiAlert v-if="justBooked" variant="success" class="my-appointments-page__alert">
      نوبت شما با موفقیت ثبت شد.
    </UiAlert>

    <UiAlert v-if="loadError" variant="error" class="my-appointments-page__alert">{{ loadError }}</UiAlert>

    <div v-if="loading" class="my-appointments-page__list">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <EmptyState
      v-else-if="!appointments.length"
      :icon="Calendar"
      title="نوبتی ثبت نشده است"
      description="اولین نوبت خود را با رزرو هوشمند یا انتخاب ارائه‌دهنده ثبت کنید."
    >
      <template #action>
        <RouterLink to="/smart-booking">
          <UiButton type="button">رزرو هوشمند</UiButton>
        </RouterLink>
      </template>
    </EmptyState>

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
          <ReviewForm
            v-if="apt.status === 'COMPLETED' && !reviewedIds.has(apt.id)"
            :appointment-id="apt.id"
            @submitted="onReviewSubmitted(apt.id)"
          />
        </UiCard>
      </div>
    </ContentFade>
  </div>
</template>

<style scoped>
.my-appointments-page__alert {
  margin-bottom: var(--space-4);
}

.my-appointments-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.my-appointments-page__item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.my-appointments-page__item-title {
  font-weight: 600;
}

.my-appointments-page__item-provider {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.my-appointments-page__item-date {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
}

.my-appointments-page__badges {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.my-appointments-page__item-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
