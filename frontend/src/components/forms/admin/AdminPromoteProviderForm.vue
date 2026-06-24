<script setup lang="ts">
import { RouterLink } from "vue-router";
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiPriceInput from "@/components/ui/UiPriceInput.vue";
import UiNumberInput from "@/components/ui/UiNumberInput.vue";

defineProps<{
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
  categories: { id: string; name: string }[];
  userName?: string;
}>();
</script>

<template>
  <p v-if="userName" class="promote-provider-form__intro">
    تبدیل «{{ userName }}» به ارائه‌دهنده — دسته‌بندی و اولین خدمت را مشخص کنید.
  </p>
  <FormFieldGrid>
    <div class="form-field-grid__item--full">
      <UiSelect
        :model-value="String(values.categoryId ?? '')"
        label="دسته‌بندی"
        required
        :error="fieldError('categoryId')"
        @update:model-value="(v) => (values.categoryId = v)"
        @blur="touch('categoryId')"
      >
        <option value="">انتخاب کنید</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </UiSelect>
      <p class="promote-provider-form__hint">
        دسته مورد نظر نیست؟
        <RouterLink to="/admin/categories" class="promote-provider-form__link">افزودن دسته‌بندی</RouterLink>
      </p>
    </div>
    <div class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.serviceName ?? '')"
        label="نام اولین خدمت"
        required
        :error="fieldError('serviceName')"
        @update:model-value="(v) => (values.serviceName = v)"
        @blur="touch('serviceName')"
      />
    </div>
    <UiNumberInput
      :model-value="values.serviceDuration as number | undefined"
      label="مدت (دقیقه)"
      required
      :min="30"
      :step="30"
      :error="fieldError('serviceDuration')"
      @update:model-value="(v) => (values.serviceDuration = v ?? 30)"
      @blur="touch('serviceDuration')"
    />
    <UiPriceInput
      :model-value="values.servicePrice as number | undefined"
      label="قیمت (تومان)"
      required
      :min="0"
      :max="99999999"
      :error="fieldError('servicePrice')"
      @update:model-value="(v) => (values.servicePrice = v)"
      @blur="touch('servicePrice')"
    />
    <div class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.serviceDescription ?? '')"
        label="توضیحات خدمت (اختیاری)"
        :error="fieldError('serviceDescription')"
        @update:model-value="(v) => (values.serviceDescription = v)"
        @blur="touch('serviceDescription')"
      />
    </div>
  </FormFieldGrid>
</template>

<style scoped>
.promote-provider-form__intro {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.promote-provider-form__hint {
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-muted);
}

.promote-provider-form__link {
  color: var(--color-primary);
  text-decoration: underline;
}
</style>
