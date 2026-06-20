<script setup lang="ts">
defineProps<{
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
}>();
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    class="button"
    :class="{
      'button--primary': variant === 'primary' || !variant,
      'button--secondary': variant === 'secondary',
      'button--danger': variant === 'danger',
      'button--ghost': variant === 'ghost',
    }"
  >
    <span v-if="loading" class="button__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  border: none;
  transition: background-color var(--transition-base), color var(--transition-base),
    border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-fast);
}

.button:active:not(:disabled) {
  transform: scale(0.98);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button--primary {
  background-color: var(--color-primary);
  color: #ffffff;
  box-shadow: var(--shadow-sm);
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.button--secondary {
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
}

.button--danger {
  background-color: var(--color-danger);
  color: #ffffff;
}

.button--danger:hover:not(:disabled) {
  background-color: var(--color-danger-hover);
}

.button--ghost {
  background-color: transparent;
  color: var(--color-muted);
}

.button--ghost:hover:not(:disabled) {
  color: var(--color-text);
}

.button__spinner {
  margin-inline-start: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
