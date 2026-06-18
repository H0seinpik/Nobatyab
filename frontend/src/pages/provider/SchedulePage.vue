<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiGet, apiPut } from "@/services/api";
import {
  getWorkingHours,
  updateWorkingHourStatus,
  deleteWorkingHour,
  replaceWorkingHours,
  getProviderServices,
  type WorkingHour,
  type ProviderServiceItem,
} from "@/services/provider.service";
import { useZodForm } from "@/composables/useZodForm";
import { workingHoursFormSchema, cancellationPolicyFormSchema } from "@/schemas/provider.schema";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiNumberInput from "@/components/ui/UiNumberInput.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiSwitch from "@/components/ui/UiSwitch.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";
import ContentFade from "@/components/ui/ContentFade.vue";

const route = useRoute();
const router = useRouter();

type WorkingHourRow = WorkingHour | (Omit<WorkingHour, "id"> & { id?: string });

const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

const pageLoading = ref(true);
const services = ref<ProviderServiceItem[]>([]);
const selectedServiceId = ref("");
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
  if (!selectedServiceId.value) {
    applyWorkingHours([]);
    return [];
  }
  const rows = await getWorkingHours(selectedServiceId.value);
  applyWorkingHours(rows);
  return rows;
}

async function loadServices() {
  services.value = await getProviderServices();
  const queryService = route.query.service as string | undefined;
  if (queryService && services.value.some((s) => s.id === queryService)) {
    selectedServiceId.value = queryService;
  } else if (!selectedServiceId.value && services.value.length) {
    selectedServiceId.value = services.value[0].id;
  }
}

watch(selectedServiceId, async (serviceId) => {
  if (!serviceId || pageLoading.value) return;
  await router.replace({ query: { ...route.query, service: serviceId } });
  hoursMessage.value = "";
  hoursError.value = "";
  try {
    await loadWorkingHours();
  } catch {
    hoursError.value = "بارگذاری برنامه کاری ناموفق بود";
  }
});

onMounted(async () => {
  try {
    await loadServices();
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
      const res = await deleteWorkingHour(selectedServiceId.value, row.id);
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
    applyWorkingHours(await updateWorkingHourStatus(selectedServiceId.value, row.id, isActive));
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
      selectedServiceId.value,
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
  <ContentFade v-else class="schedule-page">
    <div>
      <h1 class="schedule-page__title">برنامه کاری</h1>
      <UiCard class="schedule-page__card">
        <label class="schedule-page__service-label">انتخاب خدمت</label>
        <select v-model="selectedServiceId" class="form-control schedule-page__service-select">
          <option v-for="service in services" :key="service.id" :value="service.id">
            {{ service.service.name }}
          </option>
        </select>
        <p v-if="!services.length" class="schedule-page__empty-hint">
          ابتدا یک خدمت در بخش خدمات ایجاد کنید.
        </p>
        <form v-else @submit.prevent="saveHours">
          <p v-if="!hoursValues.hours.length" class="schedule-page__empty-hint">
            بازه کاری تعریف نشده است. با «افزودن بازه» شروع کنید.
          </p>

          <div
            v-for="(h, i) in hoursValues.hours"
            :key="h.id ?? `new-${i}`"
            class="schedule-page__row"
            :class="{ 'schedule-page__row--inactive': !h.isActive }"
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

          <UiAlert v-if="hoursError" variant="error" class="schedule-page__alert">{{ hoursError }}</UiAlert>
          <p v-if="hoursFieldError('hours')" class="schedule-page__field-error">
            {{ hoursFieldError("hours") }}
          </p>
          <div class="schedule-page__actions">
            <UiButton type="button" variant="secondary" @click="addRow">افزودن بازه</UiButton>
            <UiButton type="submit" :loading="hoursSubmitting" :disabled="!hoursValid || hoursSubmitting">
              ذخیره برنامه
            </UiButton>
          </div>
          <p v-if="hoursMessage" class="schedule-page__success">{{ hoursMessage }}</p>
        </form>
      </UiCard>
    </div>

    <div>
      <h2 class="schedule-page__subtitle">قوانین لغو</h2>
      <UiCard class="schedule-page__policy-card">
        <form class="schedule-page__policy-form" @submit.prevent="savePolicy">
          <UiNumberInput
            :model-value="policyValues.minHoursBefore"
            label="حداقل ساعت قبل از نوبت"
            required
            :min="0"
            :max="168"
            :error="policyFieldError('minHoursBefore')"
            @update:model-value="(v) => (policyValues.minHoursBefore = v ?? 0)"
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
          <p v-if="policyMessage" class="schedule-page__success">{{ policyMessage }}</p>
        </form>
      </UiCard>
    </div>
  </ContentFade>
</template>

<style scoped>
.schedule-page > * + * {
  margin-top: 2rem;
}

.schedule-page__title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.schedule-page__subtitle {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.schedule-page__card > * + *,
.schedule-page__policy-card > * + * {
  margin-top: 1rem;
}

.schedule-page__policy-card {
  max-width: 32rem;
}

.schedule-page__service-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.schedule-page__service-select {
  margin-bottom: 1rem;
}

.schedule-page__empty-hint {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.schedule-page__row {
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr auto;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  padding: 0.75rem;
}

.schedule-page__row--inactive {
  opacity: 0.6;
}

.schedule-page__alert {
  margin-bottom: 0.5rem;
}

.schedule-page__field-error {
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-danger);
}

.schedule-page__actions {
  display: flex;
  gap: 0.5rem;
}

.schedule-page__success {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-alert-success-text);
}

.schedule-page__policy-form > * + * {
  margin-top: 1rem;
}
</style>
