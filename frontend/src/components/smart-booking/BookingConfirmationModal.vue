<script setup lang="ts">
import { computed } from "vue";
import type { EnrichedSuggestion } from "@/types/smartBooking";
import { formatJalaliDateTime } from "@/utils/datetime";
import UiModal from "@/components/ui/UiModal.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiAlert from "@/components/ui/UiAlert.vue";

const open = defineModel<boolean>("open", { default: false });

const props = defineProps<{
  suggestion: EnrichedSuggestion | null;
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{ confirm: []; cancel: [] }>();

const priceLabel = computed(() =>
  props.suggestion ? Number(props.suggestion.price).toLocaleString("fa-IR") : "",
);

function handleCancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <UiModal v-model:open="open" title="تأیید رزرو" size="md" :close-on-overlay="!loading">
    <div v-if="suggestion" class="space-y-4">
      <div class="space-y-2 text-sm">
        <p><span class="text-[var(--color-muted)]">خدمت:</span> {{ suggestion.serviceName }}</p>
        <p><span class="text-[var(--color-muted)]">ارائه‌دهنده:</span> {{ suggestion.providerName }}</p>
        <p>
          <span class="text-[var(--color-muted)]">زمان:</span>
          {{ formatJalaliDateTime(suggestion.startTime) }}
        </p>
        <p><span class="text-[var(--color-muted)]">هزینه:</span> {{ priceLabel }} تومان</p>
      </div>

      <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>

      <div class="flex flex-wrap gap-2">
        <UiButton :loading="loading" :disabled="loading" @click="emit('confirm')">
          تأیید رزرو
        </UiButton>
        <UiButton variant="secondary" :disabled="loading" @click="handleCancel">انصراف</UiButton>
      </div>
    </div>
  </UiModal>
</template>
