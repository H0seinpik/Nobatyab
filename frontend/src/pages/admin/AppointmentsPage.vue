<script setup lang="ts">
import DataTable from "@/components/ui/data-table/DataTable.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";
import { formatJalaliDateTime } from "@/utils/datetime";
import {
  appointmentsColumns,
  appointmentsRowActions,
  type AppointmentRow,
} from "@/config/tables/appointments.columns";

function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const apt = row as unknown as AppointmentRow;
  if (action === "view") {
    alert(
      `${apt.providerService.service.name}\n${apt.provider.user.fullName}\n${formatJalaliDateTime(apt.startAt)}`,
    );
  }
}
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold">همه نوبت‌ها</h1>
    <DataTable
      endpoint="/admin/appointments"
      :columns="appointmentsColumns"
      :row-actions="appointmentsRowActions"
      searchable
      advanced-filters
      default-sort="startAt:desc"
      @row-action="onRowAction"
    >
      <template #cell-startAt="{ row }">
        {{ formatJalaliDateTime(String(row.startAt)) }}
      </template>
      <template #cell-status="{ row }">
        <AppointmentStatusBadge :status="String(row.status)" />
      </template>
      <template #cell-paymentStatus="{ row }">
        <AppointmentStatusBadge :status="String(row.paymentStatus)" />
      </template>
    </DataTable>
  </div>
</template>
