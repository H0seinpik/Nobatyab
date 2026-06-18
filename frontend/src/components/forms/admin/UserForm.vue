<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiSelect from "@/components/ui/UiSelect.vue";
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
    <UiInput
      :model-value="String(values.firstName ?? '')"
      label="نام"
      required
      :error="fieldError('firstName')"
      @update:model-value="(v) => (values.firstName = v)"
      @blur="touch('firstName')"
    />
    <UiInput
      :model-value="String(values.lastName ?? '')"
      label="نام خانوادگی"
      required
      :error="fieldError('lastName')"
      @update:model-value="(v) => (values.lastName = v)"
      @blur="touch('lastName')"
    />
    <UiInput
      :model-value="String(values.email ?? '')"
      label="ایمیل"
      type="email"
      required
      :error="fieldError('email')"
      @update:model-value="(v) => (values.email = v)"
      @blur="touch('email')"
    />
    <UiInput
      :model-value="String(values.phone ?? '')"
      label="موبایل"
      placeholder="09XXXXXXXXX"
      :error="fieldError('phone')"
      @update:model-value="(v) => (values.phone = v)"
      @blur="touch('phone')"
    />
    <UiInput
      :model-value="String(values.nationalCode ?? '')"
      label="کد ملی"
      :error="fieldError('nationalCode')"
      @update:model-value="(v) => (values.nationalCode = v)"
      @blur="touch('nationalCode')"
    />
    <UiInput
      :model-value="
        values.age === undefined || values.age === null
          ? ''
          : String(values.age)
      "
      label="سن"
      type="number"
      :error="fieldError('age')"
      @update:model-value="
        (v) => (values.age = v === '' ? undefined : Number(v))
      "
      @blur="touch('age')"
    />
    <div class="md:col-span-2">
      <UiInput
        :model-value="String(values.address ?? '')"
        label="آدرس"
        :error="fieldError('address')"
        @update:model-value="(v) => (values.address = v)"
        @blur="touch('address')"
      />
    </div>
    <UiInput
      :model-value="String(values.password ?? '')"
      :label="mode === 'create' ? 'رمز عبور' : 'رمز عبور جدید (اختیاری)'"
      type="password"
      :required="mode === 'create'"
      :error="fieldError('password')"
      @update:model-value="(v) => (values.password = v)"
      @blur="touch('password')"
    />
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
    <div class="flex items-center md:col-span-2">
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          :checked="Boolean(values.isActive)"
          @change="
            values.isActive = ($event.target as HTMLInputElement).checked
          "
        />
        حساب فعال
      </label>
    </div>
  </FormFieldGrid>
</template>
