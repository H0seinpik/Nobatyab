<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiPriceInput from "@/components/ui/UiPriceInput.vue";
import UiNumberInput from "@/components/ui/UiNumberInput.vue";
import type { CrudMode } from "@/composables/useCrudForm";

defineProps<{
  mode: CrudMode;
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
}>();
</script>

<template>
  <FormFieldGrid>
    <div class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.name ?? '')"
        label="نام خدمت"
        required
        :error="fieldError('name')"
        @update:model-value="(v) => (values.name = v)"
        @blur="touch('name')"
      />
    </div>
    <UiNumberInput
      :model-value="values.duration as number | undefined"
      label="مدت (دقیقه)"
      required
      :min="5"
      :error="fieldError('duration')"
      @update:model-value="(v) => (values.duration = v)"
      @blur="touch('duration')"
    />
    <UiPriceInput
      :model-value="values.price as number | undefined"
      label="قیمت (تومان)"
      required
      :min="0"
      :error="fieldError('price')"
      @update:model-value="(v) => (values.price = v)"
      @blur="touch('price')"
    />
    <div v-if="mode === 'create'" class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.description ?? '')"
        label="توضیحات (اختیاری)"
        :error="fieldError('description')"
        @update:model-value="(v) => (values.description = v)"
        @blur="touch('description')"
      />
    </div>
  </FormFieldGrid>
</template>
