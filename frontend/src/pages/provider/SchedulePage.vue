<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPut } from "@/services/api";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";

const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

interface WorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const hours = ref<WorkingHour[]>([]);
const minHoursBefore = ref(24);
const policyDescription = ref("");
const loading = ref(false);

onMounted(async () => {
  const wh = await apiGet<WorkingHour[]>("/provider/working-hours");
  hours.value = wh.data.length ? wh.data : [{ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" }];
  const cp = await apiGet<{ minHoursBefore: number; description: string | null }>("/provider/cancellation-policy");
  minHoursBefore.value = cp.data.minHoursBefore;
  policyDescription.value = cp.data.description ?? "";
});

function addRow() {
  hours.value.push({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" });
}

async function saveHours() {
  loading.value = true;
  try {
    await apiPut("/provider/working-hours", { hours: hours.value });
  } finally {
    loading.value = false;
  }
}

async function savePolicy() {
  await apiPut("/provider/cancellation-policy", {
    minHoursBefore: Number(minHoursBefore.value),
    description: policyDescription.value,
  });
}
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="mb-4 text-2xl font-bold">برنامه کاری</h1>
      <UiCard class="space-y-4">
        <div v-for="(h, i) in hours" :key="i" class="grid grid-cols-4 gap-2">
          <select v-model.number="h.dayOfWeek" class="rounded border border-[var(--color-border)] px-2 py-1">
            <option v-for="(name, d) in dayNames" :key="d" :value="d">{{ name }}</option>
          </select>
          <UiInput v-model="h.startTime" placeholder="09:00" />
          <UiInput v-model="h.endTime" placeholder="17:00" />
        </div>
        <div class="flex gap-2">
          <UiButton variant="secondary" @click="addRow">افزودن بازه</UiButton>
          <UiButton :loading="loading" @click="saveHours">ذخیره برنامه</UiButton>
        </div>
      </UiCard>
    </div>

    <div>
      <h2 class="mb-4 text-xl font-bold">قوانین لغو</h2>
      <UiCard class="max-w-lg space-y-4">
        <UiInput v-model="minHoursBefore" label="حداقل ساعت قبل از نوبت" type="number" />
        <UiInput v-model="policyDescription" label="توضیحات" />
        <UiButton @click="savePolicy">ذخیره قوانین</UiButton>
      </UiCard>
    </div>
  </div>
</template>
