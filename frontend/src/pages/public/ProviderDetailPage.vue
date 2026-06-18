<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { apiGet, apiPost } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { guestBookingFormSchema } from "@/schemas/appointment.schema";
import {
  gregorianToJalaliDate,
  jalaliToGregorianDate,
  startOfWeekSaturday,
  todayGregorian,
} from "@/utils/datetime";
import { formatPersianNumber } from "@/utils/numbers";
import type { SlotDto, AvailableDaysDto } from "@/types/booking";
import { getApiErrorMessage } from "@/utils/apiError";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import WeeklyBookingCalendar from "@/components/booking/WeeklyBookingCalendar.vue";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const route = useRoute();
const auth = useAuthStore();
const providerId = route.params.id as string;

interface ProviderDetail {
  id: string;
  bio: string | null;
  slotDurationMinutes: number;
  user: { fullName: string; phone: string | null };
  providerServices: {
    id: string;
    price: string;
    duration: number;
    service: { id: string; name: string };
  }[];
}

const provider = ref<ProviderDetail | null>(null);
const selectedServiceId = ref("");
const jalaliDate = ref("");
const weekStart = ref(startOfWeekSaturday(todayGregorian()));
const slots = ref<SlotDto[]>([]);
const availableDates = ref<string[]>([]);
const selectedSlot = ref<SlotDto | null>(null);
const loading = ref(true);
const slotsLoading = ref(false);
const daysLoading = ref(false);
const booking = ref(false);
const message = ref("");
const bookingError = ref("");
const slotsError = ref("");

const {
  values: guestValues,
  fieldError,
  touch,
  validateAll,
} = useZodForm(guestBookingFormSchema, {
  guestFullName: "",
  guestPhone: "",
  guestEmail: "",
  notes: "",
});

const canBook = computed(() => {
  if (!selectedSlot.value || !selectedServiceId.value || !jalaliDate.value) return false;
  if (auth.isAuthenticated) return true;
  return guestBookingFormSchema.safeParse(guestValues).success;
});

function clearDateSelection() {
  jalaliDate.value = "";
  selectedSlot.value = null;
  slots.value = [];
}

function ensureValidDateSelection() {
  if (jalaliDate.value) {
    const selectedGregorian = jalaliToGregorianDate(jalaliDate.value);
    if (availableDates.value.includes(selectedGregorian)) {
      return;
    }
    clearDateSelection();
  }

  const first = availableDates.value[0];
  if (first) {
    jalaliDate.value = gregorianToJalaliDate(first);
  }
}

async function fetchAvailableDays() {
  if (!selectedServiceId.value) return;
  daysLoading.value = true;
  slotsError.value = "";
  try {
    const res = await apiGet<AvailableDaysDto>(`/providers/${providerId}/available-days`, {
      providerServiceId: selectedServiceId.value,
      from: weekStart.value,
      horizonDays: 7,
    });
    availableDates.value = res.data.dates;
    ensureValidDateSelection();
  } catch (e: unknown) {
    availableDates.value = [];
    clearDateSelection();
    slotsError.value = getApiErrorMessage(e, "بارگذاری تاریخ‌های قابل رزرو ناموفق بود");
  } finally {
    daysLoading.value = false;
  }
}

onMounted(async () => {
  const res = await apiGet<ProviderDetail>(`/providers/${providerId}`);
  provider.value = res.data;
  if (res.data.providerServices.length) {
    selectedServiceId.value = res.data.providerServices[0].id;
  }
  loading.value = false;
});

watch(selectedServiceId, (serviceId) => {
  if (!serviceId) return;
  clearDateSelection();
  weekStart.value = startOfWeekSaturday(todayGregorian());
});

watch([selectedServiceId, weekStart], async ([serviceId]) => {
  if (!serviceId) return;
  await fetchAvailableDays();
});

watch([selectedServiceId, jalaliDate], async () => {
  if (!selectedServiceId.value || !jalaliDate.value) {
    slots.value = [];
    slotsError.value = "";
    return;
  }
  slotsLoading.value = true;
  selectedSlot.value = null;
  slotsError.value = "";
  try {
    const date = jalaliToGregorianDate(jalaliDate.value);
    const res = await apiGet<SlotDto[]>(`/providers/${providerId}/slots`, {
      date,
      providerServiceId: selectedServiceId.value,
    });
    slots.value = res.data;
  } catch (e: unknown) {
    slots.value = [];
    slotsError.value = getApiErrorMessage(e, "بارگذاری اسلات‌ها ناموفق بود");
  } finally {
    slotsLoading.value = false;
  }
});

function onWeekChange(newWeekStart: string) {
  weekStart.value = newWeekStart;
}

