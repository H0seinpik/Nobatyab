<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
  to: string;
  name: string;
  description?: string | null;
  serviceCount?: number;
}>();
</script>

<template>
  <RouterLink :to="to" class="category-pill">
    <h3 class="category-pill__name">{{ name }}</h3>
    <p v-if="description" class="category-pill__description">{{ description }}</p>
    <p v-if="serviceCount != null" class="category-pill__count">{{ serviceCount }} خدمت</p>
  </RouterLink>
</template>

<style scoped>
.category-pill {
  display: block;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  height: 100%;
  transition: border-color var(--transition-base), transform var(--transition-base);
}

.category-pill:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.category-pill__name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.category-pill__description {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.category-pill__count {
  margin-top: var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-primary);
  font-weight: 500;
}
</style>
