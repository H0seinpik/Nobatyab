<script setup lang="ts">
import UiInput from "@/components/ui/UiInput.vue";
import UiButton from "@/components/ui/UiButton.vue";

defineProps<{
  title?: string;
  searchable?: boolean;
  search: string;
  showFilters?: boolean;
  filtersOpen?: boolean;
}>();

const emit = defineEmits<{
  "update:search": [value: string];
  "toggle-filters": [];
}>();
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
    <h2 v-if="title" class="text-lg font-semibold">{{ title }}</h2>
    <div class="flex flex-1 flex-wrap items-center justify-end gap-2">
      <UiInput
        v-if="searchable"
        :model-value="search"
        placeholder="جستجو..."
        class="min-w-[12rem] max-w-xs"
        @update:model-value="emit('update:search', $event)"
      />
      <UiButton v-if="showFilters" variant="secondary" @click="emit('toggle-filters')">
        {{ filtersOpen ? "بستن فیلترها" : "فیلترها" }}
      </UiButton>
      <slot name="toolbar-extra" />
    </div>
  </div>
</template>
