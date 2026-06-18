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
    <div class="form-field-grid__item--full">
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
    <div v-if="mode === 'edit'" class="form-field-grid__item--full checkbox-field">
      <label class="checkbox-field__label">
        <input
          type="checkbox"
          :checked="Boolean(values.isActive)"
          @change="values.isActive = ($event.target as HTMLInputElement).checked"
        />
        فعال
      </label>
    </div>
    <div class="form-field-grid__item--full">
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

<style scoped>
.checkbox-field__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
</style>
