import { prisma, prismaTransactionOptions } from "../../config/database.js";
import { getSmsProvider } from "../../integrations/sms/index.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { formatLocalDate, getLocalDayOfWeek, localToUtc } from "../../shared/utils/datetime.js";
import { appointmentRepository } from "../appointments/appointment.repository.js";
import { appointmentFitsWorkingHours } from "../appointments/appointmentDuration.helpers.js";
import { getActiveHoursForDay } from "../provider/workingHours.helpers.js";
import { buildSmartBookingRequestKey } from "../appointments/bookingGuard.js";
import {
  attachAppointmentToSlots,
  assertNoDuplicateBooking,
  claimTimeSlots,
  createAppointmentRecord,
  duplicateBookingError,
  findIdempotentAppointment,
  handleBookingUniqueViolation,
  lockTimeSlots,
  recordBookingIdempotency,
  type BookingTransactionResult,
} from "../appointments/bookingTransaction.js";
import {
  blockFitsUserAvailability,
  filterSlotsByUserAvailability,
  type AvailabilityWindow,
} from "./helpers/availabilityFilter.js";
import { findConsecutiveSlots, type SlotRecord } from "./helpers/findConsecutiveSlots.js";
import { scoreAndRankCandidates } from "./helpers/scoring.js";
import { smartBookingRepository } from "./smart-booking.repository.js";
import type { confirmBookingSchema, suggestBookingSchema } from "./smart-booking.schema.js";
import { timeSlotSyncService } from "./timeSlotSync.service.js";
import type { z } from "zod";

type SuggestInput = z.infer<typeof suggestBookingSchema>;
type ConfirmInput = z.infer<typeof confirmBookingSchema>;

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return formatLocalDate(dt);
}

export class SmartBookingService {
  private repo = smartBookingRepository;

  async suggest(userId: string, input: SuggestInput) {
    const user = await this.repo.findUserWithAvailability(userId);
    if (!user) throw ApiError.unauthorized();

    if (user.availabilities.length === 0) {
      throw ApiError.badRequest(
        "لطفاً ابتدا زمان‌های آزاد خود را تنظیم کنید.",
      );
    }

    const providerServices = await this.repo.findProviderServices({
      serviceId: input.serviceId,
      providerId: input.providerId,
      providerServiceId: input.providerServiceId,
    });

    if (providerServices.length === 0) {
      throw ApiError.notFound("ارائه‌دهنده‌ای برای این خدمت یافت نشد");
    }

    const providerServiceIds = providerServices.map((ps) => ps.id);
    const providerIds = [...new Set(providerServices.map((ps) => ps.providerId))];
    const horizonDays = input.horizonDays ?? 14;

    await timeSlotSyncService.syncForProviders(providerIds, horizonDays);

    const today = formatLocalDate(new Date());
    const endDate = addDays(today, horizonDays - 1);

    const allSlots = await this.repo.findAvailableTimeSlots(providerServiceIds, today, endDate);

    const getDayOfWeek = (dateStr: string) =>
      getLocalDayOfWeek(localToUtc(dateStr, "12:00"));

    const filteredSlots = filterSlotsByUserAvailability(
      allSlots,
      user.availabilities,
      getDayOfWeek,
    );

    const candidates = this.buildCandidates(
      providerServices,
      filteredSlots,
      user.availabilities,
      getDayOfWeek,
      false,
    );

    const now = new Date();
    const futureCandidates = candidates.filter(
      (c) => localToUtc(c.date, c.startTime) > now,
    );

    const suggestions = scoreAndRankCandidates(
      futureCandidates,
      user.latitude,
      user.longitude,
      input.preference ?? "time",
      3,
    );

    if (suggestions.length === 0) {
      return {
        suggestions: [],
        message: `در ${horizonDays} روز آینده زمان خالی یافت نشد`,
      };
    }

    return { suggestions };
  }

  private buildCandidates(
    providerServices: Awaited<ReturnType<typeof this.repo.findProviderServices>>,
    slots: SlotRecord[],
    availabilities: AvailabilityWindow[],
    getDayOfWeek: (dateStr: string) => number,
    isFallback: boolean,
  ) {
    const candidates: Parameters<typeof scoreAndRankCandidates>[0] = [];

    for (const ps of providerServices) {
      const providerSlots = slots.filter((s) => s.providerServiceId === ps.id);
      const blocks = findConsecutiveSlots(providerSlots, ps.duration);

      for (const block of blocks) {
        const dayHours = getActiveHoursForDay(
          ps.workingHours,
          getDayOfWeek(block.date),
        );
        if (!appointmentFitsWorkingHours(dayHours, block.startTime, ps.duration)) {
          continue;
        }

        if (!blockFitsUserAvailability(block, availabilities, getDayOfWeek)) {
          continue;
        }

        candidates.push({
          providerId: block.providerId,
          providerServiceId: ps.id,
          date: block.date,
          startTime: block.startTime,
          endTime: block.endTime,
          slotIds: block.slotIds,
          providerLat: ps.provider.latitude,
          providerLng: ps.provider.longitude,
          isFallback,
        });
      }
    }

    return candidates;
  }

