<script setup lang="ts">
import { Users, Calendar, Briefcase, Star } from "lucide-vue-next";
import type { Component } from "vue";

defineProps<{
  stats: {
    label: string;
    value: string;
    icon?: "users" | "calendar" | "briefcase" | "star";
  }[];
}>();

const icons: Record<string, Component> = {
  users: Users,
  calendar: Calendar,
  briefcase: Briefcase,
  star: Star,
};
</script>

<template>
  <section class="stats-section">
    <div class="stats-section__grid">
      <div v-for="(stat, i) in stats" :key="i" class="stats-section__item">
        <component
          :is="icons[stat.icon ?? 'calendar']"
          :size="24"
          class="stats-section__icon"
        />
        <div>
          <p class="stats-section__value">{{ stat.value }}</p>
          <p class="stats-section__label">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-section {
  padding-block: var(--space-8);
  border-block: 1px solid var(--color-border-subtle);
  background: var(--color-surface);
  margin-inline: calc(-1 * var(--space-4));
  padding-inline: var(--space-4);
}

@media (min-width: 640px) {
  .stats-section {
    margin-inline: calc(-1 * var(--space-6));
    padding-inline: var(--space-6);
    border-radius: var(--radius-xl);
  }
}

.stats-section__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  max-width: var(--container-max);
  margin-inline: auto;
}

@media (min-width: 768px) {
  .stats-section__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stats-section__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stats-section__icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.stats-section__value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.stats-section__label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
}
</style>
