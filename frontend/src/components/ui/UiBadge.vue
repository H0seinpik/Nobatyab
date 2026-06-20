<script setup lang="ts">
defineProps<{ tone?: "default" | "success" | "warning" | "danger" | "info" }>();
</script>

<template>
  <span
    class="badge"
    :class="{
      'badge--default': !tone || tone === 'default',
      'badge--success': tone === 'success',
      'badge--warning': tone === 'warning',
      'badge--danger': tone === 'danger',
      'badge--info': tone === 'info',
    }"
  >
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border-radius: var(--radius-full);
  padding: 0.125rem 0.625rem;
  font-size: var(--text-xs);
  font-weight: 500;
}

.badge--default {
  background-color: var(--color-badge-default-bg);
  color: var(--color-badge-default-text);
}

.badge--success {
  background-color: var(--color-badge-success-bg);
  color: var(--color-badge-success-text);
}

.badge--warning {
  background-color: var(--color-badge-warning-bg);
  color: var(--color-badge-warning-text);
}

.badge--danger {
  background-color: var(--color-badge-danger-bg);
  color: var(--color-badge-danger-text);
}

.badge--info {
  background-color: var(--color-badge-info-bg);
  color: var(--color-badge-info-text);
}
</style>
