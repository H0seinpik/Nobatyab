<script setup lang="ts">
defineProps<{ text?: string }>();
</script>

<template>
  <div class="px-4 py-12 text-center text-[var(--color-muted)]">
    <slot>{{ text ?? "موردی یافت نشد" }}</slot>
  </div>
</template>
