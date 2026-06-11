<script setup lang="ts">
import UiAlert from "@/components/ui/UiAlert.vue";
import UiButton from "@/components/ui/UiButton.vue";
import SkeletonForm from "@/components/ui/skeleton/SkeletonForm.vue";

defineProps<{
  loading?: boolean;
  submitting?: boolean;
  error?: string | null;
  submitLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{ submit: []; cancel: [] }>();
</script>

<template>
  <div>
    <SkeletonForm v-if="loading" :fields="4" />
    <template v-else>
      <slot />
      <UiAlert v-if="error" variant="error" class="mt-4">{{ error }}</UiAlert>
      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <UiButton variant="secondary" :disabled="submitting" @click="emit('cancel')">
          {{ cancelLabel ?? "انصراف" }}
        </UiButton>
        <UiButton
          type="submit"
          :loading="submitting"
          :disabled="disabled || submitting"
          @click="emit('submit')"
        >
          {{ submitLabel ?? "ذخیره" }}
        </UiButton>
      </div>
    </template>
  </div>
</template>
