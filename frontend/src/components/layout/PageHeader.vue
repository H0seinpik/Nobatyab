<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="page-header">
    <div class="page-header__content">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="description" class="page-header__description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.page-header__title {
  font-size: 1.5rem;
  font-weight: 700;
}

.page-header__description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.page-header__actions {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
