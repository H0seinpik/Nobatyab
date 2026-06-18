<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getUserAvailability, saveUserAvailability } from "@/services/smartBooking.service";
import type { AvailabilityEntry } from "@/types/smartBooking";
import AvailabilityScheduler from "@/components/smart-booking/AvailabilityScheduler.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiButton from "@/components/ui/UiButton.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const route = useRoute();
const router = useRouter();

const entries = ref<AvailabilityEntry[]>([]);
const loading = ref(true);
const saving = ref(false);
const success = ref("");
const error = ref("");

const isFirstTimeSetup = computed(
  () => route.query.returnTo === "smart-booking" && entries.value.length === 0,
);

onMounted(async () => {
  try {
    entries.value = await getUserAvailability();
  } finally {
    loading.value = false;
  }
});

async function handleEntriesChange(updated: AvailabilityEntry[]) {
  entries.value = updated;
}

async function handleSave(newEntries: Omit<AvailabilityEntry, "id">[]) {
  if (newEntries.length === 0) {
    error.value = "لطفاً حداقل یک بازه زمانی اضافه کنید";
    return;
  }

  saving.value = true;
  success.value = "";
  error.value = "";
  try {
    entries.value = await saveUserAvailability(newEntries);
    success.value = "زمان‌های آزاد با موفقیت ذخیره شد";

    if (route.query.returnTo === "smart-booking") {
      setTimeout(() => router.push("/smart-booking"), 800);
    }
  } catch {
    error.value = "خطا در ذخیره زمان‌های آزاد";
  } finally {
    saving.value = false;
  }
}

function addSampleWeekday() {
  entries.value = [
    ...entries.value,
    { dayOfWeek: 6, startTime: "10:00", endTime: "14:00" },
    { dayOfWeek: 0, startTime: "09:00", endTime: "17:00" },
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  ];
}
</script>

<template>
  <div class="availability-page">
    <h1 class="availability-page__title">زمان‌های آزاد هفتگی</h1>

    <UiAlert v-if="isFirstTimeSetup" variant="info" class="availability-page__alert">
      قبل از رزرو هوشمند، لطفاً روزها و ساعاتی که می‌توانید نوبت بگیرید را مشخص کنید.
    </UiAlert>

    <p class="availability-page__description">
      بازه‌هایی که می‌توانید نوبت بگیرید را مشخص کنید. رزرو هوشمند بر اساس این زمان‌ها پیشنهاد می‌دهد.
    </p>

    <UiAlert v-if="success" variant="success" class="availability-page__alert">{{ success }}</UiAlert>
    <UiAlert v-if="error" variant="error" class="availability-page__alert">{{ error }}</UiAlert>

    <div v-if="loading">
      <SkeletonForm :fields="4" />
    </div>

    <ContentFade v-else>
      <div v-if="isFirstTimeSetup" class="availability-page__sample">
        <UiButton variant="secondary" type="button" @click="addSampleWeekday">
          افزودن نمونه (شنبه تا دوشنبه)
        </UiButton>
      </div>

      <AvailabilityScheduler
        :initial-entries="entries"
        :require-at-least-one="isFirstTimeSetup"
        @change="handleEntriesChange"
        @save="handleSave"
      />
      <p v-if="saving" class="availability-page__saving">در حال ذخیره...</p>
    </ContentFade>
  </div>
</template>

<style scoped>
.availability-page__title {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.availability-page__alert {
  margin-bottom: 1rem;
}

.availability-page__description {
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.availability-page__sample {
  margin-bottom: 1rem;
}

.availability-page__saving {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}
</style>
