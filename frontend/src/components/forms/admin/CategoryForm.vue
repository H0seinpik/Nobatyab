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
    <UiInput
      :model-value="String(values.name ?? '')"
      label="نام"
      required
      :error="fieldError('name')"
      @update:model-value="(v) => (values.name = v)"
      @blur="touch('name')"
    />
    <UiInput
      :model-value="String(values.slug ?? '')"
      label="Slug"
      required
      :error="fieldError('slug')"
      @update:model-value="(v) => (values.slug = v)"
      @blur="touch('slug')"
    />
    <div class="md:col-span-2">
      <UiInput
        :model-value="String(values.description ?? '')"
        label="توضیحات"
        :error="fieldError('description')"
        @update:model-value="(v) => (values.description = v)"
        @blur="touch('description')"
      />
    </div>
    <div v-if="mode === 'edit'" class="md:col-span-2">
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          :checked="Boolean(values.isActive)"
          @change="values.isActive = ($event.target as HTMLInputElement).checked"
        />
        فعال
      </label>
    </div>
  </FormFieldGrid>
</template>
