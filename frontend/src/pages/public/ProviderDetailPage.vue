<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { apiGet, apiPost } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useZodForm } from "@/composables/useZodForm";
import { guestBookingFormSchema } from "@/schemas/appointment.schema";
import { jalaliToGregorianDate } from "@/utils/datetime";
import { formatPersianNumber } from "@/utils/numbers";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import JalaliDatePicker from "@/components/booking/JalaliDatePicker.vue";
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
const slots = ref<{ startAt: string; endAt: string }[]>([]);
const selectedSlot = ref<{ startAt: string; endAt: string } | null>(null);
const loading = ref(true);
const slotsLoading = ref(false);
const booking = ref(false);
const message = ref("");
const bookingError = ref("");

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

onMounted(async () => {
  const res = await apiGet<ProviderDetail>(`/providers/${providerId}`);
  provider.value = res.data;
  if (res.data.providerServices.length) {
    selectedServiceId.value = res.data.providerServices[0].id;
  }
  loading.value = false;
});

watch([selectedServiceId, jalaliDate], async () => {
  if (!selectedServiceId.value || !jalaliDate.value) return;
  slotsLoading.value = true;
  selectedSlot.value = null;
  try {
    const date = jalaliToGregorianDate(jalaliDate.value);
    const res = await apiGet<{ startAt: string; endAt: string }[]>(`/providers/${providerId}/slots`, {
      date,
      providerServiceId: selectedServiceId.value,
    });
    slots.value = res.data;
  } catch {
    slots.value = [];
  } finally {
    slotsLoading.value = false;
  }
});

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
  <div v-if="loading" class="grid gap-6 lg:grid-cols-2">
    <SkeletonCard />
    <SkeletonForm :fields="5" />
  </div>
  <ContentFade v-else-if="provider">
    <div class="grid gap-6 lg:grid-cols-2">
      <UiCard>
        <h1 class="text-2xl font-bold">{{ provider.user.fullName }}</h1>
        <p class="mt-2 text-[var(--color-muted)]">{{ provider.bio }}</p>
        <p class="mt-2 text-sm">مدت هر اسلات: {{ provider.slotDurationMinutes }} دقیقه</p>

        <label class="mt-4 block text-sm text-[var(--color-muted)]">انتخاب خدمت</label>
        <select
          v-model="selectedServiceId"
          class="form-control mt-1"
        >
          <option v-for="ps in provider.providerServices" :key="ps.id" :value="ps.id">
            {{ ps.service.name }} — {{ formatPersianNumber(Number(ps.price)) }} تومان
          </option>
        </select>
      </UiCard>

      <UiCard>
        <h2 class="mb-4 text-lg font-semibold">رزرو نوبت</h2>
        <JalaliDatePicker v-model="jalaliDate" class="mb-4" />
        <TimeSlotGrid
          :slots="slots"
          :loading="slotsLoading"
          :selected="selectedSlot?.startAt ?? null"
          class="mb-4"
          @select="(s) => (selectedSlot = s)"
        />

        <form class="space-y-3" @submit.prevent="book">
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
          <p v-if="bookingError" class="text-sm text-red-600">{{ bookingError }}</p>
          <UiButton type="submit" :disabled="!canBook || booking" :loading="booking">
            ثبت نوبت
          </UiButton>
          <p v-if="message" class="text-sm text-green-600">{{ message }}</p>
        </form>
      </UiCard>
    </div>
  </ContentFade>
</template>
