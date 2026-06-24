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
      :min="30"
      :step="30"
      :error="fieldError('duration')"
      @update:model-value="(v) => (values.duration = v)"
      @blur="touch('duration')"
    />
    <p class="provider-service-form__hint">مدت باید مضرب ۳۰ دقیقه باشد.</p>
    <UiPriceInput
      :model-value="values.price as number | undefined"
      label="قیمت (تومان)"
      required
      :min="0"
      :max="99999999"
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

<style scoped>
.provider-service-form__hint {
  font-size: 0.75rem;
  color: var(--color-muted);
}
</style>
