<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
  blur: [];
}>();
</script>

<template>
  <label class="block space-y-1">
    <span v-if="label" class="text-sm text-[var(--color-muted)]">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </span>
    <select
      :value="modelValue"
      :disabled="disabled"
      class="w-full rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] disabled:opacity-50"
      :class="
        error
          ? 'border-red-500 focus:border-red-500'
          : 'border-[var(--color-border)]'
      "
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="$emit('blur')"
    >
      <slot />
    </select>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </label>
</template>
