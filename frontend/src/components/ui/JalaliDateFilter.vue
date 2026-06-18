<script setup lang="ts">
import { ref, watch } from "vue";
import { isoToJalali, jalaliToGregorianDate } from "@/utils/datetime";

const props = defineProps<{ modelValue?: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string | undefined] }>();

const display = ref(props.modelValue ? isoToJalali(props.modelValue) : "");

watch(
  () => props.modelValue,
  (v) => {
    display.value = v ? isoToJalali(v) : "";
  },
);

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  display.value = val;
  if (!val.trim()) {
    emit("update:modelValue", undefined);
    return;
  }
  try {
    const iso = jalaliToGregorianDate(val);
    emit("update:modelValue", new Date(iso).toISOString());
  } catch {
    // keep partial input, don't emit until valid
  }
}
</script>

<template>
  <input
    type="text"
    class="form-control form-control--xs"
    placeholder="1404/03/15"
    :value="display"
    @input="onInput"
  />
</template>
