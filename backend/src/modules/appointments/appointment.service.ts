import {
  AppointmentStatus,
  PaymentStatus,
  Role,
} from "@prisma/client";
import { prisma } from "../../config/database.js";
import { getPaymentProvider } from "../../integrations/payment/index.js";
import { getSmsProvider } from "../../integrations/sms/index.js";
import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import type { AccessTokenPayload } from "../../shared/utils/jwt.js";
import { appointmentRepository } from "./appointment.repository.js";
import { buildAppointmentRequestKey } from "./bookingGuard.js";
import {
  appointmentFitsWorkingHoursAt,
} from "./appointmentDuration.helpers.js";
import { getActiveHoursForDay } from "../provider/workingHours.helpers.js";
import { getLocalDayOfWeek } from "../../shared/utils/datetime.js";
import {
  assertNoDuplicateBooking,
  createAppointmentRecord,
  duplicateBookingError,
  findIdempotentAppointment,
  handleBookingUniqueViolation,
  recordBookingIdempotency,
  releaseAppointmentTimeSlots,
  type BookingTransactionResult,
} from "./bookingTransaction.js";
import type { bookAppointmentSchema, cancelAppointmentSchema } from "./appointment.schema.js";
import type { z } from "zod";

type BookInput = z.infer<typeof bookAppointmentSchema>;
type CancelInput = z.infer<typeof cancelAppointmentSchema>;

export class AppointmentService {
  private repo = appointmentRepository;

  async book(input: BookInput, user?: AccessTokenPayload): Promise<BookingTransactionResult> {
    if (!user && (!input.guestFullName || !input.guestPhone)) {
      throw ApiError.badRequest("Guest bookings require guestFullName and guestPhone");
    }

    const provider = await this.repo.findProvider(input.providerId);
    if (!provider) throw ApiError.notFound("Provider not available for booking");

    const providerService = await this.repo.findProviderService(
      input.providerServiceId,
      input.providerId,
    );
    if (!providerService) throw ApiError.notFound("Provider service not found");

    const startAt = new Date(input.startAt);
    const endAt = new Date(startAt.getTime() + providerService.duration * 60_000);

    if (startAt <= new Date()) {
      throw ApiError.badRequest("Cannot book appointments in the past");
    }

    const dayOfWeek = getLocalDayOfWeek(startAt);
    const dayHours = getActiveHoursForDay(providerService.workingHours, dayOfWeek);
    if (!appointmentFitsWorkingHoursAt(dayHours, startAt, providerService.duration)) {
      throw ApiError.badRequest("Appointment extends beyond provider working hours");
    }

    const requestKey = buildAppointmentRequestKey(user?.sub, {
      providerId: input.providerId,
      providerServiceId: input.providerServiceId,
      startAt,
      guestPhone: input.guestPhone,
    });

    const result = await prisma.$transaction(async (tx) => {
      const replay = await findIdempotentAppointment(tx, requestKey);
      if (replay?.appointment) {
        return { appointment: replay.appointment, isReplay: true };
      }

      await assertNoDuplicateBooking(tx, input.providerId, startAt, endAt);

      try {
        const created = await createAppointmentRecord(tx, {
          providerId: input.providerId,
          providerServiceId: input.providerServiceId,
          userId: user?.sub,
          guestFullName: user ? undefined : input.guestFullName,
          guestPhone: user ? undefined : input.guestPhone,
          guestEmail: user ? undefined : input.guestEmail,
          startAt,
          endAt,
          notes: input.notes,
        });

        await recordBookingIdempotency(tx, requestKey, user?.sub, created.id);
        return { appointment: created, isReplay: false };
      } catch (error) {
        const resolved = await handleBookingUniqueViolation(error, tx, requestKey, []);
        return resolved;
      }
    });

    const appointment = result.appointment;
    if (!appointment) throw duplicateBookingError();

    const phone =
      user?.sub && appointment.user?.phone
        ? appointment.user.phone
        : input.guestPhone ?? appointment.guestPhone;

    if (!result.isReplay && phone) {
      const sms = getSmsProvider();
      await sms.send({
        phone,
        message: `Your appointment for ${appointment.providerService.service.name} is pending confirmation.`,
        appointmentId: appointment.id,
        userId: user?.sub,
      });
    }

    console.log(
      `[Booking] book userId=${user?.sub ?? "guest"} providerId=${input.providerId} startAt=${startAt.toISOString()} result=${result.isReplay ? "replay" : "created"}`,
    );

    return result;
  }

