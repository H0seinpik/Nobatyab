<script setup lang="ts">
import { ref, onMounted } from "vue";
import { apiGet, apiPut } from "@/services/api";
import {
  getWorkingHours,
  updateWorkingHourStatus,
  deleteWorkingHour,
  replaceWorkingHours,
  type WorkingHour,
} from "@/services/provider.service";
import { useZodForm } from "@/composables/useZodForm";
import { workingHoursFormSchema, cancellationPolicyFormSchema } from "@/schemas/provider.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiSwitch from "@/components/ui/UiSwitch.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

type WorkingHourRow = WorkingHour | (Omit<WorkingHour, "id"> & { id?: string });

const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

const pageLoading = ref(true);
const hoursMessage = ref("");
const hoursError = ref("");
const policyMessage = ref("");
const deletingIds = ref(new Set<string>());
const togglingIds = ref(new Set<string>());

const {
  values: hoursValues,
  fieldError: hoursFieldError,
  isValid: hoursValid,
  submitting: hoursSubmitting,
  handleSubmit: handleHoursSubmit,
} = useZodForm(workingHoursFormSchema, {
  hours: [{ dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isActive: true }],
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

function applyWorkingHours(rows: WorkingHourRow[]) {
  hoursValues.hours = rows.length
    ? rows.map((row) => ({ ...row, isActive: row.isActive ?? true }))
    : [{ dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isActive: true }];
}

async function loadWorkingHours() {
  const rows = await getWorkingHours();
  applyWorkingHours(rows);
  return rows;
}

onMounted(async () => {
  try {
    await loadWorkingHours();
    const cp = await apiGet<{ minHoursBefore: number; description: string | null }>(
      "/provider/cancellation-policy",
    );
    policyValues.minHoursBefore = cp.data.minHoursBefore;
    policyValues.description = cp.data.description ?? "";
  } finally {
    pageLoading.value = false;
  }
});

function addRow() {
  hoursValues.hours.push({ dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isActive: true });
}

async function removeRow(index: number) {
  const row = hoursValues.hours[index] as WorkingHourRow;
  if (!row) return;

  hoursMessage.value = "";
  hoursError.value = "";

  if (row.id) {
    if (deletingIds.value.has(row.id)) return;
    deletingIds.value.add(row.id);
    try {
      const res = await deleteWorkingHour(row.id);
      applyWorkingHours(res);
      await loadWorkingHours();
    } catch {
      hoursError.value = "خطا در حذف روز کاری";
    } finally {
      deletingIds.value.delete(row.id);
    }
    return;
  }

  hoursValues.hours.splice(index, 1);
}

async function toggleActive(index: number, isActive: boolean) {
  const row = hoursValues.hours[index] as WorkingHourRow;
  if (!row) return;

  if (!row.id) {
    row.isActive = isActive;
    return;
  }

  if (togglingIds.value.has(row.id)) return;

  hoursError.value = "";
  togglingIds.value.add(row.id);
  const previous = row.isActive ?? true;
  row.isActive = isActive;

  try {
    applyWorkingHours(await updateWorkingHourStatus(row.id, isActive));
    await loadWorkingHours();
    hoursMessage.value = isActive ? "روز کاری فعال شد" : "روز کاری غیرفعال شد";
  } catch {
    row.isActive = previous;
    hoursError.value = "خطا در تغییر وضعیت روز کاری";
    await loadWorkingHours();
  } finally {
    togglingIds.value.delete(row.id);
  }
}

async function saveHours() {
  hoursError.value = "";
  await handleHoursSubmit(async (data) => {
    const res = await replaceWorkingHours(
      data.hours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
        isActive: h.isActive ?? true,
      })),
    );
    applyWorkingHours(res);
    await loadWorkingHours();
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
          <p
            v-if="!hoursValues.hours.length"
            class="mb-4 text-sm text-[var(--color-muted)]"
          >
            بازه کاری تعریف نشده است. با «افزودن بازه» شروع کنید.
          </p>

          <div
            v-for="(h, i) in hoursValues.hours"
            :key="h.id ?? `new-${i}`"
            class="mb-3 grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 rounded-lg border border-[var(--color-border)] p-3"
            :class="!h.isActive ? 'opacity-60' : ''"
          >
            <UiSwitch
              :model-value="h.isActive"
              label="فعال"
              :disabled="h.id ? togglingIds.has(h.id) || deletingIds.has(h.id) : false"
              @update:model-value="toggleActive(i, $event)"
            />
            <select
              v-model.number="h.dayOfWeek"
              class="form-control"
              :disabled="h.id ? deletingIds.has(h.id) || togglingIds.has(h.id) : false"
            >
              <option v-for="(name, d) in dayNames" :key="d" :value="d">{{ name }}</option>
            </select>
            <UiInput
              v-model="h.startTime"
              placeholder="09:00"
              :disabled="h.id ? deletingIds.has(h.id) || togglingIds.has(h.id) : false"
            />
            <UiInput
              v-model="h.endTime"
              placeholder="17:00"
              :disabled="h.id ? deletingIds.has(h.id) || togglingIds.has(h.id) : false"
            />
            <UiButton
              type="button"
              variant="ghost"
              :disabled="h.id ? deletingIds.has(h.id) || togglingIds.has(h.id) : false"
              @click="removeRow(i)"
            >
              حذف
            </UiButton>
          </div>

          <UiAlert v-if="hoursError" variant="error" class="mb-2">{{ hoursError }}</UiAlert>
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
