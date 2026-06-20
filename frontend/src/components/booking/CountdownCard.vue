<script setup lang="ts">
import { Clock } from "lucide-vue-next";

defineProps<{
  formatted: string;
  expired?: boolean;
}>();
</script>

<template>
  <div class="countdown-card" :class="{ 'countdown-card--expired': expired }" role="timer">
    <Clock :size="18" class="countdown-card__icon" />
    <div>
      <p class="countdown-card__title">
        {{ expired ? "زمان رزرو به پایان رسید" : "تکمیل رزرو تا" }}
      </p>
      <p v-if="!expired" class="countdown-card__time">{{ formatted }}</p>
      <p v-else class="countdown-card__hint">لطفاً زمان دیگری انتخاب کنید</p>
    </div>
  </div>
</template>

<style scoped>
.countdown-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-primary);
  background: var(--color-primary-subtle);
  margin-bottom: var(--space-4);
}

.countdown-card--expired {
  border-color: var(--color-danger);
  background: var(--color-alert-error-bg);
}

.countdown-card__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.countdown-card--expired .countdown-card__icon {
  color: var(--color-danger);
}

.countdown-card__title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.countdown-card__time {
  font-size: var(--text-2xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-primary);
  line-height: 1.2;
}

.countdown-card__hint {
  font-size: var(--text-sm);
  color: var(--color-muted);
}
</style>
