<script setup lang="ts">
import type { Component } from "vue";
import UiButton from "@/components/ui/UiButton.vue";

defineProps<{
  title?: string;
  description?: string;
  icon?: Component;
}>();

defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="network-error-state" role="alert">
    <component :is="icon" v-if="icon" :size="40" class="network-error-state__icon" />
    <h2 class="network-error-state__title">{{ title ?? "خطا در بارگذاری داده" }}</h2>
    <p class="network-error-state__description">
      {{ description ?? "اتصال برقرار نشد. لطفاً دوباره تلاش کنید." }}
    </p>
    <UiButton type="button" variant="secondary" @click="$emit('retry')">تلاش مجدد</UiButton>
  </div>
</template>

<style scoped>
.network-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10);
  text-align: center;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);
  background: var(--color-surface);
}

.network-error-state__icon {
  color: var(--color-muted);
}

.network-error-state__title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.network-error-state__description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 24rem;
}
</style>
