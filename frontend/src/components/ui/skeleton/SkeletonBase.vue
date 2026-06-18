<script setup lang="ts">
defineProps<{ class?: string }>();
</script>

<template>
  <div
    class="skeleton"
    :class="$props.class"
  />
</template>

<style scoped>
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.skeleton {
  border-radius: 0.25rem;
  background-color: var(--color-border);
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton--line {
  height: 0.75rem;
}

.skeleton--cell {
  height: 1rem;
}

.skeleton--icon-sm {
  height: 1rem;
  width: 1rem;
  flex-shrink: 0;
}

.skeleton--icon-md {
  height: 1.5rem;
  width: 1.5rem;
  flex-shrink: 0;
  border-radius: 9999px;
}

.skeleton--actions-header {
  height: 1rem;
  width: 2rem;
  flex-shrink: 0;
}

.skeleton--header-cell {
  height: 1rem;
  flex: 1 1 0%;
}

.skeleton--body-cell {
  height: 0.75rem;
  flex: 1 1 0%;
}

.skeleton--label {
  height: 0.75rem;
  width: 6rem;
}

.skeleton--field {
  height: 2.5rem;
  width: 100%;
}

.skeleton--submit {
  margin-top: 0.5rem;
  height: 2.5rem;
  width: 100%;
}

.skeleton--media {
  margin-bottom: 0.75rem;
  height: 6rem;
  width: 100%;
}
</style>
