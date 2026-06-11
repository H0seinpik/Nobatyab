<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
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
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="form-control"
      :class="{ 'form-control--error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="emit('blur')"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </label>
</template>
