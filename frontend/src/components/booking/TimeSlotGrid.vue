<script setup lang="ts">
import { formatTime } from "@/utils/datetime";

defineProps<{
  slots: { startAt: string; endAt: string }[];
  selected?: string | null;
  loading?: boolean;
}>();

defineEmits<{ select: [slot: { startAt: string; endAt: string }] }>();
</script>

<template>
  <div>
    <p v-if="loading" class="text-sm text-[var(--color-muted)]">در حال بارگذاری...</p>
    <p v-else-if="!slots.length" class="text-sm text-[var(--color-muted)]">اسلاتی برای این تاریخ موجود نیست</p>
    <div v-else class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
      <button
        v-for="slot in slots"
        :key="slot.startAt"
        type="button"
        class="rounded-lg border px-3 py-2 text-sm transition"
        :class="
          selected === slot.startAt
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
        "
        @click="$emit('select', slot)"
      >
        {{ formatTime(slot.startAt) }}
      </button>
    </div>
  </div>
</template>
