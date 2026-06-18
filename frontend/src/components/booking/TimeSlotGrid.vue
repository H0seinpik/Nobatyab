<script setup lang="ts">
import { formatTime } from "@/utils/datetime";

defineProps<{
  slots: { startAt: string; endAt: string }[];
  selected?: string | null;
  loading?: boolean;
  hasDateSelected?: boolean;
  errorMessage?: string;
}>();

defineEmits<{ select: [slot: { startAt: string; endAt: string }] }>();
</script>

<template>
  <div class="time-slot-grid">
    <p v-if="loading" class="time-slot-grid__message">در حال بارگذاری...</p>
    <p v-else-if="errorMessage" class="time-slot-grid__message time-slot-grid__message--error">
      {{ errorMessage }}
    </p>
    <p v-else-if="!hasDateSelected" class="time-slot-grid__message">لطفاً تاریخ را انتخاب کنید</p>
    <p v-else-if="!slots.length" class="time-slot-grid__message">اسلاتی برای این تاریخ موجود نیست</p>
    <div v-else class="time-slot-grid__slots">
      <button
        v-for="slot in slots"
        :key="slot.startAt"
        type="button"
        class="time-slot-grid__slot"
        :class="{ 'time-slot-grid__slot--selected': selected === slot.startAt }"
        @click="$emit('select', slot)"
      >
        {{ formatTime(slot.startAt) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.time-slot-grid__message {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.time-slot-grid__message--error {
  color: var(--color-danger);
}

.time-slot-grid__slots {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .time-slot-grid__slots {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .time-slot-grid__slots {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.time-slot-grid__slot {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background-color: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.time-slot-grid__slot:hover {
  border-color: var(--color-primary);
}

.time-slot-grid__slot--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: #ffffff;
}
</style>
