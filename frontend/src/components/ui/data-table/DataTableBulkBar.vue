<script setup lang="ts">
import UiButton from "@/components/ui/UiButton.vue";
import type { BulkAction } from "@/types/dataTable";

defineProps<{
  count: number;
  actions: BulkAction[];
}>();

const emit = defineEmits<{ action: [key: string]; clear: [] }>();
</script>

<template>
  <div
    v-if="count > 0"
    class="data-table-bulk-bar"
  >
    <span>{{ count }} مورد انتخاب شده</span>
    <UiButton
      v-for="action in actions"
      :key="action.key"
      :variant="action.variant === 'danger' ? 'danger' : 'secondary'"
      @click="emit('action', action.key)"
    >
      {{ action.label }}
    </UiButton>
    <UiButton variant="ghost" @click="emit('clear')">لغو انتخاب</UiButton>
  </div>
</template>

<style scoped>
.data-table-bulk-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-primary);
  background-color: var(--color-bg);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>
