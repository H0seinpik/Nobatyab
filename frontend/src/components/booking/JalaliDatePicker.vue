<script setup lang="ts">
import { ref, watch } from "vue";
import UiInput from "@/components/ui/UiInput.vue";
import { todayJalali } from "@/utils/datetime";

const props = defineProps<{ modelValue?: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const value = ref(props.modelValue ?? todayJalali());

watch(
  () => props.modelValue,
  (v) => {
    if (v) value.value = v;
  },
);

function update(v: string) {
  value.value = v;
  emit("update:modelValue", v);
}
</script>

<template>
  <div class="jalali-date-picker">
    <UiInput
      :model-value="value"
      label="تاریخ (شمسی)"
      placeholder="1404/03/15"
      @update:model-value="update"
    />
    <p class="jalali-date-picker__hint">امروز: {{ todayJalali() }} — فرمت: YYYY/MM/DD</p>
  </div>
</template>

<style scoped>
.jalali-date-picker__hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}
</style>
