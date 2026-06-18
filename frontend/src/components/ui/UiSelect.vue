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
  <label class="field">
    <span v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required">*</span>
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
    <p v-if="error" class="field__error">{{ error }}</p>
  </label>
</template>
