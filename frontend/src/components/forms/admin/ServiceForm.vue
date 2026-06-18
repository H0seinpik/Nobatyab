<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiNumberInput from "@/components/ui/UiNumberInput.vue";
import UiPriceInput from "@/components/ui/UiPriceInput.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
import type { CrudMode } from "@/composables/useCrudForm";

defineProps<{
  mode: CrudMode;
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
  categories: { id: string; name: string }[];
}>();
</script>

<template>
  <FormFieldGrid>
    <div class="md:col-span-2">
      <UiSelect
        :model-value="String(values.categoryId ?? '')"
        label="دسته"
        required
        :error="fieldError('categoryId')"
        @update:model-value="(v) => (values.categoryId = v)"
        @blur="touch('categoryId')"
      >
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </UiSelect>
    </div>
    <UiInput
      :model-value="String(values.name ?? '')"
      label="نام"
      required
      :error="fieldError('name')"
      @update:model-value="(v) => (values.name = v)"
      @blur="touch('name')"
    />
    <UiNumberInput
      :model-value="values.defaultDuration as number | undefined"
      label="مدت (دقیقه)"
      required
      :min="5"
      :error="fieldError('defaultDuration')"
      @update:model-value="(v) => (values.defaultDuration = v)"
      @blur="touch('defaultDuration')"
    />
    <UiPriceInput
      :model-value="values.basePrice as number | undefined"
      label="قیمت پایه"
      required
      :min="0"
      :error="fieldError('basePrice')"
      @update:model-value="(v) => (values.basePrice = v)"
      @blur="touch('basePrice')"
    />
    <div v-if="mode === 'edit'" class="md:col-span-2">
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          :checked="Boolean(values.isActive)"
          @change="values.isActive = ($event.target as HTMLInputElement).checked"
        />
        فعال
      </label>
    </div>
    <div class="md:col-span-2">
      <UiInput
        :model-value="String(values.description ?? '')"
        label="توضیحات"
        :error="fieldError('description')"
        @update:model-value="(v) => (values.description = v)"
        @blur="touch('description')"
      />
    </div>
  </FormFieldGrid>
</template>