  async getMyAppointments(
    userId: string,
    query: { status?: string; page?: string; limit?: string },
  ) {
    const { page, limit, skip } = parsePagination(query);
    const status = query.status as AppointmentStatus | undefined;
    const [items, total] = await this.repo.findByUser(userId, { status, skip, take: limit });
    return { items, meta: paginationMeta(page, limit, total) };
  }

  async getById(id: string, user?: AccessTokenPayload) {
    const appointment = await this.repo.findById(id);
    if (!appointment) throw ApiError.notFound("Appointment not found");

    if (!user) throw ApiError.unauthorized();

    let providerProfileId: string | null = null;
    if (user.role === Role.PROVIDER) {
      const profile = await this.repo.findProviderProfileIdByUserId(user.sub);
      providerProfileId = profile?.id ?? null;
    }

    const allowed = this.repo.canAccessAppointment(
      appointment,
      user.sub,
      user.role,
      providerProfileId,
    );
    if (!allowed) throw ApiError.forbidden();

    return appointment;
  }

  async cancel(id: string, input: CancelInput, user: AccessTokenPayload) {
    const appointment = await this.repo.findById(id);
    if (!appointment) throw ApiError.notFound("Appointment not found");

    let providerProfileId: string | null = null;
    if (user.role === Role.PROVIDER) {
      const profile = await this.repo.findProviderProfileIdByUserId(user.sub);
      providerProfileId = profile?.id ?? null;
    }

    const allowed =
      user.role === Role.ADMIN ||
      appointment.userId === user.sub ||
      (user.role === Role.PROVIDER && providerProfileId === appointment.providerId);

    if (!allowed) throw ApiError.forbidden();

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw ApiError.badRequest("Appointment is already cancelled");
    }
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw ApiError.badRequest("Completed appointments cannot be cancelled");
    }

    if (appointment.startAt <= new Date()) {
      throw ApiError.badRequest("Cannot cancel past appointments");
    }

    if (user.role === Role.USER) {
      const policy = await this.repo.findCancellationPolicy(appointment.providerId);
      const minHoursBefore = policy?.minHoursBefore ?? 24;
      const deadline = new Date(appointment.startAt.getTime() - minHoursBefore * 60 * 60 * 1000);

      if (new Date() > deadline) {
        throw ApiError.forbidden(
          `Cancellation must be at least ${minHoursBefore} hours before the appointment`,
        );
      }
    }

    let cancelled = await prisma.$transaction(async (tx) => {
      const updated = await this.repo.cancel(id, input.reason, tx);
      await releaseAppointmentTimeSlots(tx, id);
      return updated;
    });

    if (cancelled.paymentStatus === PaymentStatus.PAID) {
      const latestTx = await prisma.paymentTransaction.findFirst({
        where: { appointmentId: id, status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
      });
      if (latestTx) {
        const payment = getPaymentProvider();
        await payment.refund({
          transactionId: latestTx.id,
          amount: Number(latestTx.amount),
        });
        cancelled = await this.repo.updatePaymentStatus(id, PaymentStatus.REFUNDED);
      }
    }

    const notifyPhone = cancelled.user?.phone ?? appointment.guestPhone;
    if (notifyPhone) {
      const sms = getSmsProvider();
      await sms.send({
        phone: notifyPhone,
        message: `Your appointment for ${cancelled.providerService.service.name} has been cancelled.`,
        appointmentId: id,
        userId: cancelled.user?.id,
      });
    }

    console.log(
      `[Appointment] cancel id=${id} by=${user.role} userId=${user.sub} status=CANCELLED`,
    );

    return cancelled;
  }

  async pay(id: string, user: AccessTokenPayload) {
    const appointment = await this.repo.findById(id);
    if (!appointment) throw ApiError.notFound("Appointment not found");
    if (appointment.userId !== user.sub) throw ApiError.forbidden();
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw ApiError.badRequest("Cannot pay for a cancelled appointment");
    }
    if (appointment.paymentStatus === PaymentStatus.PAID) {
      throw ApiError.badRequest("Appointment is already paid");
    }

    const amount = Number(appointment.providerService.price);
    const payment = getPaymentProvider();
    const result = await payment.charge({
      appointmentId: id,
      amount,
    });

    if (!result.success) {
      await this.repo.updatePaymentStatus(id, PaymentStatus.FAILED);
      throw ApiError.badRequest(result.errorMessage ?? "Payment failed");
    }

    return this.repo.updatePaymentStatus(id, PaymentStatus.PAID);
  }
}

export const appointmentService = new AppointmentService();
