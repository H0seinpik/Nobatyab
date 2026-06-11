import type { DataTableColumn, RowAction } from "@/types/dataTable";

export interface UserRow {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const usersColumns: DataTableColumn[] = [
  { key: "fullName", label: "نام", sortable: true, filterable: true, filterType: "text" },
  { key: "email", label: "ایمیل", sortable: true },
  { key: "phone", label: "تلفن" },
  {
    key: "role",
    label: "نقش",
    sortable: true,
    filterable: true,
    filterType: "select",
    filterOptions: [
      { label: "مدیر", value: "ADMIN" },
      { label: "ارائه‌دهنده", value: "PROVIDER" },
      { label: "کاربر", value: "USER" },
    ],
  },
  {
    key: "isActive",
    label: "وضعیت",
    filterable: true,
    filterType: "boolean",
    formatter: (r) => ((r as unknown as UserRow).isActive ? "فعال" : "غیرفعال"),
  },
  { key: "createdAt", label: "تاریخ ثبت", sortable: true, filterType: "date" },
];

export const usersRowActions: RowAction[] = [
  { key: "toggle-active", label: "فعال/غیرفعال" },
  {
    key: "set-provider",
    label: "تبدیل به ارائه‌دهنده",
    hidden: (r) => (r as unknown as UserRow).role === "ADMIN",
  },
  {
    key: "set-user",
    label: "تبدیل به کاربر",
    hidden: (r) => {
      const u = r as unknown as UserRow;
      return u.role === "ADMIN" || u.role === "USER";
    },
  },
];
