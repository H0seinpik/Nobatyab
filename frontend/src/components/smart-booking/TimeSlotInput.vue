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
  <div class="time-slot-input">
    <input
      type="time"
      class="time-slot-input__field"
      :value="props.startTime"
      :disabled="props.disabled"
      @input="emit('update:startTime', ($event.target as HTMLInputElement).value)"
    />
    <span class="time-slot-input__separator">تا</span>
    <input
      type="time"
      class="time-slot-input__field"
      :value="props.endTime"
      :disabled="props.disabled"
      @input="emit('update:endTime', ($event.target as HTMLInputElement).value)"
    />
    <UiButton variant="ghost" type="button" :disabled="props.disabled" @click="emit('remove')">
      حذف
    </UiButton>
  </div>
</template>

<style scoped>
.time-slot-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.time-slot-input__field {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.time-slot-input__field:disabled {
  opacity: 0.5;
}

.time-slot-input__separator {
  color: var(--color-muted);
}
</style>
