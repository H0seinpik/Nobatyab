import type { DataTableColumn, RowAction } from "@/types/dataTable";
import { formatJalaliDateTime } from "@/utils/datetime";

export interface AppointmentRow {
  id: string;
  startAt: string;
  status: string;
  paymentStatus: string;
  guestFullName: string | null;
  provider: { user: { fullName: string } };
  providerService: { service: { name: string } };
  user: { fullName: string } | null;
}

export const appointmentsColumns: DataTableColumn[] = [
  {
    key: "service",
    label: "خدمت",
    formatter: (r) => (r as unknown as AppointmentRow).providerService?.service?.name ?? "—",
  },
  {
    key: "provider",
    label: "ارائه‌دهنده",
    formatter: (r) => (r as unknown as AppointmentRow).provider?.user?.fullName ?? "—",
  },
  {
    key: "customer",
    label: "مشتری",
    formatter: (r) => {
      const a = r as unknown as AppointmentRow;
      return a.user?.fullName ?? a.guestFullName ?? "مهمان";
    },
  },
  {
    key: "startAt",
    label: "زمان",
    sortable: true,
    filterable: true,
    filterType: "date",
    formatter: (r) => formatJalaliDateTime((r as unknown as AppointmentRow).startAt),
  },
  {
    key: "status",
    label: "وضعیت",
    sortable: true,
    filterable: true,
    filterType: "select",
    statusKind: "appointment",
    filterOptions: [
      { label: "در انتظار", value: "PENDING" },
      { label: "تأیید شده", value: "CONFIRMED" },
      { label: "لغو شده", value: "CANCELLED" },
      { label: "انجام شده", value: "COMPLETED" },
    ],
  },
  {
    key: "paymentStatus",
    label: "پرداخت",
    filterable: true,
    filterType: "select",
    statusKind: "payment",
    filterOptions: [
      { label: "در انتظار", value: "PENDING" },
      { label: "پرداخت شده", value: "PAID" },
      { label: "ناموفق", value: "FAILED" },
      { label: "بازگشت", value: "REFUNDED" },
    ],
  },
];

export const appointmentsRowActions: RowAction[] = [
  { key: "view", label: "مشاهده جزئیات" },
  {
    key: "cancel",
    label: "لغو نوبت",
    variant: "danger",
    hidden: (row) => {
      const a = row as unknown as AppointmentRow;
      if (a.status === "CANCELLED" || a.status === "COMPLETED") return true;
      return new Date(a.startAt) <= new Date();
    },
  },
];
