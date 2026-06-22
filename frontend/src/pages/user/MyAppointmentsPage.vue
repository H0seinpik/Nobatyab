<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { apiPost } from "@/services/api";
import {
  getUserAppointments,
  type DashboardAppointment,
} from "@/services/user.service";
import { cancelAppointment } from "@/services/appointment.service";
import { formatJalaliDateTime } from "@/utils/datetime";
import { formatPersianNumber } from "@/utils/numbers";
import { getApiErrorMessage } from "@/utils/apiError";
import { useToast } from "@/composables/useToast";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import EmptyState from "@/components/feedback/EmptyState.vue";
import ReviewForm from "@/components/reviews/ReviewForm.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import NetworkErrorState from "@/components/feedback/NetworkErrorState.vue";
import { Calendar } from "lucide-vue-next";

type TabKey = "upcoming" | "completed" | "cancelled";

const route = useRoute();
const toast = useToast();
const upcoming = ref<DashboardAppointment[]>([]);
const completed = ref<DashboardAppointment[]>([]);
const cancelled = ref<DashboardAppointment[]>([]);
const reviewedIds = ref<Set<string>>(new Set());
const expandedId = ref<string | null>(null);
const activeTab = ref<TabKey>("upcoming");
const loading = ref(true);
const loadError = ref<string | null>(null);
const actionLoading = ref<string | null>(null);

const justBooked = computed(() => route.query.booked === "1");

const tabs: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "آینده" },
  { key: "completed", label: "انجام‌شده" },
  { key: "cancelled", label: "لغو‌شده" },
];

const activeAppointments = computed(() => {
  if (activeTab.value === "completed") return completed.value;
  if (activeTab.value === "cancelled") return cancelled.value;
  return upcoming.value;
});

const isEmpty = computed(
  () => !upcoming.value.length && !completed.value.length && !cancelled.value.length,
);

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    const data = await getUserAppointments();
    upcoming.value = data.upcoming;
    completed.value = data.completed;
    cancelled.value = data.cancelled ?? [];
  } catch (e: unknown) {
    loadError.value = getApiErrorMessage(e, "خطا در بارگذاری نوبت‌ها");
    upcoming.value = [];
    completed.value = [];
    cancelled.value = [];
  } finally {
    loading.value = false;
  }
}

async function cancel(id: string) {
  if (actionLoading.value) return;
  actionLoading.value = id;
  try {
    await cancelAppointment(id, "لغو توسط کاربر");
    toast.success("نوبت لغو شد");
    await load();
  } catch (e: unknown) {
    toast.error(getApiErrorMessage(e, "لغو نوبت ناموفق بود"));
  } finally {
    actionLoading.value = null;
  }
}

async function pay(id: string) {
  if (actionLoading.value) return;
  actionLoading.value = id;
  try {
    await apiPost(`/appointments/${id}/pay`);
    toast.success("پرداخت با موفقیت انجام شد");
    await load();
  } catch (e: unknown) {
    toast.error(getApiErrorMessage(e, "پرداخت ناموفق بود"));
  } finally {
    actionLoading.value = null;
  }
}

function onReviewSubmitted(id: string) {
  reviewedIds.value.add(id);
}

function toggleDetails(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

onMounted(load);
</script>

<template>
  <div class="my-appointments-page">
    <h1 class="heading-page">نوبت‌های من</h1>

    <UiAlert v-if="justBooked" variant="success" class="my-appointments-page__alert">
      نوبت شما با موفقیت ثبت شد.
    </UiAlert>

    <NetworkErrorState
      v-if="loadError && !loading"
      :description="loadError"
      @retry="load"
    />

    <div v-if="!loadError" class="my-appointments-page__tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="my-appointments-page__tab"
        :class="{ 'my-appointments-page__tab--active': activeTab === tab.key }"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="my-appointments-page__list">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <EmptyState
      v-else-if="isEmpty"
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

    <EmptyState
      v-else-if="!activeAppointments.length"
      :icon="Calendar"
      :title="`نوبت ${tabs.find((t) => t.key === activeTab)?.label ?? ''}ی وجود ندارد`"
      description="در تب‌های دیگر نوبت‌های خود را مشاهده کنید."
    />

    <ContentFade v-else>
      <div class="my-appointments-page__list">
        <UiCard v-for="apt in activeAppointments" :key="apt.id">
          <div class="my-appointments-page__item">
            <div class="my-appointments-page__item-main">
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
                v-if="apt.actions?.viewDetails.enabled"
                variant="secondary"
                @click="toggleDetails(apt.id)"
              >
                {{ expandedId === apt.id ? "بستن جزئیات" : "جزئیات" }}
              </UiButton>
              <UiButton
                v-if="apt.actions?.cancel"
                variant="danger"
                :disabled="!apt.actions.cancel.enabled || actionLoading === apt.id"
                :title="apt.actions.cancel.reason"
                @click="cancel(apt.id)"
              >
                لغو
              </UiButton>
              <UiButton
                v-if="apt.actions?.pay"
                :disabled="!apt.actions.pay.enabled || actionLoading === apt.id"
                :title="apt.actions.pay.reason"
                @click="pay(apt.id)"
              >
                پرداخت
              </UiButton>
            </div>
          </div>

          <div v-if="expandedId === apt.id" class="my-appointments-page__details">
            <p v-if="apt.providerService.price != null">
              <span class="my-appointments-page__detail-label">هزینه:</span>
              {{ formatPersianNumber(Number(apt.providerService.price)) }} تومان
            </p>
            <p v-if="apt.notes">
              <span class="my-appointments-page__detail-label">یادداشت:</span>
              {{ apt.notes }}
            </p>
            <p v-if="apt.cancellationPolicy?.description">
              <span class="my-appointments-page__detail-label">سیاست لغو:</span>
              {{ apt.cancellationPolicy.description }}
            </p>
            <p v-else-if="apt.cancellationPolicy?.minHoursBefore != null">
              <span class="my-appointments-page__detail-label">مهلت لغو:</span>
              حداقل {{ formatPersianNumber(apt.cancellationPolicy.minHoursBefore) }} ساعت قبل از نوبت
            </p>
          </div>

          <ReviewForm
            v-if="apt.actions?.review?.enabled && !reviewedIds.has(apt.id)"
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

.my-appointments-page__tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.my-appointments-page__tab {
  padding: var(--space-2) var(--space-4);
  border: none;
  background: none;
  font: inherit;
  color: var(--color-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.my-appointments-page__tab--active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
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

.my-appointments-page__item-main {
  flex: 1;
  min-width: 0;
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
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.my-appointments-page__item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.my-appointments-page__details {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
  font-size: var(--text-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.my-appointments-page__detail-label {
  font-weight: 600;
  margin-inline-end: var(--space-2);
}
</style>
