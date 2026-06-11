<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPut } from "@/services/api";
import { useZodForm } from "@/composables/useZodForm";
import { workingHoursFormSchema, cancellationPolicyFormSchema } from "@/schemas/provider.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

const pageLoading = ref(true);
const hoursMessage = ref("");
const policyMessage = ref("");

const {
  values: hoursValues,
  fieldError: hoursFieldError,
  isValid: hoursValid,
  submitting: hoursSubmitting,
  handleSubmit: handleHoursSubmit,
} = useZodForm(workingHoursFormSchema, {
  hours: [{ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" }],
});

const {
  values: policyValues,
  fieldError: policyFieldError,
  touch: policyTouch,
  isValid: policyValid,
  submitting: policySubmitting,
  handleSubmit: handlePolicySubmit,
} = useZodForm(cancellationPolicyFormSchema, {
  minHoursBefore: 24,
  description: "",
});

onMounted(async () => {
  try {
    const wh = await apiGet<typeof hoursValues.hours>("/provider/working-hours");
    hoursValues.hours = wh.data.length ? wh.data : [{ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" }];
    const cp = await apiGet<{ minHoursBefore: number; description: string | null }>("/provider/cancellation-policy");
    policyValues.minHoursBefore = cp.data.minHoursBefore;
    policyValues.description = cp.data.description ?? "";
  } finally {
    pageLoading.value = false;
  }
});

function addRow() {
  hoursValues.hours.push({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00" });
}

async function saveHours() {
  await handleHoursSubmit(async (data) => {
    await apiPut("/provider/working-hours", data);
    hoursMessage.value = "برنامه ذخیره شد";
  });
}

async function savePolicy() {
  await handlePolicySubmit(async (data) => {
    await apiPut("/provider/cancellation-policy", {
      minHoursBefore: data.minHoursBefore,
      description: data.description || undefined,
    });
    policyMessage.value = "قوانین ذخیره شد";
  });
}
</script>

<template>
  <SkeletonForm v-if="pageLoading" :fields="6" />
  <ContentFade v-else class="space-y-8">
    <div>
      <h1 class="mb-4 text-2xl font-bold">برنامه کاری</h1>
      <UiCard class="space-y-4">
        <form @submit.prevent="saveHours">
          <div v-for="(h, i) in hoursValues.hours" :key="i" class="mb-3 grid grid-cols-4 gap-2">
            <select v-model.number="h.dayOfWeek" class="rounded border border-[var(--color-border)] px-2 py-1">
              <option v-for="(name, d) in dayNames" :key="d" :value="d">{{ name }}</option>
            </select>
            <UiInput v-model="h.startTime" placeholder="09:00" />
            <UiInput v-model="h.endTime" placeholder="17:00" />
          </div>
          <p v-if="hoursFieldError('hours')" class="mb-2 text-xs text-red-600">
            {{ hoursFieldError("hours") }}
          </p>
          <div class="flex gap-2">
            <UiButton type="button" variant="secondary" @click="addRow">افزودن بازه</UiButton>
            <UiButton type="submit" :loading="hoursSubmitting" :disabled="!hoursValid || hoursSubmitting">
              ذخیره برنامه
            </UiButton>
          </div>
          <p v-if="hoursMessage" class="mt-2 text-sm text-green-600">{{ hoursMessage }}</p>
        </form>
      </UiCard>
    </div>

    <div>
      <h2 class="mb-4 text-xl font-bold">قوانین لغو</h2>
      <UiCard class="max-w-lg space-y-4">
        <form class="space-y-4" @submit.prevent="savePolicy">
          <UiInput
            v-model="policyValues.minHoursBefore"
            label="حداقل ساعت قبل از نوبت"
            type="number"
            required
            :error="policyFieldError('minHoursBefore')"
            @blur="policyTouch('minHoursBefore')"
          />
          <UiInput
            v-model="policyValues.description"
            label="توضیحات"
            :error="policyFieldError('description')"
            @blur="policyTouch('description')"
          />
          <UiButton type="submit" :loading="policySubmitting" :disabled="!policyValid || policySubmitting">
            ذخیره قوانین
          </UiButton>
          <p v-if="policyMessage" class="text-sm text-green-600">{{ policyMessage }}</p>
        </form>
      </UiCard>
    </div>
  </ContentFade>
</template>
