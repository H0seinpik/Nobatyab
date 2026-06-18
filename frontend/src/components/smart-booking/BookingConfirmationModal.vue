<script setup lang="ts">
import { computed } from "vue";
import type { EnrichedSuggestion } from "@/types/smartBooking";
import { formatJalaliDateTime } from "@/utils/datetime";
import { formatPersianNumber } from "@/utils/numbers";
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
  props.suggestion ? formatPersianNumber(props.suggestion.price) : "",
);

function handleCancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <UiModal v-model:open="open" title="تأیید رزرو" size="md" :close-on-overlay="!loading">
    <div v-if="suggestion" class="booking-confirmation">
      <div class="booking-confirmation__details">
        <p><span class="booking-confirmation__label">خدمت:</span> {{ suggestion.serviceName }}</p>
        <p><span class="booking-confirmation__label">ارائه‌دهنده:</span> {{ suggestion.providerName }}</p>
        <p>
          <span class="booking-confirmation__label">زمان:</span>
          {{ formatJalaliDateTime(suggestion.startTime) }}
        </p>
        <p><span class="booking-confirmation__label">هزینه:</span> {{ priceLabel }} تومان</p>
      </div>

      <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>

      <div class="booking-confirmation__actions">
        <UiButton :loading="loading" :disabled="loading" @click="emit('confirm')">
          تأیید رزرو
        </UiButton>
        <UiButton variant="secondary" :disabled="loading" @click="handleCancel">انصراف</UiButton>
      </div>
    </div>
  </UiModal>
</template>

<style scoped>
.booking-confirmation > * + * {
  margin-top: 1rem;
}

.booking-confirmation__details {
  font-size: 0.875rem;
}

.booking-confirmation__details > * + * {
  margin-top: 0.5rem;
}

.booking-confirmation__label {
  color: var(--color-muted);
}

.booking-confirmation__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
