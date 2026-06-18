<script setup lang="ts">
defineProps<{ text?: string }>();
</script>

<template>
  <div class="data-table-empty">
    <slot>{{ text ?? "موردی یافت نشد" }}</slot>
  </div>
</template>

<style scoped>
.data-table-empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-muted);
}
</style>
