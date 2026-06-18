export type StatusTone = "default" | "success" | "warning" | "danger" | "info";

export interface StatusConfig {
  label: string;
  tone: StatusTone;
}

export type StatusKind =
  | "review"
  | "appointment"
  | "payment"
  | "active"
  | "role";

const REVIEW_STATUSES: Record<string, StatusConfig> = {
  PENDING: { label: "در انتظار", tone: "warning" },
  APPROVED: { label: "تأیید شده", tone: "success" },
  REJECTED: { label: "رد شده", tone: "danger" },
};

const APPOINTMENT_STATUSES: Record<string, StatusConfig> = {
  PENDING: { label: "در انتظار", tone: "warning" },
  CONFIRMED: { label: "تأیید شده", tone: "info" },
  COMPLETED: { label: "انجام شده", tone: "success" },
  CANCELLED: { label: "لغو شده", tone: "danger" },
};

const PAYMENT_STATUSES: Record<string, StatusConfig> = {
  PENDING: { label: "در انتظار پرداخت", tone: "warning" },
  PAID: { label: "پرداخت شده", tone: "success" },
  FAILED: { label: "ناموفق", tone: "danger" },
  REFUNDED: { label: "بازگشت داده شده", tone: "info" },
};

const ACTIVE_STATUSES: Record<string, StatusConfig> = {
  true: { label: "فعال", tone: "success" },
  false: { label: "غیرفعال", tone: "danger" },
};

const ROLE_STATUSES: Record<string, StatusConfig> = {
  ADMIN: { label: "مدیر", tone: "danger" },
  PROVIDER: { label: "ارائه‌دهنده", tone: "info" },
  USER: { label: "کاربر", tone: "default" },
};

const STATUS_MAPS: Record<StatusKind, Record<string, StatusConfig>> = {
  review: REVIEW_STATUSES,
  appointment: APPOINTMENT_STATUSES,
  payment: PAYMENT_STATUSES,
  active: ACTIVE_STATUSES,
  role: ROLE_STATUSES,
};

export function getStatusConfig(kind: StatusKind, value: unknown): StatusConfig {
  const key = String(value ?? "");
  const map = STATUS_MAPS[kind];
  return map[key] ?? { label: key || "—", tone: "default" };
}

import type { RowAction } from "@/types/dataTable";

export function getVisibleRowActions<T extends Record<string, unknown>>(
  actions: RowAction[] | undefined,
  row: T,
): RowAction[] {
  if (!actions?.length) return [];
  return actions.filter((action) => !action.hidden?.(row));
}
