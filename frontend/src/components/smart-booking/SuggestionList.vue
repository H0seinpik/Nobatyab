<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { EnrichedSuggestion } from "@/types/smartBooking";
import SuggestionCard from "./SuggestionCard.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import UiAlert from "@/components/ui/UiAlert.vue";
import UiButton from "@/components/ui/UiButton.vue";

defineProps<{
  suggestions: EnrichedSuggestion[];
  loading?: boolean;
  emptyMessage?: string | null;
  priceFilterEmpty?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  select: [suggestion: EnrichedSuggestion];
  retry: [];
}>();
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <template v-else>
      <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>

      <div
        v-if="!suggestions.length && (emptyMessage || priceFilterEmpty)"
        class="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center"
      >
        <p class="mb-4 text-[var(--color-muted)]">
          {{ priceFilterEmpty ? "پیشنهادی در این بازه قیمت یافت نشد" : (emptyMessage ?? "زمان مناسبی پیدا نشد") }}
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <RouterLink to="/availability">
            <UiButton variant="secondary" type="button">تنظیم زمان‌های آزاد</UiButton>
          </RouterLink>
          <UiButton v-if="error" variant="secondary" type="button" @click="emit('retry')">
            تلاش مجدد
          </UiButton>
        </div>
      </div>

      <div v-else class="space-y-3">
        <SuggestionCard
          v-for="(suggestion, index) in suggestions"
          :key="`${suggestion.providerServiceId}-${suggestion.startTime}-${index}`"
          :suggestion="suggestion"
          @select="emit('select', suggestion)"
        />
      </div>
    </template>
  </div>
</template>
