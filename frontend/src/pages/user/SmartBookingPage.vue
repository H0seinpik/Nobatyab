<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  useSmartBookingStore,
  STEP_AVAILABILITY,
  STEP_SERVICE,
  STEP_PREFERENCES,
  STEP_SUGGESTIONS,
} from "@/stores/smartBooking";
import type { AvailabilityEntry } from "@/types/smartBooking";
import SmartBookingStepper from "@/components/smart-booking/SmartBookingStepper.vue";
import AvailabilityScheduler from "@/components/smart-booking/AvailabilityScheduler.vue";
import ServiceSelector from "@/components/smart-booking/ServiceSelector.vue";
import SuggestionList from "@/components/smart-booking/SuggestionList.vue";
import BookingConfirmationModal from "@/components/smart-booking/BookingConfirmationModal.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiCard from "@/components/ui/UiCard.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";

const router = useRouter();
const store = useSmartBookingStore();
const confirmOpen = ref(false);

onMounted(() => {
  store.initWizard();
});

function onAvailabilityChange(entries: AvailabilityEntry[]) {
  store.syncAvailabilityEntries(entries);
}

async function onSaveAvailability(entries: Omit<AvailabilityEntry, "id">[]) {
  if (entries.length === 0) {
    store.error = "لطفاً حداقل یک بازه زمانی اضافه کنید";
    return;
  }
  try {
    await store.saveAvailability(entries);
  } catch {
    // error set in store
  }
}

function onServiceSelect(service: Parameters<typeof store.selectService>[0]) {
  store.selectService(service);
}

async function onFindSuggestions() {
  await store.fetchSuggestions();
}

async function onSelectSuggestion(suggestion: Parameters<typeof store.selectSuggestion>[0]) {
  store.selectSuggestion(suggestion);
  confirmOpen.value = true;
}

async function onConfirm() {
  const result = await store.confirmSelected(store.selectedSuggestion);
  if (result === "ok") {
    confirmOpen.value = false;
    store.reset();
    await router.push({ path: "/appointments", query: { booked: "1" } });
    return;
  }
  if (result === "conflict") {
    confirmOpen.value = false;
  }
}

function onCancelConfirm() {
  store.clearSelectedSuggestion();
}
</script>

<template>
  <div>
    <h1 class="mb-2 text-2xl font-bold">رزرو هوشمند</h1>
    <p class="mb-6 text-sm text-[var(--color-muted)]">
      ابتدا زمان‌های آزاد خود را مشخص کنید، سپس بهترین نوبت را دریافت کنید.
    </p>

    <div v-if="store.initializing" class="mb-6">
      <SkeletonForm :fields="3" />
    </div>

    <template v-else>
      <SmartBookingStepper :step="store.step" />

      <!-- Step 1: Availability -->
      <div v-if="store.step === STEP_AVAILABILITY">
        <UiAlert variant="info" class="mb-4">
          برای پیشنهاد هوشمند، روزها و ساعاتی که می‌توانید نوبت بگیرید را وارد کنید.
        </UiAlert>
        <UiAlert v-if="store.error" variant="error" class="mb-4">{{ store.error }}</UiAlert>
        <AvailabilityScheduler
          :initial-entries="store.availabilityEntries"
          :require-at-least-one="true"
          @change="onAvailabilityChange"
          @save="onSaveAvailability"
        />
      </div>

      <!-- Step 2: Service -->
      <div v-else-if="store.step === STEP_SERVICE">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold">خدمت مورد نظر را انتخاب کنید</h2>
          <UiButton variant="secondary" @click="store.goToStep(STEP_AVAILABILITY)">
            ویرایش زمان‌های آزاد
          </UiButton>
        </div>
        <UiAlert v-if="store.error" variant="error" class="mb-4">{{ store.error }}</UiAlert>
        <ServiceSelector @select="onServiceSelect" />
      </div>

      <!-- Step 3: Preferences -->
      <div v-else-if="store.step === STEP_PREFERENCES">
        <UiCard class="mb-6 max-w-lg space-y-4">
          <h2 class="text-lg font-semibold">ترجیحات</h2>

          <div v-if="store.selectedService" class="text-sm text-[var(--color-muted)]">
            خدمت انتخاب‌شده:
            <strong class="text-[var(--color-text)]">{{ store.selectedService.name }}</strong>
          </div>

          <fieldset class="space-y-2">
            <legend class="mb-2 text-sm font-medium">اولویت پیشنهاد</legend>
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="store.preference"
                type="radio"
                value="time"
                class="accent-[var(--color-primary)]"
              />
              <span>نزدیک‌ترین زمان</span>
            </label>
            <label class="flex cursor-pointer items-center gap-2">
              <input
                v-model="store.preference"
                type="radio"
                value="location"
                class="accent-[var(--color-primary)]"
              />
              <span>نزدیک‌ترین ارائه‌دهنده</span>
            </label>
          </fieldset>

          <div class="grid gap-4 sm:grid-cols-2">
            <UiInput
              :model-value="store.priceMin != null ? String(store.priceMin) : ''"
              label="حداقل قیمت (تومان)"
              type="number"
              placeholder="اختیاری"
              @update:model-value="store.priceMin = $event ? Number($event) : null"
            />
            <UiInput
              :model-value="store.priceMax != null ? String(store.priceMax) : ''"
              label="حداکثر قیمت (تومان)"
              type="number"
              placeholder="اختیاری"
              @update:model-value="store.priceMax = $event ? Number($event) : null"
            />
          </div>
        </UiCard>

        <UiAlert v-if="store.error" variant="error" class="mb-4">{{ store.error }}</UiAlert>

        <div class="flex flex-wrap gap-2">
          <UiButton variant="secondary" @click="store.goToStep(STEP_SERVICE)">بازگشت</UiButton>
          <UiButton :loading="store.loading" @click="onFindSuggestions">مشاهده پیشنهادها</UiButton>
        </div>
      </div>

      <!-- Step 4: Suggestions -->
      <div v-else-if="store.step === STEP_SUGGESTIONS">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold">پیشنهادهای رزرو</h2>
          <UiButton variant="secondary" @click="store.goToStep(STEP_PREFERENCES)">
            تغییر ترجیحات
          </UiButton>
        </div>

        <SuggestionList
          :suggestions="store.enrichedSuggestions"
          :loading="store.loading"
          :empty-message="store.emptyMessage"
          :price-filter-empty="store.priceFilterEmpty"
          :error="store.error"
          @select="onSelectSuggestion"
          @retry="store.fetchSuggestions"
        />
      </div>
    </template>

    <BookingConfirmationModal
      v-model:open="confirmOpen"
      :suggestion="store.selectedSuggestion"
      :loading="store.confirming"
      :error="store.confirmError"
      @confirm="onConfirm"
      @cancel="onCancelConfirm"
    />
  </div>
</template>
