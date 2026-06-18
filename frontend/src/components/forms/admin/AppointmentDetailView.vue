<script setup lang="ts">
import { formatJalaliDateTime } from "@/utils/datetime";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import type { AppointmentRow } from "@/config/tables/appointments.columns";

defineProps<{ appointment: AppointmentRow }>();
</script>

<template>
  <dl class="detail-list">
    <div class="detail-list__row">
      <dt class="detail-list__term">خدمت</dt>
      <dd class="detail-list__value">{{ appointment.providerService?.service?.name ?? "—" }}</dd>
    </div>
    <div class="detail-list__row">
      <dt class="detail-list__term">ارائه‌دهنده</dt>
      <dd class="detail-list__value">{{ appointment.provider?.user?.fullName ?? "—" }}</dd>
    </div>
    <div class="detail-list__row">
      <dt class="detail-list__term">مشتری</dt>
      <dd class="detail-list__value">{{ appointment.user?.fullName ?? appointment.guestFullName ?? "مهمان" }}</dd>
    </div>
    <div class="detail-list__row">
      <dt class="detail-list__term">زمان</dt>
      <dd class="detail-list__value">{{ formatJalaliDateTime(appointment.startAt) }}</dd>
    </div>
    <div class="detail-list__row detail-list__row--centered">
      <dt class="detail-list__term">وضعیت</dt>
      <dd class="detail-list__value"><StatusBadge kind="appointment" :value="appointment.status" /></dd>
    </div>
    <div class="detail-list__row detail-list__row--centered">
      <dt class="detail-list__term">پرداخت</dt>
      <dd class="detail-list__value"><StatusBadge kind="payment" :value="appointment.paymentStatus" /></dd>
    </div>
  </dl>
</template>

<style scoped>
.detail-list {
  font-size: 0.875rem;
}

.detail-list > * + * {
  margin-top: 0.75rem;
}

.detail-list__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.detail-list__row--centered {
  align-items: center;
}

.detail-list__term {
  color: var(--color-muted);
}
</style>
