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
  <div class="suggestion-list">
    <div v-if="loading" class="suggestion-list__loading">
      <SkeletonCard v-for="i in 3" :key="i" />
    </div>

    <template v-else>
      <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>

      <div
        v-if="!suggestions.length && (emptyMessage || priceFilterEmpty)"
        class="suggestion-list__empty"
      >
        <p class="suggestion-list__empty-text">
          {{ priceFilterEmpty ? "پیشنهادی در این بازه قیمت یافت نشد" : (emptyMessage ?? "زمان مناسبی پیدا نشد") }}
        </p>
        <div class="suggestion-list__empty-actions">
          <RouterLink to="/availability">
            <UiButton variant="secondary" type="button">تنظیم زمان‌های آزاد</UiButton>
          </RouterLink>
          <UiButton v-if="error" variant="secondary" type="button" @click="emit('retry')">
            تلاش مجدد
          </UiButton>
        </div>
      </div>

      <div v-else class="suggestion-list__items">
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

<style scoped>
.suggestion-list > * + * {
  margin-top: 1rem;
}

.suggestion-list__loading > * + * {
  margin-top: 0.75rem;
}

.suggestion-list__empty {
  border-radius: 0.75rem;
  border: 1px dashed var(--color-border);
  padding: 2rem;
  text-align: center;
}

.suggestion-list__empty-text {
  margin-bottom: 1rem;
  color: var(--color-muted);
}

.suggestion-list__empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.suggestion-list__items > * + * {
  margin-top: 0.75rem;
}
</style>
