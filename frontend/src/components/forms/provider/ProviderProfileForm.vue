<script setup lang="ts">
import { ref } from "vue";
import FormFieldGrid from "@/components/forms/FormFieldGrid.vue";
import UiInput from "@/components/ui/UiInput.vue";
import UiNumberInput from "@/components/ui/UiNumberInput.vue";
import MapLocationPicker from "@/components/maps/MapLocationPicker.vue";

defineProps<{
  values: Record<string, unknown>;
  fieldError: (field: string) => string | undefined;
  touch: (field: string) => void;
}>();

const mapRef = ref<{ refreshSize: () => void } | null>(null);

defineExpose({
  refreshSize: () => mapRef.value?.refreshSize(),
});
</script>

<template>
  <FormFieldGrid>
    <div class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.specialization ?? '')"
        label="تخصص"
        :error="fieldError('specialization')"
        @update:model-value="(v) => (values.specialization = v)"
        @blur="touch('specialization')"
      />
    </div>
    <div class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.bio ?? '')"
        label="بیوگرافی"
        :error="fieldError('bio')"
        @update:model-value="(v) => (values.bio = v)"
        @blur="touch('bio')"
      />
    </div>
    <div class="form-field-grid__item--full">
      <UiInput
        :model-value="String(values.address ?? '')"
        label="آدرس"
        :error="fieldError('address')"
        @update:model-value="(v) => (values.address = v)"
        @blur="touch('address')"
      />
    </div>
    <div class="field form-field-grid__item--full">
      <label class="field__label">موقعیت روی نقشه</label>
      <MapLocationPicker
        ref="mapRef"
        :latitude="values.latitude as number | undefined"
        :longitude="values.longitude as number | undefined"
        @update:latitude="(v) => (values.latitude = v)"
        @update:longitude="(v) => (values.longitude = v)"
      />
    </div>
    <UiNumberInput
      :model-value="values.slotDurationMinutes as number | undefined"
      label="مدت بازه زمانی (دقیقه)"
      required
      :min="5"
      :max="240"
      :error="fieldError('slotDurationMinutes')"
      @update:model-value="(v) => (values.slotDurationMinutes = v)"
      @blur="touch('slotDurationMinutes')"
    />
    <div class="form-field-grid__item--full checkbox-field">
      <label class="checkbox-field__label">
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

<style scoped>
.checkbox-field__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
</style>
