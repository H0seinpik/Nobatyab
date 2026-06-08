<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { apiGet, apiPost } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { jalaliToGregorianDate } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import JalaliDatePicker from "@/components/booking/JalaliDatePicker.vue";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid.vue";

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
const guestFullName = ref("");
const guestPhone = ref("");
const guestEmail = ref("");
const notes = ref("");
const message = ref("");

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
  if (!selectedSlot.value || !selectedServiceId.value) return;
  booking.value = true;
  message.value = "";
  try {
    await apiPost("/appointments", {
      providerId,
      providerServiceId: selectedServiceId.value,
      startAt: selectedSlot.value.startAt,
      notes: notes.value || undefined,
      guestFullName: auth.isAuthenticated ? undefined : guestFullName.value,
      guestPhone: auth.isAuthenticated ? undefined : guestPhone.value,
      guestEmail: auth.isAuthenticated ? undefined : guestEmail.value || undefined,
    });
    message.value = "نوبت با موفقیت ثبت شد";
    selectedSlot.value = null;
  } catch {
    message.value = "خطا در ثبت نوبت";
  } finally {
    booking.value = false;
  }
}
</script>

<template>
  <div v-if="loading" class="text-[var(--color-muted)]">در حال بارگذاری...</div>
  <div v-else-if="provider" class="grid gap-6 lg:grid-cols-2">
    <UiCard>
      <h1 class="text-2xl font-bold">{{ provider.user.fullName }}</h1>
      <p class="mt-2 text-[var(--color-muted)]">{{ provider.bio }}</p>
      <p class="mt-2 text-sm">مدت هر اسلات: {{ provider.slotDurationMinutes }} دقیقه</p>

      <label class="mt-4 block text-sm text-[var(--color-muted)]">انتخاب خدمت</label>
      <select
        v-model="selectedServiceId"
        class="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
      >
        <option v-for="ps in provider.providerServices" :key="ps.id" :value="ps.id">
          {{ ps.service.name }} — {{ Number(ps.price).toLocaleString("fa-IR") }} تومان
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

      <template v-if="!auth.isAuthenticated">
        <UiInput v-model="guestFullName" label="نام" class="mb-2" />
        <UiInput v-model="guestPhone" label="موبایل" class="mb-2" />
        <UiInput v-model="guestEmail" label="ایمیل (اختیاری)" class="mb-2" />
      </template>

      <UiInput v-model="notes" label="توضیحات" class="mb-4" />
      <UiButton :disabled="!selectedSlot" :loading="booking" @click="book">ثبت نوبت</UiButton>
      <p v-if="message" class="mt-3 text-sm text-green-600">{{ message }}</p>
    </UiCard>
  </div>
</template>
