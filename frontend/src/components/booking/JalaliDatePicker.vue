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
  <div>
    <UiInput
      :model-value="value"
      label="تاریخ (شمسی)"
      placeholder="1404/03/15"
      @update:model-value="update"
    />
    <p class="mt-1 text-xs text-[var(--color-muted)]">امروز: {{ todayJalali() }} — فرمت: YYYY/MM/DD</p>
  </div>
</template>
