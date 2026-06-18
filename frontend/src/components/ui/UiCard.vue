<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
</style>
