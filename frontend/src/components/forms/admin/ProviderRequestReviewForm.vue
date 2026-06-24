<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
import UiInput from "@/components/ui/UiInput.vue";
import type { ProviderRequest } from "@/services/providerRequest.service";

defineProps<{
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
  request: ProviderRequest | null;
}>();

function categoryLabel(request: ProviderRequest) {
  if (request.category?.name) return request.category.name;
  if (request.proposedCategoryName) return request.proposedCategoryName;
  return "—";
}
</script>

<template>
  <div v-if="request" class="review-info">
    <p><strong>کاربر:</strong> {{ request.user?.fullName }}</p>
    <p><strong>ایمیل:</strong> {{ request.user?.email }}</p>
    <p v-if="request.user?.phone"><strong>موبایل:</strong> {{ request.user.phone }}</p>
    <p v-if="request.note"><strong>توضیحات کاربر:</strong> {{ request.note }}</p>
    <p><strong>دسته‌بندی:</strong> {{ categoryLabel(request) }}</p>
    <p v-if="request.proposedCategoryDescription && !request.categoryId">
      توضیحات دسته: {{ request.proposedCategoryDescription }}
    </p>
    <p><strong>خدمت:</strong> {{ request.proposedServiceName }}</p>
    <p>
      قیمت: {{ request.proposedServicePrice }} تومان — مدت: {{ request.proposedServiceDuration }} دقیقه
    </p>
    <p v-if="request.proposedServiceDescription">
      توضیحات خدمت: {{ request.proposedServiceDescription }}
    </p>
  </div>
  <FormFieldGrid>
    <UiSelect
      :model-value="String(values.status ?? 'APPROVED')"
      label="نتیجه بررسی"
      required
      :error="fieldError('status')"
      @update:model-value="(v) => (values.status = v)"
      @blur="touch('status')"
    >
      <option value="APPROVED">تأیید</option>
      <option value="REJECTED">رد</option>
    </UiSelect>
    <template v-if="values.status === 'APPROVED' && request && !request.categoryId">
      <div class="form-field-grid__item--full">
        <UiInput
          :model-value="String(values.categoryName ?? '')"
          label="نام دسته‌بندی"
          required
          :error="fieldError('categoryName')"
          @update:model-value="(v) => (values.categoryName = v)"
          @blur="touch('categoryName')"
        />
      </div>
      <div class="form-field-grid__item--full">
        <UiInput
          :model-value="String(values.categorySlug ?? '')"
          label="شناسه URL (slug)"
          required
          placeholder="مثال: yoga-classes"
          :error="fieldError('categorySlug')"
          @update:model-value="(v) => (values.categorySlug = v)"
          @blur="touch('categorySlug')"
        />
      </div>
      <div class="form-field-grid__item--full">
        <UiInput
          :model-value="String(values.categoryDescription ?? '')"
          label="توضیحات دسته‌بندی"
          :error="fieldError('categoryDescription')"
          @update:model-value="(v) => (values.categoryDescription = v)"
          @blur="touch('categoryDescription')"
        />
      </div>
    </template>
    <div class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.adminNote ?? '')"
        label="یادداشت مدیر"
        :error="fieldError('adminNote')"
        @update:model-value="(v) => (values.adminNote = v)"
        @blur="touch('adminNote')"
      />
    </div>
  </FormFieldGrid>
</template>

<style scoped>
.review-info {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.review-info > * + * {
  margin-top: 0.25rem;
}
</style>