  async confirm(userId: string, input: ConfirmInput): Promise<BookingTransactionResult> {
    const user = await this.repo.findUserWithAvailability(userId);
    if (!user) throw ApiError.unauthorized();

    const getDayOfWeek = (dateStr: string) =>
      getLocalDayOfWeek(localToUtc(dateStr, "12:00"));

    const requestKey = buildSmartBookingRequestKey(userId, input);

    const result = await prisma.$transaction(
      async (tx) => {
      const replay = await findIdempotentAppointment(tx, requestKey);
      if (replay?.appointment) {
        return { appointment: replay.appointment, isReplay: true };
      }

      await lockTimeSlots(tx, input.timeSlotIds);

      const slots = await tx.timeSlot.findMany({
        where: { id: { in: input.timeSlotIds } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      if (slots.length !== input.timeSlotIds.length) {
        throw duplicateBookingError();
      }

      if (slots.some((s) => s.isBooked || !s.isActive)) {
        throw duplicateBookingError();
      }

      const providerIds = new Set(slots.map((s) => s.providerId));
      if (providerIds.size !== 1 || !providerIds.has(input.providerId)) {
        throw ApiError.badRequest("همه بازه‌های زمانی باید متعلق به ارائه‌دهنده مشخص‌شده باشند");
      }

      const providerService = await appointmentRepository.findProviderService(
        input.providerServiceId,
        input.providerId,
      );
      if (!providerService) throw ApiError.notFound("خدمت ارائه‌دهنده یافت نشد");

      const slotsNeeded = providerService.duration / 30;
      if (slots.length !== slotsNeeded) {
        throw ApiError.badRequest(
          `برای مدت زمان این خدمت به ${slotsNeeded} بازه زمانی متوالی نیاز است`,
        );
      }

      if (slots.some((s) => s.providerServiceId !== input.providerServiceId)) {
        throw ApiError.badRequest("همه بازه‌های زمانی باید متعلق به خدمت مشخص‌شده باشند");
      }

      const matchingBlock = findConsecutiveSlots(slots, providerService.duration).find(
        (b) =>
          b.slotIds.length === input.timeSlotIds.length &&
          b.slotIds.every((id, i) => id === slots[i].id),
      );

      if (!matchingBlock) {
        throw ApiError.badRequest("بازه‌های زمانی باید پشت سر هم باشند");
      }

      if (
        user.availabilities.length > 0 &&
        !blockFitsUserAvailability(matchingBlock, user.availabilities, getDayOfWeek)
      ) {
        throw ApiError.badRequest("زمان انتخاب‌شده خارج از دسترس‌پذیری شماست");
      }

      const dayHours = getActiveHoursForDay(
        providerService.workingHours,
        getDayOfWeek(matchingBlock.date),
      );
      if (
        !appointmentFitsWorkingHours(
          dayHours,
          matchingBlock.startTime,
          providerService.duration,
        )
      ) {
        throw ApiError.badRequest("زمان نوبت خارج از ساعات کاری ارائه‌دهنده است");
      }

      const startAt = localToUtc(slots[0].date, slots[0].startTime);
      const endAt = localToUtc(slots[slots.length - 1].date, slots[slots.length - 1].endTime);

      if (startAt <= new Date()) {
        throw ApiError.badRequest("امکان رزرو زمان گذشته وجود ندارد");
      }

      await assertNoDuplicateBooking(tx, input.providerId, startAt, endAt);

      const claimed = await claimTimeSlots(tx, input.timeSlotIds);
      if (claimed !== input.timeSlotIds.length) {
        throw duplicateBookingError();
      }

      try {
        const created = await createAppointmentRecord(tx, {
          providerId: input.providerId,
          providerServiceId: input.providerServiceId,
          userId,
          startAt,
          endAt,
          notes: input.notes,
        });

        await attachAppointmentToSlots(tx, input.timeSlotIds, created.id);
        await recordBookingIdempotency(tx, requestKey, userId, created.id);

        return { appointment: created, isReplay: false };
      } catch (error) {
        return handleBookingUniqueViolation(error, tx, requestKey, input.timeSlotIds);
      }
    },
    prismaTransactionOptions,
    );

    const appointment = result.appointment;
    if (!appointment) throw duplicateBookingError();

    console.log(
      `[Booking] confirm userId=${userId} slots=${input.timeSlotIds.join(",")} result=${result.isReplay ? "replay" : "created"}`,
    );

    if (!result.isReplay && appointment.user?.phone) {
      const sms = getSmsProvider();
      await sms.send({
        phone: appointment.user.phone,
        message: `Your appointment for ${appointment.providerService.service.name} is pending confirmation.`,
        appointmentId: appointment.id,
        userId,
      });
    }

    return result;
  }
}

export const smartBookingService = new SmartBookingService();
