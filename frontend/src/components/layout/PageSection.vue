<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
  title: string;
  viewAllTo?: string;
  viewAllLabel?: string;
}>();
</script>

<template>
  <div class="page-section">
    <div class="page-section__header">
      <h2 class="heading-section">{{ title }}</h2>
      <RouterLink v-if="viewAllTo" :to="viewAllTo" class="page-section__link">
        {{ viewAllLabel ?? "مشاهده همه" }}
      </RouterLink>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.page-section {
  padding-block: var(--space-10);
}

.page-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.page-section__link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  font-weight: 500;
}
</style>
