<script setup lang="ts">
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiInput from "@/components/ui/UiInput.vue";

defineProps<{
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
}>();
</script>

<template>
  <FormFieldGrid>
    <div class="md:col-span-2">
      <UiInput
        :model-value="String(values.specialization ?? '')"
        label="تخصص"
        :error="fieldError('specialization')"
        @update:model-value="(v) => (values.specialization = v)"
        @blur="touch('specialization')"
      />
    </div>
    <div class="md:col-span-2">
      <UiInput
        :model-value="String(values.bio ?? '')"
        label="بیوگرافی"
        :error="fieldError('bio')"
        @update:model-value="(v) => (values.bio = v)"
        @blur="touch('bio')"
      />
    </div>
    <div class="md:col-span-2">
      <UiInput
        :model-value="String(values.address ?? '')"
        label="آدرس / موقعیت"
        :error="fieldError('address')"
        @update:model-value="(v) => (values.address = v)"
        @blur="touch('address')"
      />
    </div>
    <UiInput
      :model-value="values.latitude === undefined || values.latitude === null ? '' : String(values.latitude)"
      label="عرض جغرافیایی"
      type="number"
      step="any"
      :error="fieldError('latitude')"
      @update:model-value="(v) => (values.latitude = v === '' ? undefined : Number(v))"
      @blur="touch('latitude')"
    />
    <UiInput
      :model-value="values.longitude === undefined || values.longitude === null ? '' : String(values.longitude)"
      label="طول جغرافیایی"
      type="number"
      step="any"
      :error="fieldError('longitude')"
      @update:model-value="(v) => (values.longitude = v === '' ? undefined : Number(v))"
      @blur="touch('longitude')"
    />
    <UiInput
      :model-value="values.slotDurationMinutes === undefined || values.slotDurationMinutes === null ? '' : String(values.slotDurationMinutes)"
      label="مدت اسلات (دقیقه)"
      type="number"
      required
      :error="fieldError('slotDurationMinutes')"
      @update:model-value="(v) => (values.slotDurationMinutes = v === '' ? undefined : Number(v))"
      @blur="touch('slotDurationMinutes')"
    />
    <div class="flex items-center md:col-span-2">
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          :checked="Boolean(values.isAcceptingBookings)"
          @change="values.isAcceptingBookings = ($event.target as HTMLInputElement).checked"
        />
        پذیرش نوبت فعال
      </label>
    </div>
  </FormFieldGrid>
</template>
