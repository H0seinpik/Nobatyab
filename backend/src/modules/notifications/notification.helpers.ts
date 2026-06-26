import { NotificationRecipientRole, NotificationStatus, NotificationType, Role } from "@prisma/client";

export type NotificationCategory = "booking" | "payment" | "request" | "system";

const BOOKING_TYPES = new Set<NotificationType>([
  NotificationType.APPOINTMENT_BOOKED,
  NotificationType.APPOINTMENT_CONFIRMED,
  NotificationType.APPOINTMENT_CANCELLED,
  NotificationType.APPOINTMENT_COMPLETED,
  NotificationType.NEW_APPOINTMENT_BOOKED,
  NotificationType.APPOINTMENT_CANCELLED_BY_USER,
]);

const PAYMENT_TYPES = new Set<NotificationType>([
  NotificationType.PAYMENT_PENDING,
  NotificationType.PAYMENT_COMPLETED,
  NotificationType.PAYMENT_FAILED,
  NotificationType.PAYMENT_REFUNDED,
]);

const REQUEST_TYPES = new Set<NotificationType>([
  NotificationType.NEW_PROVIDER_REQUEST,
  NotificationType.NEW_SERVICE_REQUEST,
  NotificationType.PROVIDER_REQUEST_APPROVED,
  NotificationType.PROVIDER_REQUEST_REJECTED,
  NotificationType.SERVICE_REQUEST_APPROVED,
  NotificationType.SERVICE_REQUEST_REJECTED,
]);

export function getNotificationCategory(type: NotificationType): NotificationCategory {
  if (BOOKING_TYPES.has(type)) return "booking";
  if (PAYMENT_TYPES.has(type)) return "payment";
  if (REQUEST_TYPES.has(type)) return "request";
  return "system";
}

const PENDING_TYPES = new Set<NotificationType>([
  NotificationType.APPOINTMENT_BOOKED,
  NotificationType.PAYMENT_PENDING,
  NotificationType.NEW_APPOINTMENT_BOOKED,
  NotificationType.NEW_PROVIDER_REQUEST,
  NotificationType.NEW_SERVICE_REQUEST,
  NotificationType.PAYMENT_FAILED,
]);

const CONFIRMED_TYPES = new Set<NotificationType>([
  NotificationType.APPOINTMENT_CONFIRMED,
  NotificationType.PROVIDER_REQUEST_APPROVED,
  NotificationType.SERVICE_REQUEST_APPROVED,
]);

const CANCELLED_TYPES = new Set<NotificationType>([
  NotificationType.APPOINTMENT_CANCELLED,
  NotificationType.APPOINTMENT_CANCELLED_BY_USER,
  NotificationType.PROVIDER_REQUEST_REJECTED,
  NotificationType.SERVICE_REQUEST_REJECTED,
]);

const COMPLETED_TYPES = new Set<NotificationType>([
  NotificationType.PAYMENT_COMPLETED,
  NotificationType.APPOINTMENT_COMPLETED,
  NotificationType.PAYMENT_REFUNDED,
]);

export function getStatusForType(type: NotificationType): NotificationStatus {
  if (PENDING_TYPES.has(type)) return NotificationStatus.PENDING;
  if (CONFIRMED_TYPES.has(type)) return NotificationStatus.CONFIRMED;
  if (CANCELLED_TYPES.has(type)) return NotificationStatus.CANCELLED;
  if (COMPLETED_TYPES.has(type)) return NotificationStatus.COMPLETED;
  return NotificationStatus.PENDING;
}

export type NotificationStatusFilter =
  | "all"
  | "unread"
  | "confirmed"
  | "cancelled"
  | "pending"
  | "completed";

export function roleToRecipientRole(role: Role): NotificationRecipientRole {
  switch (role) {
    case Role.PROVIDER:
      return NotificationRecipientRole.PROVIDER;
    case Role.ADMIN:
      return NotificationRecipientRole.ADMIN;
    default:
      return NotificationRecipientRole.USER;
  }
}

export function getTypesForCategory(category: NotificationCategory): NotificationType[] {
  switch (category) {
    case "booking":
      return [...BOOKING_TYPES];
    case "payment":
      return [...PAYMENT_TYPES];
    case "request":
      return [...REQUEST_TYPES];
    default:
      return Object.values(NotificationType).filter(
        (t) => !BOOKING_TYPES.has(t) && !PAYMENT_TYPES.has(t) && !REQUEST_TYPES.has(t),
      );
  }
}

