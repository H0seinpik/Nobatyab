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
    class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50"
    :class="{
      'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]': variant === 'primary' || !variant,
      'border border-[var(--color-border)] bg-[var(--color-surface)]': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
      'text-[var(--color-muted)] hover:text-[var(--color-text)]': variant === 'ghost',
    }"
  >
    <span v-if="loading" class="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
    <slot />
  </button>
</template>
