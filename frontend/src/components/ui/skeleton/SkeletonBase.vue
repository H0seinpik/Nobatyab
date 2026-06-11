<script setup lang="ts">
defineProps<{ class?: string }>();
</script>

<template>
  <div
    class="animate-pulse rounded bg-[var(--color-border)]"
    :class="$props.class"
  />
</template>
