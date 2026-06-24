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
  max?: number;
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
  if (parsed !== undefined) {
    if (props.min !== undefined && parsed < props.min) return;
    if (props.max !== undefined && parsed > props.max) return;
  }
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
  <label class="field">
    <span v-if="label" class="field__label">
      {{ label }}
      <span v-if="required" class="field__required">*</span>
    </span>
    <input
      type="text"
      inputmode="numeric"
      :value="display"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="form-control form-control--tabular"
      :class="{ 'form-control--error': error }"
      @focus="onFocus"
      @input="onInput(($event.target as HTMLInputElement).value)"
      @blur="onBlur"
    />
    <p v-if="error" class="field__error">{{ error }}</p>
  </label>
</template>

<style scoped>
.form-control--tabular {
  font-variant-numeric: tabular-nums;
}
</style>
