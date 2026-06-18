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
import UiPriceInput from "@/components/ui/UiPriceInput.vue";
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
  <div class="smart-booking-page">
    <h1 class="smart-booking-page__title">رزرو هوشمند</h1>
    <p class="smart-booking-page__description">
      ابتدا زمان‌های آزاد خود را مشخص کنید، سپس بهترین نوبت را دریافت کنید.
    </p>

    <div v-if="store.initializing" class="smart-booking-page__loading">
      <SkeletonForm :fields="3" />
    </div>

    <template v-else>
      <SmartBookingStepper :step="store.step" />

      <!-- Step 1: Availability -->
      <div v-if="store.step === STEP_AVAILABILITY">
        <UiAlert variant="info" class="smart-booking-page__alert">
          برای پیشنهاد هوشمند، روزها و ساعاتی که می‌توانید نوبت بگیرید را وارد کنید.
        </UiAlert>
        <UiAlert v-if="store.error" variant="error" class="smart-booking-page__alert">{{ store.error }}</UiAlert>
        <AvailabilityScheduler
          :initial-entries="store.availabilityEntries"
          :require-at-least-one="true"
          @change="onAvailabilityChange"
          @save="onSaveAvailability"
        />
      </div>

      <!-- Step 2: Service -->
      <div v-else-if="store.step === STEP_SERVICE">
        <div class="smart-booking-page__step-header">
          <h2 class="smart-booking-page__step-title">خدمت مورد نظر را انتخاب کنید</h2>
          <UiButton variant="secondary" @click="store.goToStep(STEP_AVAILABILITY)">
            ویرایش زمان‌های آزاد
          </UiButton>
        </div>
        <UiAlert v-if="store.error" variant="error" class="smart-booking-page__alert">{{ store.error }}</UiAlert>
        <ServiceSelector @select="onServiceSelect" />
      </div>

      <!-- Step 3: Preferences -->
      <div v-else-if="store.step === STEP_PREFERENCES">
        <UiCard class="smart-booking-page__preferences">
          <h2 class="smart-booking-page__step-title">ترجیحات</h2>

          <div v-if="store.selectedService" class="smart-booking-page__selected-service">
            خدمت انتخاب‌شده:
            <strong>{{ store.selectedService.name }}</strong>
          </div>

          <fieldset class="smart-booking-page__fieldset">
            <legend class="smart-booking-page__legend">اولویت پیشنهاد</legend>
            <label class="smart-booking-page__radio">
              <input v-model="store.preference" type="radio" value="time" class="smart-booking-page__radio-input" />
              <span>نزدیک‌ترین زمان</span>
            </label>
            <label class="smart-booking-page__radio">
              <input v-model="store.preference" type="radio" value="location" class="smart-booking-page__radio-input" />
              <span>نزدیک‌ترین ارائه‌دهنده</span>
            </label>
          </fieldset>

          <div class="smart-booking-page__price-grid">
            <UiPriceInput
              :model-value="store.priceMin ?? undefined"
              label="حداقل قیمت (تومان)"
              placeholder="اختیاری"
              :min="0"
              @update:model-value="store.priceMin = $event ?? null"
            />
            <UiPriceInput
              :model-value="store.priceMax ?? undefined"
              label="حداکثر قیمت (تومان)"
              placeholder="اختیاری"
              :min="0"
              @update:model-value="store.priceMax = $event ?? null"
            />
          </div>
        </UiCard>

        <UiAlert v-if="store.error" variant="error" class="smart-booking-page__alert">{{ store.error }}</UiAlert>

        <div class="smart-booking-page__actions">
          <UiButton variant="secondary" @click="store.goToStep(STEP_SERVICE)">بازگشت</UiButton>
          <UiButton :loading="store.loading" @click="onFindSuggestions">مشاهده پیشنهادها</UiButton>
        </div>
      </div>

      <!-- Step 4: Suggestions -->
      <div v-else-if="store.step === STEP_SUGGESTIONS">
        <div class="smart-booking-page__step-header">
          <h2 class="smart-booking-page__step-title">پیشنهادهای رزرو</h2>
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

<style scoped>
.smart-booking-page__title {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.smart-booking-page__description {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.smart-booking-page__loading {
  margin-bottom: 1.5rem;
}

.smart-booking-page__alert {
  margin-bottom: 1rem;
}

.smart-booking-page__step-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.smart-booking-page__step-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.smart-booking-page__preferences {
  max-width: 32rem;
  margin-bottom: 1.5rem;
}

.smart-booking-page__preferences > * + * {
  margin-top: 1rem;
}

.smart-booking-page__selected-service {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.smart-booking-page__selected-service strong {
  color: var(--color-text);
}

.smart-booking-page__fieldset {
  border: none;
  padding: 0;
}

.smart-booking-page__fieldset > * + * {
  margin-top: 0.5rem;
}

.smart-booking-page__legend {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.smart-booking-page__radio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.smart-booking-page__radio-input {
  accent-color: var(--color-primary);
}

.smart-booking-page__price-grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .smart-booking-page__price-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.smart-booking-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
