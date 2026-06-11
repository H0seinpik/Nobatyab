<script setup lang="ts">
import UiModal from "./UiModal.vue";
import UiButton from "./UiButton.vue";

const open = defineModel<boolean>("open", { default: false });

defineProps<{
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}>();

const emit = defineEmits<{ confirm: []; cancel: [] }>();

function onConfirm() {
  emit("confirm");
}

function onCancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <UiModal v-model:open="open" :title="title ?? 'تأیید'" size="sm" :close-on-overlay="!loading">
    <p class="text-sm text-[var(--color-muted)]">{{ message }}</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UiButton variant="secondary" :disabled="loading" @click="onCancel">
          {{ cancelLabel ?? "انصراف" }}
        </UiButton>
        <UiButton
          :variant="variant === 'danger' ? 'danger' : 'primary'"
          :loading="loading"
          @click="onConfirm"
        >
          {{ confirmLabel ?? "تأیید" }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
