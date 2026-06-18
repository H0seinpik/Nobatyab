<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import UiInput from "@/components/ui/UiInput.vue";
import { todayJalali, gregorianToJalaliDate } from "@/utils/datetime";

const props = defineProps<{
  modelValue?: string;
  availableDates?: string[];
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const value = ref(props.modelValue ?? todayJalali());

watch(
  () => props.modelValue,
  (v) => {
    if (v) value.value = v;
  },
);

onMounted(() => {
  if (!props.modelValue) {
    emit("update:modelValue", value.value);
  }
});

function update(v: string) {
  value.value = v;
  emit("update:modelValue", v);
}

const availableJalaliDates = () =>
  (props.availableDates ?? []).map((date) => gregorianToJalaliDate(date));
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
    <p v-if="availableJalaliDates().length" class="jalali-date-picker__hint">
      تاریخ‌های قابل رزرو: {{ availableJalaliDates().join("، ") }}
    </p>
  </div>
</template>

<style scoped>
.jalali-date-picker__hint {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}
</style>
