<script setup lang="ts">
defineProps<{
  variant?: "success" | "error" | "info";
}>();
</script>

<template>
  <p
    class="alert"
    :class="{
      'alert--success': variant === 'success',
      'alert--error': variant === 'error',
      'alert--info': variant === 'info' || !variant,
    }"
  >
    <slot />
  </p>
</template>

<style scoped>
.alert {
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.alert--success {
  background-color: var(--color-alert-success-bg);
  color: var(--color-alert-success-text);
  border: 1px solid var(--color-alert-success-border);
}

.alert--error {
  background-color: var(--color-alert-error-bg);
  color: var(--color-alert-error-text);
  border: 1px solid var(--color-alert-error-border);
}

.alert--info {
  background-color: var(--color-alert-info-bg);
  color: var(--color-alert-info-text);
  border: 1px solid var(--color-alert-info-border);
}
</style>
