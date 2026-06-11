<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiSelect from "@/components/ui/UiSelect.vue";

defineProps<{
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
}>();
</script>

<template>
  <FormFieldGrid>
    <UiSelect
      :model-value="String(values.role ?? '')"
      label="نقش"
      required
      :error="fieldError('role')"
      @update:model-value="(v) => (values.role = v)"
      @blur="touch('role')"
    >
      <option value="USER">کاربر</option>
      <option value="PROVIDER">ارائه‌دهنده</option>
      <option value="ADMIN">مدیر</option>
    </UiSelect>
    <div class="flex items-center">
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          :checked="Boolean(values.isActive)"
          @change="values.isActive = ($event.target as HTMLInputElement).checked"
        />
        حساب فعال
      </label>
    </div>
  </FormFieldGrid>
</template>
