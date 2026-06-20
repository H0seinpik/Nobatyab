<script setup lang="ts">
import { Calendar, CheckCircle, Clock } from "lucide-vue-next";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard.vue";
import { formatPersianNumber } from "@/utils/numbers";
import { formatJalaliDateTime } from "@/utils/datetime";

defineProps<{
  upcomingCount: number;
  completedCount: number;
  nextAppointmentAt?: string | null;
}>();
</script>

<template>
  <div class="user-dashboard-stats">
    <DashboardStatCard
      label="نوبت‌های آینده"
      :value="formatPersianNumber(upcomingCount)"
      :icon="Clock"
    />
    <DashboardStatCard
      label="نوبت‌های انجام‌شده"
      :value="formatPersianNumber(completedCount)"
      :icon="CheckCircle"
    />
    <DashboardStatCard
      label="نوبت بعدی"
      :value="nextAppointmentAt ? formatJalaliDateTime(nextAppointmentAt) : '—'"
      :icon="Calendar"
    />
  </div>
</template>

<style scoped>
.user-dashboard-stats {
  display: grid;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .user-dashboard-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
