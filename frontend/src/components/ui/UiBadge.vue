<script setup lang="ts">
defineProps<{ tone?: "default" | "success" | "warning" | "danger" | "info" }>();
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="{
      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200': !tone || tone === 'default',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': tone === 'success',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': tone === 'warning',
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': tone === 'danger',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': tone === 'info',
    }"
  >
    <slot />
  </span>
</template>
