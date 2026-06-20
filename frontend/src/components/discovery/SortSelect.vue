<script setup lang="ts">
const model = defineModel<string>({ default: "rating" });

const options = [
  { value: "rating", label: "بیشترین امتیاز" },
  { value: "name", label: "نام (الفبا)" },
  { value: "distance", label: "نزدیک‌ترین" },
];
</script>

<template>
  <label class="sort-select">
    <span class="sort-select__label">مرتب‌سازی</span>
    <select v-model="model" class="form-control sort-select__control">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.sort-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 10rem;
}

.sort-select__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.sort-select__control {
  width: 100%;
}
</style>
