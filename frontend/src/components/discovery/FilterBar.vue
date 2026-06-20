<script setup lang="ts">
import { ref, watch } from "vue";
import { Search } from "lucide-vue-next";
import UiInput from "@/components/ui/UiInput.vue";
import UiSelect from "@/components/ui/UiSelect.vue";

const props = defineProps<{
  search?: string;
  categoryId?: string;
  categories?: { id: string; name: string }[];
  showCategory?: boolean;
  searchPlaceholder?: string;
}>();

const emit = defineEmits<{
  "update:search": [value: string];
  "update:categoryId": [value: string];
  submit: [];
}>();

const localSearch = ref(props.search ?? "");
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.search,
  (v) => {
    localSearch.value = v ?? "";
  },
);

function onSearchInput(value: string) {
  localSearch.value = value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    emit("update:search", value);
    emit("submit");
  }, 300);
}

function onCategoryChange(value: string) {
  emit("update:categoryId", value);
  emit("submit");
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__search">
      <Search :size="18" class="filter-bar__search-icon" />
      <UiInput
        :model-value="localSearch"
        :placeholder="searchPlaceholder ?? 'جستجو...'"
        @update:model-value="onSearchInput"
      />
    </div>
    <UiSelect
      v-if="showCategory !== false && categories?.length"
      :model-value="categoryId ?? ''"
      label="دسته‌بندی"
      @update:model-value="onCategoryChange"
    >
      <option value="">همه دسته‌ها</option>
      <option v-for="cat in categories" :key="cat.id" :value="cat.id">
        {{ cat.name }}
      </option>
    </UiSelect>
    <slot />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

@media (min-width: 640px) {
  .filter-bar {
    flex-direction: row;
    align-items: flex-end;
  }

  .filter-bar__search {
    flex: 1;
  }
}

.filter-bar__search {
  position: relative;
}

.filter-bar__search-icon {
  position: absolute;
  top: 2.25rem;
  right: var(--space-3);
  color: var(--color-muted);
  pointer-events: none;
  z-index: 1;
}

.filter-bar__search :deep(.form-control) {
  padding-inline-end: var(--space-10);
}
</style>
