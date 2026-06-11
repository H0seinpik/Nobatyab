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
    class="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--color-primary)] bg-[var(--color-bg)] px-4 py-2 text-sm"
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
