<script setup lang="ts">
import RatingStars from "@/components/reviews/RatingStars.vue";

defineProps<{
  rating: number;
  comment?: string | null;
  authorName: string;
  createdAt: string;
}>();
</script>

<template>
  <article class="review-card">
    <div class="review-card__header">
      <div class="review-card__avatar">{{ authorName.charAt(0) }}</div>
      <div>
        <p class="review-card__author">{{ authorName }}</p>
        <RatingStars :rating="rating" size="sm" />
      </div>
      <time class="review-card__date">{{ createdAt }}</time>
    </div>
    <p v-if="comment" class="review-card__comment">{{ comment }}</p>
  </article>
</template>

<style scoped>
.review-card {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.review-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.review-card__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.review-card__author {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.review-card__date {
  margin-inline-start: auto;
  font-size: var(--text-xs);
  color: var(--color-muted);
  flex-shrink: 0;
}

.review-card__comment {
  margin-top: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}
</style>
