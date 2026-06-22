<script setup lang="ts">
import type { SlotDto } from "@/types/booking";
import SlotButton from "./SlotButton.vue";
import EmptyState from "@/components/feedback/EmptyState.vue";
import SkeletonBase from "@/components/ui/skeleton/SkeletonBase.vue";
import { CalendarX } from "lucide-vue-next";

defineProps<{
  slots: SlotDto[];
  selected?: string | null;
  loading?: boolean;
  hasDateSelected?: boolean;
  errorMessage?: string;
}>();

defineEmits<{ select: [slot: SlotDto] }>();
</script>

<template>
  <div class="time-slot-grid">
    <div v-if="loading" class="time-slot-grid__skeleton">
      <SkeletonBase v-for="i in 6" :key="i" height="2.75rem" />
    </div>
    <p v-else-if="errorMessage" class="time-slot-grid__message time-slot-grid__message--error">
      {{ errorMessage }}
    </p>
    <p v-else-if="!hasDateSelected" class="time-slot-grid__message">
      لطفاً تاریخ را انتخاب کنید
    </p>
    <EmptyState
      v-else-if="!slots.length"
      :icon="CalendarX"
      title="بازه زمانی موجود نیست"
      description="برای این تاریخ زمان خالی وجود ندارد. تاریخ دیگری انتخاب کنید."
    />
    <div v-else class="time-slot-grid__slots">
      <SlotButton
        v-for="slot in slots"
        :key="slot.startAt"
        :slot="slot"
        :selected="selected === slot.startAt"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.time-slot-grid__message {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.time-slot-grid__message--error {
  color: var(--color-danger);
}

.time-slot-grid__skeleton {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}

.time-slot-grid__slots {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
}

@media (min-width: 640px) {
  .time-slot-grid__slots,
  .time-slot-grid__skeleton {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .time-slot-grid__slots,
  .time-slot-grid__skeleton {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}
</style>
