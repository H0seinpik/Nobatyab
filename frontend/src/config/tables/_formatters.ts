import type { DataTableColumn } from "@/types/dataTable";
import { formatJalaliDate, formatJalaliDateTime } from "@/utils/datetime";

export function jalaliDateColumn(key: string, label: string, opts?: Partial<DataTableColumn>): DataTableColumn {
  return {
    key,
    label,
    sortable: true,
    filterable: true,
    filterType: "date",
    formatter: (r) => {
      const val = (r as Record<string, unknown>)[key];
      return val ? formatJalaliDate(String(val)) : "—";
    },
    ...opts,
  };
}

export function jalaliDateTimeColumn(key: string, label: string, opts?: Partial<DataTableColumn>): DataTableColumn {
  return {
    key,
    label,
    sortable: true,
    filterable: true,
    filterType: "date",
    formatter: (r) => {
      const val = (r as Record<string, unknown>)[key];
      return val ? formatJalaliDateTime(String(val)) : "—";
    },
    ...opts,
  };
}
