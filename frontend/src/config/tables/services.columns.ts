import type { DataTableColumn, RowAction } from "@/types/dataTable";
import { jalaliDateColumn } from "./_formatters";
import { crudRowActions } from "./_rowActions";

export interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  defaultDuration: number;
  basePrice: string;
  isActive: boolean;
  createdAt: string;
  category: { id: string; name: string };
}

export const servicesColumns: DataTableColumn[] = [
  { key: "name", label: "نام", sortable: true, filterable: true, filterType: "text" },
  {
    key: "category",
    label: "دسته",
    formatter: (r) => (r as unknown as ServiceRow).category?.name ?? "—",
  },
  {
    key: "basePrice",
    label: "قیمت پایه",
    sortable: true,
    formatter: (r) => Number((r as unknown as ServiceRow).basePrice).toLocaleString("fa-IR"),
  },
  {
    key: "defaultDuration",
    label: "مدت (دقیقه)",
    formatter: (r) => `${(r as unknown as ServiceRow).defaultDuration}`,
  },
  {
    key: "isActive",
    label: "وضعیت",
    filterable: true,
    filterType: "boolean",
    formatter: (r) => ((r as unknown as ServiceRow).isActive ? "فعال" : "غیرفعال"),
  },
  jalaliDateColumn("createdAt", "تاریخ ایجاد"),
];

export const servicesRowActions: RowAction[] = crudRowActions();
