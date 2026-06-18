<script setup lang="ts">
import { ref, watch } from "vue";
import { WEEKDAYS_FA } from "@/config/weekdays";
import { validateWeeklyRanges } from "@/schemas/availability.schema";
import type { AvailabilityEntry } from "@/types/smartBooking";
import {
  deleteUserAvailability,
  entriesToWeekly,
  weeklyToEntries,
  type WeeklyRange,
} from "@/services/smartBooking.service";
import TimeSlotInput from "./TimeSlotInput.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";

const props = withDefaults(
  defineProps<{
    initialEntries?: AvailabilityEntry[];
    requireAtLeastOne?: boolean;
  }>(),
  { requireAtLeastOne: false },
);

const emit = defineEmits<{
  save: [entries: Omit<AvailabilityEntry, "id">[]];
  change: [entries: AvailabilityEntry[]];
}>();

const weekly = ref<Record<number, WeeklyRange[]>>(entriesToWeekly(props.initialEntries ?? []));
const validationError = ref<string | null>(null);
const deletingIds = ref(new Set<string>());

watch(
  () => props.initialEntries,
  (entries) => {
    weekly.value = entriesToWeekly(entries ?? []);
  },
  { deep: true },
);

function ensureDay(dayOfWeek: number) {
  if (!weekly.value[dayOfWeek]) weekly.value[dayOfWeek] = [];
}

function addRange(dayOfWeek: number) {
  ensureDay(dayOfWeek);
  weekly.value[dayOfWeek].push({ startTime: "09:00", endTime: "17:00" });
}

async function removeRange(dayOfWeek: number, index: number) {
  const range = weekly.value[dayOfWeek][index];
  if (!range) return;

  validationError.value = null;

  if (range.id) {
    if (deletingIds.value.has(range.id)) return;
    deletingIds.value.add(range.id);
    try {
      const entries = await deleteUserAvailability(range.id);
      weekly.value[dayOfWeek].splice(index, 1);
      emit("change", entries);
    } catch {
      validationError.value = "خطا در حذف بازه زمانی";
    } finally {
      deletingIds.value.delete(range.id);
    }
    return;
  }

  weekly.value[dayOfWeek].splice(index, 1);
}

function updateRange(
  dayOfWeek: number,
  index: number,
  field: "startTime" | "endTime",
  value: string,
) {
  weekly.value[dayOfWeek][index][field] = value;
}

function handleSave() {
  validationError.value = null;

  const entries = weeklyToEntries(weekly.value);
  if (props.requireAtLeastOne && entries.length === 0) {
    validationError.value = "حداقل یک بازه زمانی برای روزهای هفته اضافه کنید";
    return;
  }

  for (const day of WEEKDAYS_FA) {
    const ranges = weekly.value[day.dayOfWeek] ?? [];
    const err = validateWeeklyRanges(ranges);
    if (err) {
      validationError.value = `${day.label}: ${err}`;
      return;
    }
  }

  emit("save", entries);
}
</script>

<template>
  <div class="availability-scheduler">
    <div
      v-for="day in WEEKDAYS_FA"
      :key="day.dayOfWeek"
      class="availability-scheduler__day"
    >
      <div class="availability-scheduler__day-header">
        <h3 class="availability-scheduler__day-title">{{ day.label }}</h3>
        <UiButton variant="secondary" type="button" @click="addRange(day.dayOfWeek)">
          + افزودن بازه
        </UiButton>
      </div>

      <p
        v-if="!(weekly[day.dayOfWeek]?.length)"
        class="availability-scheduler__empty"
      >
        بازه‌ای تعریف نشده
      </p>

      <div v-else class="availability-scheduler__ranges">
        <TimeSlotInput
          v-for="(range, index) in weekly[day.dayOfWeek]"
          :key="range.id ?? `${day.dayOfWeek}-${index}`"
          :start-time="range.startTime"
          :end-time="range.endTime"
          :disabled="range.id ? deletingIds.has(range.id) : false"
          @update:start-time="updateRange(day.dayOfWeek, index, 'startTime', $event)"
          @update:end-time="updateRange(day.dayOfWeek, index, 'endTime', $event)"
          @remove="removeRange(day.dayOfWeek, index)"
        />
      </div>
    </div>

    <UiAlert v-if="validationError" variant="error">{{ validationError }}</UiAlert>

    <UiButton type="button" class="availability-scheduler__save" @click="handleSave">
      ذخیره و ادامه
    </UiButton>
  </div>
</template>

<style scoped>
.availability-scheduler > * + * {
  margin-top: 1rem;
}

.availability-scheduler__day {
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1rem;
}

.availability-scheduler__day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.availability-scheduler__day-title {
  font-weight: 600;
}

.availability-scheduler__empty {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.availability-scheduler__ranges > * + * {
  margin-top: 0.5rem;
}

.availability-scheduler__save {
  width: 100%;
}

@media (min-width: 640px) {
  .availability-scheduler__save {
    width: auto;
  }
}
</style>
