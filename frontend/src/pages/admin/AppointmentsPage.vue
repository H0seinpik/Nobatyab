<script setup lang="ts">
import { ref } from "vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiButton from "@/components/ui/UiButton.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";
import AppointmentDetailView from "@/components/forms/admin/AppointmentDetailView.vue";
import { formatJalaliDateTime } from "@/utils/datetime";
import {
  appointmentsColumns,
  appointmentsRowActions,
  type AppointmentRow,
} from "@/config/tables/appointments.columns";

const detailOpen = ref(false);
const selectedAppointment = ref<AppointmentRow | null>(null);

function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  if (action === "view") {
    selectedAppointment.value = row as unknown as AppointmentRow;
    detailOpen.value = true;
  }
}
</script>

<template>
  <div>
    <PageHeader title="همه نوبت‌ها" description="مشاهده و پیگیری نوبت‌های ثبت‌شده" />

    <DataTable
      title="نوبت‌ها"
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

    <UiModal v-model:open="detailOpen" title="جزئیات نوبت">
      <AppointmentDetailView v-if="selectedAppointment" :appointment="selectedAppointment" />
      <template #footer>
        <div class="flex justify-end">
          <UiButton variant="secondary" @click="detailOpen = false">بستن</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
