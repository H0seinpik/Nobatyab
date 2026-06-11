<script setup lang="ts">
defineProps<{
  variant?: "success" | "error" | "info";
}>();
</script>

<template>
  <p
    class="rounded-lg px-3 py-2 text-sm"
    :class="{
      'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400': variant === 'success',
      'bg-red-50 text-red-600 dark:bg-red-950/30': variant === 'error',
      'bg-[var(--color-bg)] text-[var(--color-muted)]': variant === 'info' || !variant,
    }"
  >
    <slot />
  </p>
</template>
