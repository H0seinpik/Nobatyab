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
  <div>
    <h1 class="mb-2 text-2xl font-bold">زمان‌های آزاد هفتگی</h1>

    <UiAlert v-if="isFirstTimeSetup" variant="info" class="mb-4">
      قبل از رزرو هوشمند، لطفاً روزها و ساعاتی که می‌توانید نوبت بگیرید را مشخص کنید.
    </UiAlert>

    <p class="mb-6 text-sm text-[var(--color-muted)]">
      بازه‌هایی که می‌توانید نوبت بگیرید را مشخص کنید. رزرو هوشمند بر اساس این زمان‌ها پیشنهاد می‌دهد.
    </p>

    <UiAlert v-if="success" variant="success" class="mb-4">{{ success }}</UiAlert>
    <UiAlert v-if="error" variant="error" class="mb-4">{{ error }}</UiAlert>

    <div v-if="loading">
      <SkeletonForm :fields="4" />
    </div>

    <ContentFade v-else>
      <div v-if="isFirstTimeSetup" class="mb-4">
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
      <p v-if="saving" class="mt-4 text-sm text-[var(--color-muted)]">در حال ذخیره...</p>
    </ContentFade>
  </div>
</template>
