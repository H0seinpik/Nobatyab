<script setup lang="ts">
import type { EnrichedSuggestion } from "@/types/smartBooking";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";

defineProps<{
  suggestion: EnrichedSuggestion;
}>();

const emit = defineEmits<{ select: [] }>();

function formatPrice(price: number) {
  return price.toLocaleString("fa-IR");
}
</script>

<template>
  <UiCard class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="font-semibold">{{ suggestion.providerName }}</h3>
        <UiBadge v-if="suggestion.isFallback" tone="warning">خارج از زمان‌های شما</UiBadge>
      </div>
      <p class="text-sm text-[var(--color-muted)]">{{ suggestion.serviceName }}</p>
      <p class="text-sm font-medium">{{ formatJalaliDateTime(suggestion.startTime) }}</p>
      <p class="text-xs text-[var(--color-muted)]">{{ suggestion.locationLabel }}</p>
      <p class="text-sm text-[var(--color-primary)]">{{ formatPrice(suggestion.price) }} تومان</p>
    </div>
    <UiButton type="button" @click="emit('select')">انتخاب</UiButton>
  </UiCard>
</template>
