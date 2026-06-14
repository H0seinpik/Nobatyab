<script setup lang="ts">
import { ref } from "vue";
import DataTable from "@/components/ui/data-table/DataTable.vue";
import PageHeader from "@/components/layout/PageHeader.vue";
import UiModal from "@/components/ui/UiModal.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiConfirmDialog from "@/components/ui/UiConfirmDialog.vue";
import AppointmentStatusBadge from "@/components/booking/AppointmentStatusBadge.vue";
import AppointmentDetailView from "@/components/forms/admin/AppointmentDetailView.vue";
import { formatJalaliDateTime } from "@/utils/datetime";
import { cancelAppointment } from "@/services/appointment.service";
import {
  appointmentsColumns,
  appointmentsRowActions,
  type AppointmentRow,
} from "@/config/tables/appointments.columns";

const tableRef = ref<{ refresh: () => void } | null>(null);
const detailOpen = ref(false);
const selectedAppointment = ref<AppointmentRow | null>(null);

const confirmOpen = ref(false);
const cancelling = ref(false);
const cancelTarget = ref<AppointmentRow | null>(null);
const cancelError = ref("");

function onRowAction({ action, row }: { action: string; row: Record<string, unknown> }) {
  const appointment = row as unknown as AppointmentRow;
  if (action === "view") {
    selectedAppointment.value = appointment;
    detailOpen.value = true;
  } else if (action === "cancel") {
    cancelTarget.value = appointment;
    cancelError.value = "";
    confirmOpen.value = true;
  }
}

async function onConfirmCancel() {
  if (!cancelTarget.value || cancelling.value) return;

  cancelling.value = true;
  cancelError.value = "";
  try {
    await cancelAppointment(cancelTarget.value.id, "لغو توسط مدیر");
    confirmOpen.value = false;
    cancelTarget.value = null;
    detailOpen.value = false;
    selectedAppointment.value = null;
    tableRef.value?.refresh();
  } catch {
    cancelError.value = "لغو نوبت ناموفق بود.";
  } finally {
    cancelling.value = false;
  }
}

function onCancelDialog() {
  if (!cancelling.value) {
    cancelTarget.value = null;
    cancelError.value = "";
  }
}
</script>

<template>
  <div>
    <PageHeader title="همه نوبت‌ها" description="مشاهده و پیگیری نوبت‌های ثبت‌شده" />

    <DataTable
      ref="tableRef"
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
        <div class="flex justify-end gap-2">
          <UiButton
            v-if="
              selectedAppointment &&
              selectedAppointment.status !== 'CANCELLED' &&
              selectedAppointment.status !== 'COMPLETED' &&
              new Date(selectedAppointment.startAt) > new Date()
            "
            variant="danger"
            @click="
              cancelTarget = selectedAppointment;
              confirmOpen = true;
            "
          >
            لغو نوبت
          </UiButton>
          <UiButton variant="secondary" @click="detailOpen = false">بستن</UiButton>
        </div>
      </template>
    </UiModal>

    <UiConfirmDialog
      v-model:open="confirmOpen"
      title="لغو نوبت"
      :message="
        cancelTarget
          ? `آیا از لغو نوبت ${cancelTarget.user?.fullName ?? cancelTarget.guestFullName ?? 'مهمان'} اطمینان دارید؟`
          : 'آیا از لغو این نوبت اطمینان دارید؟'
      "
      variant="danger"
      confirm-label="لغو نوبت"
      :loading="cancelling"
      @confirm="onConfirmCancel"
      @cancel="onCancelDialog"
    />
    <p v-if="cancelError" class="mt-2 text-sm text-red-600">{{ cancelError }}</p>
  </div>
</template>
