import type { NotificationCategory } from "@/services/notification.service";

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  booking: "📅",
  payment: "💰",
  request: "📨",
  system: "🔔",
};

const TYPE_ICONS: Record<string, string> = {
  APPOINTMENT_CANCELLED: "❌",
  APPOINTMENT_CANCELLED_BY_USER: "❌",
  APPOINTMENT_CONFIRMED: "✅",
  APPOINTMENT_COMPLETED: "✅",
  PAYMENT_COMPLETED: "✅",
  PAYMENT_PENDING: "⚠️",
  PAYMENT_FAILED: "⚠️",
  PROVIDER_REQUEST_APPROVED: "✅",
  SERVICE_REQUEST_APPROVED: "✅",
  PROVIDER_REQUEST_REJECTED: "❌",
  SERVICE_REQUEST_REJECTED: "❌",
};

export function getNotificationIcon(type: string, category: NotificationCategory): string {
  return TYPE_ICONS[type] ?? CATEGORY_ICONS[category] ?? "🔔";
}
