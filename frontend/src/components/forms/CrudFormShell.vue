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
  <div class="crud-form-shell">
    <SkeletonForm v-if="loading" :fields="4" />
    <template v-else>
      <slot />
      <UiAlert v-if="error" variant="error" class="crud-form-shell__alert">{{ error }}</UiAlert>
      <div class="crud-form-shell__actions">
        <UiButton variant="secondary" :disabled="loading || submitting" @click="emit('cancel')">
          {{ cancelLabel ?? "انصراف" }}
        </UiButton>
        <UiButton
          type="button"
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

<style scoped>
.crud-form-shell__alert {
  margin-top: 1rem;
}

.crud-form-shell__actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .crud-form-shell__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
