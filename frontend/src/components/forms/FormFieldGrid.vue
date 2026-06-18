<template>
  <div class="form-field-grid">
    <slot />
  </div>
</template>

<style scoped>
.form-field-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .form-field-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-field-grid :deep(.form-field-grid__item--full) {
    grid-column: span 2;
  }
}
</style>
