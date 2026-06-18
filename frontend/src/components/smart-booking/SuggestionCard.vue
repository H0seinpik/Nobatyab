<script setup lang="ts">
import type { EnrichedSuggestion } from "@/types/smartBooking";
import { formatJalaliDateTime } from "@/utils/datetime";
import { formatPersianNumber } from "@/utils/numbers";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";

defineProps<{
  suggestion: EnrichedSuggestion;
}>();

const emit = defineEmits<{ select: [] }>();

function formatPrice(price: number) {
  return formatPersianNumber(price);
}
</script>

<template>
  <UiCard>
    <div class="suggestion-card">
      <div class="suggestion-card__info">
        <div class="suggestion-card__header">
          <h3 class="suggestion-card__provider">{{ suggestion.providerName }}</h3>
          <UiBadge v-if="suggestion.isFallback" tone="warning">خارج از زمان‌های شما</UiBadge>
        </div>
        <p class="suggestion-card__service">{{ suggestion.serviceName }}</p>
        <p class="suggestion-card__time">{{ formatJalaliDateTime(suggestion.startTime) }}</p>
        <p class="suggestion-card__location">{{ suggestion.locationLabel }}</p>
        <p class="suggestion-card__price">{{ formatPrice(suggestion.price) }} تومان</p>
      </div>
      <UiButton type="button" @click="emit('select')">انتخاب</UiButton>
    </div>
  </UiCard>
</template>

<style scoped>
.suggestion-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .suggestion-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.suggestion-card__info > * + * {
  margin-top: 0.25rem;
}

.suggestion-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.suggestion-card__provider {
  font-weight: 600;
}

.suggestion-card__service {
  font-size: 0.875rem;
  color: var(--color-muted);
}

.suggestion-card__time {
  font-size: 0.875rem;
  font-weight: 500;
}

.suggestion-card__location {
  font-size: 0.75rem;
  color: var(--color-muted);
}

.suggestion-card__price {
  font-size: 0.875rem;
  color: var(--color-primary);
}
</style>
