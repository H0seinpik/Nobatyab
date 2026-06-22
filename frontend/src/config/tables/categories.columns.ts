import type { DataTableColumn, RowAction } from "@/types/dataTable";
import { jalaliDateColumn } from "./_formatters";
import { crudRowActions } from "./_rowActions";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { services: number };
}

export const categoriesColumns: DataTableColumn[] = [
  { key: "name", label: "نام", sortable: true, filterable: true, filterType: "text" },
  { key: "slug", label: "نامک", sortable: true },
  {
    key: "services",
    label: "خدمات",
    formatter: (r) => String((r as unknown as CategoryRow)._count?.services ?? 0),
  },
  {
    key: "isActive",
    label: "وضعیت",
    filterable: true,
    filterType: "boolean",
    statusKind: "active",
  },
  jalaliDateColumn("createdAt", "تاریخ ایجاد"),
];

export const categoriesRowActions: RowAction[] = crudRowActions();
