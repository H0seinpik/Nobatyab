<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiInput from "@/components/ui/UiInput.vue";
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
    <div class="md:col-span-2">
      <UiInput
        :model-value="String(values.name ?? '')"
        label="نام خدمت"
        required
        :error="fieldError('name')"
        @update:model-value="(v) => (values.name = v)"
        @blur="touch('name')"
      />
    </div>
    <UiInput
      :model-value="values.duration === undefined || values.duration === null ? '' : String(values.duration)"
      label="مدت (دقیقه)"
      type="number"
      required
      :error="fieldError('duration')"
      @update:model-value="(v) => (values.duration = v === '' ? undefined : Number(v))"
      @blur="touch('duration')"
    />
    <UiInput
      :model-value="values.price === undefined || values.price === null ? '' : String(values.price)"
      label="قیمت (تومان)"
      type="number"
      required
      :error="fieldError('price')"
      @update:model-value="(v) => (values.price = v === '' ? undefined : Number(v))"
      @blur="touch('price')"
    />
    <div v-if="mode === 'create'" class="md:col-span-2">
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
