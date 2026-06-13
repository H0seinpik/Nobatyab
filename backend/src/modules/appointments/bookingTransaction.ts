import { AppointmentStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { isUniqueConstraintError } from "../../shared/utils/prismaErrors.js";
import { ApiError } from "../../shared/utils/apiError.js";

const appointmentInclude = {
  provider: { include: { user: { select: { fullName: true } } } },
  providerService: { include: { service: true } },
  user: { select: { id: true, fullName: true, email: true, phone: true } },
} as const;

export type CreateAppointmentData = {
  providerId: string;
  providerServiceId: string;
  userId?: string;
  guestFullName?: string;
  guestPhone?: string;
  guestEmail?: string;
  startAt: Date;
  endAt: Date;
  notes?: string;
};

export type BookingTransactionResult = {
  appointment: Awaited<ReturnType<typeof loadAppointmentById>>;
  isReplay: boolean;
};

export async function lockTimeSlots(
  tx: Prisma.TransactionClient,
  timeSlotIds: string[],
): Promise<void> {
  if (timeSlotIds.length === 0) return;

  await tx.$queryRaw(
    Prisma.sql`SELECT id FROM "TimeSlot" WHERE id IN (${Prisma.join(timeSlotIds)}) FOR UPDATE`,
  );
}

export async function claimTimeSlots(
  tx: Prisma.TransactionClient,
  timeSlotIds: string[],
): Promise<number> {
  const result = await tx.timeSlot.updateMany({
    where: { id: { in: timeSlotIds }, isBooked: false, isActive: true },
    data: { isBooked: true },
  });
  return result.count;
}

export async function releaseTimeSlots(
  tx: Prisma.TransactionClient,
  timeSlotIds: string[],
): Promise<void> {
  await tx.timeSlot.updateMany({
    where: { id: { in: timeSlotIds }, appointmentId: null },
    data: { isBooked: false },
  });
}

export async function attachAppointmentToSlots(
  tx: Prisma.TransactionClient,
  timeSlotIds: string[],
  appointmentId: string,
): Promise<void> {
  await tx.timeSlot.updateMany({
    where: { id: { in: timeSlotIds } },
    data: { appointmentId },
  });
}

export async function findIdempotentAppointment(
  tx: Prisma.TransactionClient,
  key: string,
) {
  return tx.bookingIdempotency.findUnique({
    where: { key },
    include: { appointment: { include: appointmentInclude } },
  });
}

export async function loadAppointmentById(
  tx: Prisma.TransactionClient,
  appointmentId: string,
) {
  return tx.appointment.findUnique({
    where: { id: appointmentId },
    include: appointmentInclude,
  });
}

export async function findActiveAppointmentAtStart(
  tx: Prisma.TransactionClient,
  providerId: string,
  startAt: Date,
  excludeId?: string,
) {
  return tx.appointment.findFirst({
    where: {
      providerId,
      startAt,
      status: { not: AppointmentStatus.CANCELLED },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function createAppointmentRecord(
  tx: Prisma.TransactionClient,
  data: CreateAppointmentData,
) {
  return tx.appointment.create({
    data: {
      ...data,
      status: AppointmentStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    },
    include: appointmentInclude,
  });
}

export async function recordBookingIdempotency(
  tx: Prisma.TransactionClient,
  key: string,
  userId: string | undefined,
  appointmentId: string,
): Promise<void> {
  await tx.bookingIdempotency.create({
    data: { key, userId, appointmentId },
  });
}

export async function resolveDuplicateBooking(
  tx: Prisma.TransactionClient,
  key: string,
  timeSlotIds: string[],
): Promise<BookingTransactionResult | null> {
  const replay = await findIdempotentAppointment(tx, key);
  if (replay?.appointment) {
    return { appointment: replay.appointment, isReplay: true };
  }

  await releaseTimeSlots(tx, timeSlotIds);
  return null;
}

export function duplicateBookingError(): ApiError {
  return ApiError.conflict("Time slot already booked");
}

export async function handleBookingUniqueViolation(
  error: unknown,
  tx: Prisma.TransactionClient,
  key: string,
  timeSlotIds: string[],
): Promise<BookingTransactionResult> {
  if (!isUniqueConstraintError(error)) throw error;

  const resolved = await resolveDuplicateBooking(tx, key, timeSlotIds);
  if (resolved) return resolved;

  throw duplicateBookingError();
}
