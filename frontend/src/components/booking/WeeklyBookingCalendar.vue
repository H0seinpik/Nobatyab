<script setup lang="ts">
import { computed } from "vue";
import { WEEKDAYS_FA } from "@/config/weekdays";
import {
  addGregorianDays,
  formatJalaliWeekLabel,
  getWeekDayRange,
  gregorianToJalaliDate,
  gregorianToJalaliDayNumber,
} from "@/utils/datetime";

const props = defineProps<{
  modelValue?: string;
  availableDates?: string[];
  loading?: boolean;
  weekStart: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "week-change": [weekStart: string];
}>();

const availableSet = computed(() => new Set(props.availableDates ?? []));

const weekDays = computed(() => {
  const dates = getWeekDayRange(props.weekStart);
  return dates.map((gregorianDate, index) => ({
    gregorianDate,
    jalaliDate: gregorianToJalaliDate(gregorianDate),
    dayNumber: gregorianToJalaliDayNumber(gregorianDate),
    weekdayLabel: WEEKDAYS_FA[index]?.label ?? "",
    isAvailable: availableSet.value.has(gregorianDate),
    isSelected: props.modelValue === gregorianToJalaliDate(gregorianDate),
  }));
});

const weekLabel = computed(() => formatJalaliWeekLabel(props.weekStart));

function selectDay(day: (typeof weekDays.value)[number]) {
  if (!day.isAvailable || props.loading) return;
  emit("update:modelValue", day.jalaliDate);
}

function goToPreviousWeek() {
  emit("week-change", addGregorianDays(props.weekStart, -7));
}

function goToNextWeek() {
  emit("week-change", addGregorianDays(props.weekStart, 7));
}
</script>

<template>
  <div class="weekly-booking-calendar">
    <div class="weekly-booking-calendar__header">
      <button
        type="button"
        class="weekly-booking-calendar__nav"
        aria-label="هفته قبل"
        :disabled="loading"
        @click="goToPreviousWeek"
      >
        ‹
      </button>
      <span class="weekly-booking-calendar__label">{{ weekLabel }}</span>
      <button
        type="button"
        class="weekly-booking-calendar__nav"
        aria-label="هفته بعد"
        :disabled="loading"
        @click="goToNextWeek"
      >
        ›
      </button>
    </div>

    <p v-if="loading" class="weekly-booking-calendar__hint">در حال بارگذاری تاریخ‌های قابل رزرو...</p>

    <div class="weekly-booking-calendar__grid" role="grid" aria-label="تقویم هفتگی">
      <button
        v-for="day in weekDays"
        :key="day.gregorianDate"
        type="button"
        role="gridcell"
        class="weekly-booking-calendar__day"
        :class="{
          'weekly-booking-calendar__day--available': day.isAvailable,
          'weekly-booking-calendar__day--unavailable': !day.isAvailable,
          'weekly-booking-calendar__day--selected': day.isSelected,
        }"
        :disabled="!day.isAvailable || loading"
        :aria-disabled="!day.isAvailable"
        :aria-pressed="day.isSelected"
        @click="selectDay(day)"
      >
        <span class="weekly-booking-calendar__weekday">{{ day.weekdayLabel }}</span>
        <span class="weekly-booking-calendar__day-number">{{ day.dayNumber }}</span>
      </button>
    </div>

    <p class="weekly-booking-calendar__legend">
      روزهای خاکستری قابل رزرو نیستند. یک روز فعال را انتخاب کنید.
    </p>
  </div>
</template>

<style scoped>
.weekly-booking-calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.weekly-booking-calendar__label {
  font-size: 0.9375rem;
  font-weight: 600;
}

.weekly-booking-calendar__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.weekly-booking-calendar__nav:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.weekly-booking-calendar__nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.weekly-booking-calendar__hint {
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.weekly-booking-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.375rem;
}

.weekly-booking-calendar__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.5rem 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: default;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.weekly-booking-calendar__weekday {
  font-size: 0.625rem;
  color: var(--color-muted);
}

.weekly-booking-calendar__day-number {
  font-size: 0.9375rem;
  font-weight: 600;
}

.weekly-booking-calendar__day--unavailable {
  opacity: 0.45;
  pointer-events: none;
  background-color: var(--color-surface-muted, rgba(0, 0, 0, 0.03));
}

.weekly-booking-calendar__day--available {
  cursor: pointer;
}

.weekly-booking-calendar__day--available:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.weekly-booking-calendar__day--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: #ffffff;
}

.weekly-booking-calendar__day--selected .weekly-booking-calendar__weekday {
  color: rgba(255, 255, 255, 0.85);
}

.weekly-booking-calendar__legend {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}
</style>
