<script setup lang="ts">
import UiButton from "@/components/ui/UiButton.vue";
import UiInput from "@/components/ui/UiInput.vue";
import CountdownCard from "@/components/booking/CountdownCard.vue";

defineProps<{
  isAuthenticated: boolean;
  guestFullName: string;
  guestPhone: string;
  guestEmail: string;
  notes: string;
  fieldError: (field: string) => string | undefined;
  bookingError?: string;
  canBook: boolean;
  booking: boolean;
  holdActive?: boolean;
  hasSelectedSlot?: boolean;
  countdownFormatted?: string;
  countdownExpired?: boolean;
}>();

const emit = defineEmits<{
  "update:guestFullName": [value: string];
  "update:guestPhone": [value: string];
  "update:guestEmail": [value: string];
  "update:notes": [value: string];
  touch: [field: string];
  submit: [];
}>();
</script>

<template>
  <CountdownCard
    v-if="holdActive && hasSelectedSlot"
    :formatted="countdownFormatted ?? ''"
    :expired="countdownExpired ?? false"
  />

  <form class="confirm-booking-panel" @submit.prevent="emit('submit')">
    <template v-if="!isAuthenticated">
      <UiInput
        :model-value="guestFullName"
        label="نام"
        required
        :error="fieldError('guestFullName')"
        @update:model-value="emit('update:guestFullName', $event)"
        @blur="emit('touch', 'guestFullName')"
      />
      <UiInput
        :model-value="guestPhone"
        label="موبایل"
        required
        :error="fieldError('guestPhone')"
        @update:model-value="emit('update:guestPhone', $event)"
        @blur="emit('touch', 'guestPhone')"
      />
      <UiInput
        :model-value="guestEmail"
        label="ایمیل (اختیاری)"
        type="email"
        :error="fieldError('guestEmail')"
        @update:model-value="emit('update:guestEmail', $event)"
        @blur="emit('touch', 'guestEmail')"
      />
    </template>
    <UiInput
      :model-value="notes"
      label="توضیحات"
      :error="fieldError('notes')"
      @update:model-value="emit('update:notes', $event)"
      @blur="emit('touch', 'notes')"
    />
    <p v-if="bookingError" class="confirm-booking-panel__error" role="alert">{{ bookingError }}</p>
    <UiButton type="submit" :disabled="!canBook || booking" :loading="booking">
      ثبت نوبت
    </UiButton>
  </form>
</template>

<style scoped>
.confirm-booking-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.confirm-booking-panel__error {
  font-size: var(--text-sm);
  color: var(--color-danger);
}
</style>
