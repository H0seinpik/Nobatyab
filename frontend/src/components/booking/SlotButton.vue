<script setup lang="ts">
import { computed } from "vue";
import { formatTime, isAppointmentInPast } from "@/utils/datetime";
import type { SlotDto, SlotStatus } from "@/types/booking";

const props = defineProps<{
  slot: SlotDto;
  selected?: boolean;
}>();

defineEmits<{ select: [slot: SlotDto] }>();

const statusLabels: Record<SlotStatus, string> = {
  available: "",
  booked: "رزرو شده",
  past: "گذشته",
  inactive: "غیرفعال",
};

const isDisabled = computed(
  () => isAppointmentInPast(props.slot.startAt) || (props.slot.status ?? "available") !== "available",
);
</script>

<template>
  <button
    type="button"
    class="slot-button"
    :class="{
      'slot-button--selected': selected,
      [`slot-button--${slot.status ?? 'available'}`]: true,
    }"
    :disabled="isDisabled"
    :aria-label="`${formatTime(slot.startAt)}${statusLabels[slot.status ?? 'available'] ? ` — ${statusLabels[slot.status ?? 'available']}` : ''}`"
    @click="$emit('select', slot)"
  >
    <span class="slot-button__time">{{ formatTime(slot.startAt) }}</span>
    <span v-if="isDisabled && slot.status" class="slot-button__status">
      {{ statusLabels[slot.status] }}
    </span>
  </button>
</template>

<style scoped>
.slot-button {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  background-color: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition-base), background-color var(--transition-base),
    color var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 2.75rem;
}

.slot-button:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: var(--color-primary-subtle);
}

.slot-button--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: #fff;
}

.slot-button--booked,
.slot-button--past,
.slot-button--inactive {
  opacity: 0.45;
  cursor: not-allowed;
  text-decoration: line-through;
}

.slot-button__status {
  font-size: var(--text-xs);
  opacity: 0.8;
}

.slot-button--selected .slot-button__status {
  text-decoration: none;
}
</style>
