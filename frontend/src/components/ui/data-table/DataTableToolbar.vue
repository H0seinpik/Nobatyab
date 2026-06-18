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
  <div class="data-table-toolbar">
    <h2 v-if="title" class="data-table-toolbar__title">{{ title }}</h2>
    <div class="data-table-toolbar__actions">
      <UiInput
        v-if="searchable"
        :model-value="search"
        placeholder="جستجو..."
        class="data-table-toolbar__search"
        @update:model-value="emit('update:search', $event)"
      />
      <UiButton v-if="showFilters" variant="secondary" @click="emit('toggle-filters')">
        {{ filtersOpen ? "بستن فیلترها" : "فیلترها" }}
      </UiButton>
      <slot name="toolbar-extra" />
    </div>
  </div>
</template>

<style scoped>
.data-table-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
}

.data-table-toolbar__title {
  font-size: 1.125rem;
  font-weight: 600;
}

.data-table-toolbar__actions {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.5rem;
}

.data-table-toolbar__search {
  min-width: 12rem;
  max-width: 20rem;
}

@media (min-width: 640px) {
  .data-table-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .data-table-toolbar__actions {
    width: auto;
    flex: 1;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