export const NOTIFICATION_COPY: Record<
  NotificationType,
  { title: string; message: string }
> = {
  [NotificationType.APPOINTMENT_BOOKED]: {
    title: "ثبت نوبت",
    message: "نوبت شما با موفقیت ثبت شد",
  },
  [NotificationType.APPOINTMENT_CONFIRMED]: {
    title: "تایید نوبت",
    message: "نوبت شما تایید شد",
  },
  [NotificationType.APPOINTMENT_CANCELLED]: {
    title: "لغو نوبت",
    message: "نوبت شما لغو شد",
  },
  [NotificationType.APPOINTMENT_COMPLETED]: {
    title: "انجام نوبت",
    message: "نوبت شما انجام شد",
  },
  [NotificationType.PAYMENT_PENDING]: {
    title: "پرداخت در انتظار",
    message: "پرداخت شما در انتظار است",
  },
  [NotificationType.PAYMENT_COMPLETED]: {
    title: "پرداخت موفق",
    message: "پرداخت شما با موفقیت انجام شد",
  },
  [NotificationType.PAYMENT_FAILED]: {
    title: "پرداخت ناموفق",
    message: "پرداخت شما ناموفق بود",
  },
  [NotificationType.PAYMENT_REFUNDED]: {
    title: "بازگشت وجه",
    message: "مبلغ پرداخت به حساب شما بازگردانده شد",
  },
  [NotificationType.PROVIDER_REQUEST_APPROVED]: {
    title: "تایید درخواست",
    message: "درخواست ارائه‌دهنده شما تایید شد",
  },
  [NotificationType.PROVIDER_REQUEST_REJECTED]: {
    title: "رد درخواست",
    message: "درخواست ارائه‌دهنده شما رد شد",
  },
  [NotificationType.SERVICE_REQUEST_APPROVED]: {
    title: "تایید خدمت",
    message: "درخواست خدمت شما تایید شد",
  },
  [NotificationType.SERVICE_REQUEST_REJECTED]: {
    title: "رد خدمت",
    message: "درخواست خدمت شما رد شد",
  },
  [NotificationType.NEW_APPOINTMENT_BOOKED]: {
    title: "نوبت جدید",
    message: "یک نوبت جدید برای شما ثبت شد",
  },
  [NotificationType.APPOINTMENT_CANCELLED_BY_USER]: {
    title: "لغو نوبت",
    message: "یک نوبت لغو شد",
  },
  [NotificationType.NEW_PROVIDER_REQUEST]: {
    title: "درخواست ارائه‌دهنده",
    message: "یک درخواست ثبت‌نام ارائه‌دهنده جدید ارسال شد",
  },
  [NotificationType.NEW_SERVICE_REQUEST]: {
    title: "درخواست خدمت",
    message: "یک درخواست خدمت جدید ارسال شد",
  },
};

export function getCopyForType(
  type: NotificationType,
  overrides?: Partial<{ title: string; message: string }>,
) {
  const base = NOTIFICATION_COPY[type];
  return {
    title: overrides?.title ?? base.title,
    message: overrides?.message ?? base.message,
  };
}

export function resolveActionUrl(role: Role, type: NotificationType): string | null {
  if (role === Role.USER) {
    if (BOOKING_TYPES.has(type) || PAYMENT_TYPES.has(type)) return "/appointments";
    if (type === NotificationType.PROVIDER_REQUEST_APPROVED || type === NotificationType.PROVIDER_REQUEST_REJECTED) {
      return "/profile";
    }
    return null;
  }

  if (role === Role.PROVIDER) {
    if (BOOKING_TYPES.has(type) || PAYMENT_TYPES.has(type)) return "/provider/appointments";
    if (REQUEST_TYPES.has(type)) return "/provider/service-requests";
    return null;
  }

  if (role === Role.ADMIN) {
    if (type === NotificationType.NEW_PROVIDER_REQUEST) return "/admin/provider-requests";
    if (type === NotificationType.NEW_SERVICE_REQUEST) return "/admin/service-requests";
    if (
      type === NotificationType.NEW_APPOINTMENT_BOOKED ||
      type === NotificationType.APPOINTMENT_CANCELLED ||
      type === NotificationType.PAYMENT_COMPLETED ||
      BOOKING_TYPES.has(type) ||
      PAYMENT_TYPES.has(type)
    ) {
      return "/admin/appointments";
    }
    return null;
  }

  return null;
}
