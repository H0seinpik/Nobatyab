import type { StatusKind } from "@/config/statuses";

export type FilterType = "text" | "select" | "boolean" | "date";

export interface FilterOption {
  label: string;
  value: string | boolean;
}

export interface DataTableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: FilterOption[];
  formatter?: (row: T) => string;
  statusKind?: StatusKind;
  width?: string;
}

export interface RowAction<T = Record<string, unknown>> {
  key: string;
  label: string;
  variant?: "default" | "danger";
  hidden?: (row: T) => boolean;
}

export interface BulkAction<_T = Record<string, unknown>> {
  key: string;
  label: string;
  variant?: "default" | "danger";
}

export interface ListQueryState {
  page: number;
  pageSize: number;
  search: string;
  sort: string;
  filter: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  limit?: number;
  total: number;
  totalPages: number;
}

export interface DataTableLoadPayload<T> {
  rows: T[];
  meta: PaginationMeta;
}
