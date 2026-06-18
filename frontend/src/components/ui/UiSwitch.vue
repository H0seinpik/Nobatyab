<script setup lang="ts">
const model = defineModel<boolean>({ default: true });

defineProps<{
  label?: string;
  disabled?: boolean;
}>();
</script>

<template>
  <label class="switch" :class="{ 'switch--disabled': disabled }">
    <span class="track" :class="{ 'track--on': model }">
      <input
        v-model="model"
        type="checkbox"
        class="sr-only"
        :disabled="disabled"
      />
      <span class="thumb" />
    </span>
    <span v-if="label" class="switch__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.switch--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.track {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: var(--color-border);
  transition: background-color 0.2s ease;
}

.track--on {
  background-color: var(--color-primary);
}

.thumb {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transform: translateX(2px);
  transition: transform 0.2s ease;
}

.track--on .thumb {
  transform: translateX(20px);
}

[dir="rtl"] .thumb {
  transform: translateX(-2px);
}

[dir="rtl"] .track--on .thumb {
  transform: translateX(-20px);
}
</style>
