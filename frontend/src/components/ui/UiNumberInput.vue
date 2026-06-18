<script setup lang="ts">
import { ref, watch } from "vue";
import { formatIntegerDisplay, parseLocalizedInt } from "@/utils/numbers";

const props = defineProps<{
  modelValue?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined];
  blur: [];
}>();

const display = ref(formatIntegerDisplay(props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    const parsed = parseLocalizedInt(display.value);
    if (parsed !== value) {
      display.value = formatIntegerDisplay(value);
    }
  },
);

function onInput(raw: string) {
  const parsed = parseLocalizedInt(raw);
  if (parsed !== undefined) {
    if (props.min !== undefined && parsed < props.min) return;
    if (props.max !== undefined && parsed > props.max) return;
  }
  display.value = raw;
  emit("update:modelValue", parsed);
}

function onBlur() {
  display.value = formatIntegerDisplay(props.modelValue);
  emit("blur");
}
</script>

<template>
  <label class="block space-y-1">
    <span v-if="label" class="text-sm text-[var(--color-muted)]">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </span>
    <input
      type="text"
      inputmode="numeric"
      :value="display"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="form-control tabular-nums"
      :class="{ 'form-control--error': error }"
      @input="onInput(($event.target as HTMLInputElement).value)"
      @blur="onBlur"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </label>
</template>
