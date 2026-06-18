<script setup lang="ts">
import { ref, watch } from "vue";
import { formatPriceDisplay, parseLocalizedInt } from "@/utils/numbers";

const props = defineProps<{
  modelValue?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  min?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number | undefined];
  blur: [];
}>();

const display = ref(formatPriceDisplay(props.modelValue));
const focused = ref(false);

watch(
  () => props.modelValue,
  (value) => {
    if (!focused.value) {
      display.value = formatPriceDisplay(value);
    }
  },
);

function onInput(raw: string) {
  const parsed = parseLocalizedInt(raw);
  if (parsed !== undefined && props.min !== undefined && parsed < props.min) return;
  display.value = raw;
  emit("update:modelValue", parsed);
}

function onFocus() {
  focused.value = true;
}

function onBlur() {
  focused.value = false;
  display.value = formatPriceDisplay(props.modelValue);
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
      @focus="onFocus"
      @input="onInput(($event.target as HTMLInputElement).value)"
      @blur="onBlur"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </label>
</template>
