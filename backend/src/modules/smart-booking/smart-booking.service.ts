import { prisma } from "../../config/database.js";
import { getSmsProvider } from "../../integrations/sms/index.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { formatLocalDate, getLocalDayOfWeek, localToUtc } from "../../shared/utils/datetime.js";
import { appointmentRepository } from "../appointments/appointment.repository.js";
import { buildSmartBookingRequestKey } from "../appointments/bookingGuard.js";
import {
  attachAppointmentToSlots,
  claimTimeSlots,
  createAppointmentRecord,
  duplicateBookingError,
  findActiveAppointmentAtStart,
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
        "Please set your availability first. Use PUT /api/v1/user/availability to configure your available times.",
      );
    }

    const providerServices = await this.repo.findProviderServices({
      serviceId: input.serviceId,
      providerId: input.providerId,
      providerServiceId: input.providerServiceId,
    });

    if (providerServices.length === 0) {
      throw ApiError.notFound("No providers found offering this service");
    }

    const providerIds = [...new Set(providerServices.map((ps) => ps.providerId))];
    const horizonDays = input.horizonDays ?? 14;

    await timeSlotSyncService.syncForProviders(providerIds, horizonDays);

    const today = formatLocalDate(new Date());
    const endDate = addDays(today, horizonDays - 1);

    const allSlots = await this.repo.findAvailableTimeSlots(providerIds, today, endDate);

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

    const suggestions = scoreAndRankCandidates(
      candidates,
      user.latitude,
      user.longitude,
      input.preference ?? "time",
      3,
    );

    if (suggestions.length === 0) {
      return {
        suggestions: [],
        message: `No available slots in the next ${horizonDays} days`,
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
      const providerSlots = slots.filter((s) => s.providerId === ps.providerId);
      const blocks = findConsecutiveSlots(providerSlots, ps.duration);

      for (const block of blocks) {
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

    const result = await prisma.$transaction(async (tx) => {
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
        throw ApiError.badRequest("All time slots must belong to the specified provider");
      }

      const providerService = await appointmentRepository.findProviderService(
        input.providerServiceId,
        input.providerId,
      );
      if (!providerService) throw ApiError.notFound("Provider service not found");

      const slotsNeeded = providerService.duration / 30;
      if (slots.length !== slotsNeeded) {
        throw ApiError.badRequest(
          `Expected ${slotsNeeded} consecutive slots for this service duration`,
        );
      }

      const matchingBlock = findConsecutiveSlots(slots, providerService.duration).find(
        (b) =>
          b.slotIds.length === input.timeSlotIds.length &&
          b.slotIds.every((id, i) => id === slots[i].id),
      );

      if (!matchingBlock) {
        throw ApiError.badRequest("Time slots must be consecutive");
      }

      if (
        user.availabilities.length > 0 &&
        !blockFitsUserAvailability(matchingBlock, user.availabilities, getDayOfWeek)
      ) {
        throw ApiError.badRequest("Selected time is outside your availability");
      }

      const startAt = localToUtc(slots[0].date, slots[0].startTime);
      const endAt = localToUtc(slots[slots.length - 1].date, slots[slots.length - 1].endTime);

      if (startAt <= new Date()) {
        throw ApiError.badRequest("Cannot book appointments in the past");
      }

      const existingAtStart = await findActiveAppointmentAtStart(
        tx,
        input.providerId,
        startAt,
      );
      if (existingAtStart) {
        throw duplicateBookingError();
      }

      const overlap = await appointmentRepository.findOverlapping(
        input.providerId,
        startAt,
        endAt,
        undefined,
        tx,
      );
      if (overlap) {
        throw duplicateBookingError();
      }

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
    });

    const appointment = result.appointment;
    if (!appointment) throw duplicateBookingError();

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
