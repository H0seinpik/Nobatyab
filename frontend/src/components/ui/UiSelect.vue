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
      class="form-control"
      :class="{ 'form-control--error': error }"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      @blur="$emit('blur')"
    >
      <slot />
    </select>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </label>
</template>
