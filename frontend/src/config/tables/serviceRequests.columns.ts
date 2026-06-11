import type { DataTableColumn, RowAction } from "@/types/dataTable";
import { formatJalaliDateTime } from "@/utils/datetime";

export interface ServiceRequestRow {
  id: string;
  status: string;
  serviceId: string | null;
  proposedName: string | null;
  proposedPrice: string | null;
  proposedDuration: number | null;
  createdAt: string;
  provider: { user: { fullName: string } };
  service: { name: string } | null;
}

export const serviceRequestsColumns: DataTableColumn[] = [
  {
    key: "name",
    label: "خدمت",
    formatter: (r) => {
      const row = r as unknown as ServiceRequestRow;
      return row.service?.name ?? row.proposedName ?? "—";
    },
  },
  {
    key: "provider",
    label: "ارائه‌دهنده",
    formatter: (r) => (r as unknown as ServiceRequestRow).provider?.user?.fullName ?? "—",
  },
  {
    key: "status",
    label: "وضعیت",
    filterable: true,
    filterType: "select",
    filterOptions: [
      { label: "در انتظار", value: "PENDING" },
      { label: "تأیید شده", value: "APPROVED" },
      { label: "رد شده", value: "REJECTED" },
    ],
  },
  {
    key: "createdAt",
    label: "تاریخ",
    sortable: true,
    formatter: (r) => formatJalaliDateTime((r as unknown as ServiceRequestRow).createdAt),
  },
];

export const serviceRequestsRowActions: RowAction[] = [
  { key: "review", label: "بررسی" },
];