async function book() {
  if (booking.value) return;

  bookingError.value = "";
  message.value = "";
  if (!selectedSlot.value || !selectedServiceId.value) {
    bookingError.value = "لطفاً تاریخ و زمان نوبت را انتخاب کنید";
    return;
  }
  if (!auth.isAuthenticated && !validateAll()) return;

  booking.value = true;
  try {
    await apiPost("/appointments", {
      providerId,
      providerServiceId: selectedServiceId.value,
      startAt: selectedSlot.value.startAt,
      notes: guestValues.notes || undefined,
      guestFullName: auth.isAuthenticated ? undefined : guestValues.guestFullName,
      guestPhone: auth.isAuthenticated ? undefined : guestValues.guestPhone,
      guestEmail: auth.isAuthenticated ? undefined : guestValues.guestEmail || undefined,
    });
    message.value = "نوبت با موفقیت ثبت شد";
    selectedSlot.value = null;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      bookingError.value = "این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید.";
    } else {
      bookingError.value = "خطا در ثبت نوبت";
    }
  } finally {
    booking.value = false;
  }
}
</script>

<template>
  <div v-if="loading" class="provider-detail-page__grid">
    <SkeletonCard />
    <SkeletonForm :fields="5" />
  </div>
  <ContentFade v-else-if="provider">
    <div class="provider-detail-page__grid">
      <UiCard>
        <h1 class="provider-detail-page__name">{{ provider.user.fullName }}</h1>
        <p class="provider-detail-page__bio">{{ provider.bio }}</p>
        <p class="provider-detail-page__slot-info">مدت هر اسلات: {{ provider.slotDurationMinutes }} دقیقه</p>

        <label class="provider-detail-page__label">انتخاب خدمت</label>
        <select v-model="selectedServiceId" class="form-control provider-detail-page__select">
          <option v-for="ps in provider.providerServices" :key="ps.id" :value="ps.id">
            {{ ps.service.name }} — {{ ps.duration }} دقیقه — {{ formatPersianNumber(Number(ps.price)) }} تومان
          </option>
        </select>
      </UiCard>

      <UiCard>
        <h2 class="provider-detail-page__booking-title">رزرو نوبت</h2>
        <WeeklyBookingCalendar
          v-model="jalaliDate"
          :available-dates="availableDates"
          :loading="daysLoading"
          :week-start="weekStart"
          class="provider-detail-page__calendar"
          @week-change="onWeekChange"
        />
        <TimeSlotGrid
          :slots="slots"
          :loading="slotsLoading"
          :has-date-selected="!!jalaliDate"
          :error-message="slotsError || undefined"
          :selected="selectedSlot?.startAt ?? null"
          class="provider-detail-page__slots"
          @select="(s) => (selectedSlot = s)"
        />

        <form class="provider-detail-page__form" @submit.prevent="book">
          <template v-if="!auth.isAuthenticated">
            <UiInput
              v-model="guestValues.guestFullName"
              label="نام"
              required
              :error="fieldError('guestFullName')"
              @blur="touch('guestFullName')"
            />
            <UiInput
              v-model="guestValues.guestPhone"
              label="موبایل"
              required
              :error="fieldError('guestPhone')"
              @blur="touch('guestPhone')"
            />
            <UiInput
              v-model="guestValues.guestEmail"
              label="ایمیل (اختیاری)"
              type="email"
              :error="fieldError('guestEmail')"
              @blur="touch('guestEmail')"
            />
          </template>

          <UiInput
            v-model="guestValues.notes"
            label="توضیحات"
            :error="fieldError('notes')"
            @blur="touch('notes')"
          />
          <p v-if="bookingError" class="provider-detail-page__error">{{ bookingError }}</p>
          <UiButton type="submit" :disabled="!canBook || booking" :loading="booking">
            ثبت نوبت
          </UiButton>
          <p v-if="message" class="provider-detail-page__success">{{ message }}</p>
        </form>
      </UiCard>
    </div>
  </ContentFade>
</template>

<style scoped>
.provider-detail-page__grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .provider-detail-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.provider-detail-page__name {
  font-size: 1.5rem;
  font-weight: 700;
}

.provider-detail-page__bio {
  margin-top: 0.5rem;
  color: var(--color-muted);
}

.provider-detail-page__slot-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.provider-detail-page__label {
  display: block;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.provider-detail-page__select {
  margin-top: 0.25rem;
}

.provider-detail-page__booking-title {
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.provider-detail-page__calendar,
.provider-detail-page__slots {
  margin-bottom: 1rem;
}

.provider-detail-page__form > * + * {
  margin-top: 0.75rem;
}

.provider-detail-page__error {
  font-size: 0.875rem;
  color: var(--color-danger);
}

.provider-detail-page__success {
  font-size: 0.875rem;
  color: var(--color-alert-success-text);
}
</style>
