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
</script>

<template>
  <div v-if="request" class="mb-4 space-y-1 text-sm text-[var(--color-muted)]">
    <p><strong>کاربر:</strong> {{ request.user?.fullName }}</p>
    <p><strong>ایمیل:</strong> {{ request.user?.email }}</p>
    <p v-if="request.user?.phone"><strong>موبایل:</strong> {{ request.user.phone }}</p>
    <p v-if="request.note"><strong>توضیحات کاربر:</strong> {{ request.note }}</p>
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
    <div class="md:col-span-2">
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
