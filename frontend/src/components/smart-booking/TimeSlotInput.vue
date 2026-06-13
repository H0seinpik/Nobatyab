<script setup lang="ts">
import UiButton from "@/components/ui/UiButton.vue";

const props = defineProps<{
  startTime: string;
  endTime: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:startTime": [value: string];
  "update:endTime": [value: string];
  remove: [];
}>();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <input
      type="time"
      :value="props.startTime"
      :disabled="props.disabled"
      class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm disabled:opacity-50"
      @input="emit('update:startTime', ($event.target as HTMLInputElement).value)"
    />
    <span class="text-[var(--color-muted)]">تا</span>
    <input
      type="time"
      :value="props.endTime"
      :disabled="props.disabled"
      class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm disabled:opacity-50"
      @input="emit('update:endTime', ($event.target as HTMLInputElement).value)"
    />
    <UiButton variant="ghost" type="button" :disabled="props.disabled" @click="emit('remove')">
      حذف
    </UiButton>
  </div>
</template>
