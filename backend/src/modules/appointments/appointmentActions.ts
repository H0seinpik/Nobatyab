import { AppointmentStatus, PaymentStatus } from "@prisma/client";

export interface AppointmentAction {
  enabled: boolean;
  reason?: string;
}

export interface UserAppointmentActions {
  cancel: AppointmentAction;
  pay: AppointmentAction;
  review: AppointmentAction;
  viewDetails: AppointmentAction;
}

export function computeUserAppointmentActions(
  appointment: {
    status: AppointmentStatus;
    paymentStatus: PaymentStatus;
    startAt: Date;
  },
  cancellationPolicy?: { minHoursBefore: number } | null,
): UserAppointmentActions {
  const now = new Date();
  const viewDetails: AppointmentAction = { enabled: true };

  let cancel: AppointmentAction = { enabled: false };
  if (appointment.status === AppointmentStatus.CANCELLED) {
    cancel = { enabled: false, reason: "این نوبت قبلاً لغو شده است" };
  } else if (appointment.status === AppointmentStatus.COMPLETED) {
    cancel = { enabled: false, reason: "نوبت‌های انجام‌شده قابل لغو نیستند" };
  } else if (appointment.startAt <= now) {
    cancel = { enabled: false, reason: "امکان لغو نوبت گذشته وجود ندارد" };
  } else {
    const minHoursBefore = cancellationPolicy?.minHoursBefore ?? 24;
    const deadline = new Date(
      appointment.startAt.getTime() - minHoursBefore * 60 * 60 * 1000,
    );
    if (now > deadline) {
      cancel = {
        enabled: false,
        reason: `لغو باید حداقل ${minHoursBefore} ساعت قبل از نوبت انجام شود`,
      };
    } else {
      cancel = { enabled: true };
    }
  }

  let pay: AppointmentAction = { enabled: false };
  if (appointment.status === AppointmentStatus.CANCELLED) {
    pay = { enabled: false, reason: "نوبت لغو شده قابل پرداخت نیست" };
  } else if (appointment.paymentStatus === PaymentStatus.PAID) {
    pay = { enabled: false, reason: "این نوبت قبلاً پرداخت شده است" };
  } else if (appointment.paymentStatus === PaymentStatus.PENDING) {
    pay = { enabled: true };
  } else {
    pay = { enabled: false, reason: "پرداخت برای این نوبت در دسترس نیست" };
  }

  const review: AppointmentAction =
    appointment.status === AppointmentStatus.COMPLETED
      ? { enabled: true }
      : { enabled: false, reason: "ثبت نظر فقط برای نوبت‌های انجام‌شده امکان‌پذیر است" };

  return { cancel, pay, review, viewDetails };
}
