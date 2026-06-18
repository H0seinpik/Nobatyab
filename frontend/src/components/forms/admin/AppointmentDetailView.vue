<script setup lang="ts">
import { formatJalaliDateTime } from "@/utils/datetime";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import type { AppointmentRow } from "@/config/tables/appointments.columns";

defineProps<{ appointment: AppointmentRow }>();
</script>

<template>
  <dl class="space-y-3 text-sm">
    <div class="flex justify-between gap-4">
      <dt class="text-[var(--color-muted)]">خدمت</dt>
      <dd>{{ appointment.providerService?.service?.name ?? "—" }}</dd>
    </div>
    <div class="flex justify-between gap-4">
      <dt class="text-[var(--color-muted)]">ارائه‌دهنده</dt>
      <dd>{{ appointment.provider?.user?.fullName ?? "—" }}</dd>
    </div>
    <div class="flex justify-between gap-4">
      <dt class="text-[var(--color-muted)]">مشتری</dt>
      <dd>{{ appointment.user?.fullName ?? appointment.guestFullName ?? "مهمان" }}</dd>
    </div>
    <div class="flex justify-between gap-4">
      <dt class="text-[var(--color-muted)]">زمان</dt>
      <dd>{{ formatJalaliDateTime(appointment.startAt) }}</dd>
    </div>
    <div class="flex items-center justify-between gap-4">
      <dt class="text-[var(--color-muted)]">وضعیت</dt>
      <dd><StatusBadge kind="appointment" :value="appointment.status" /></dd>
    </div>
    <div class="flex items-center justify-between gap-4">
      <dt class="text-[var(--color-muted)]">پرداخت</dt>
      <dd><StatusBadge kind="payment" :value="appointment.paymentStatus" /></dd>
    </div>
  </dl>
</template>
