<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}>();

const maxStars = computed(() => props.max ?? 5);
const starSize = computed(() => {
  if (props.size === "sm") return 14;
  if (props.size === "lg") return 20;
  return 16;
});
</script>

<template>
  <div
    class="rating-stars"
    :class="`rating-stars--${size ?? 'md'}`"
    role="img"
    :aria-label="`امتیاز ${rating} از ${maxStars}`"
  >
    <span
      v-for="i in maxStars"
      :key="i"
      class="rating-stars__star"
      :class="{ 'rating-stars__star--filled': i <= Math.round(rating) }"
    >
      <svg
        :width="starSize"
        :height="starSize"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    </span>
    <span v-if="showValue" class="rating-stars__value">{{ rating.toFixed(1) }}</span>
  </div>
</template>

<style scoped>
.rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.rating-stars__star {
  color: var(--color-border);
}

.rating-stars__star--filled {
  color: #f59e0b;
}

.rating-stars__value {
  margin-inline-start: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}
</style>
