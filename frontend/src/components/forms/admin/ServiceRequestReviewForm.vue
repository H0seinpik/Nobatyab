<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
import UiInput from "@/components/ui/UiInput.vue";
import type { ServiceRequestRow } from "@/config/tables/serviceRequests.columns";

defineProps<{
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
  request: ServiceRequestRow | null;
  categories: { id: string; name: string }[];
}>();
</script>

<template>
  <div v-if="request" class="review-info">
    <p><strong>خدمت:</strong> {{ request.service?.name ?? request.proposedName }}</p>
    <p><strong>ارائه‌دهنده:</strong> {{ request.provider.user.fullName }}</p>
    <p v-if="!request.serviceId">
      قیمت پیشنهادی: {{ request.proposedPrice }} — مدت: {{ request.proposedDuration }} دقیقه
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
    <div
      v-if="values.status === 'APPROVED' && request && !request.serviceId"
      class="form-field-grid__item--full"
    >
      <UiSelect
        :model-value="String(values.categoryId ?? '')"
        label="دسته‌بندی (برای خدمت جدید)"
        required
        :error="fieldError('categoryId')"
        @update:model-value="(v) => (values.categoryId = v)"
        @blur="touch('categoryId')"
      >
        <option value="">انتخاب کنید</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </UiSelect>
    </div>
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
