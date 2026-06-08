import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import {
  formatLocalDate,
  getLocalDayOfWeek,
  localToUtc,
  timeToMinutes,
} from "../../shared/utils/datetime.js";
import { ApiError } from "../../shared/utils/apiError.js";

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export class SlotService {
  async getAvailableSlots(input: {
    providerId: string;
    providerServiceId: string;
    date: string;
  }) {
    const provider = await prisma.providerProfile.findFirst({
      where: {
        id: input.providerId,
        isAcceptingBookings: true,
        user: { isActive: true },
      },
      include: { workingHours: true },
    });

    if (!provider) throw ApiError.notFound("Provider not found");

    const providerService = await prisma.providerService.findFirst({
      where: {
        id: input.providerServiceId,
        providerId: input.providerId,
        isActive: true,
        service: { isActive: true },
      },
    });

    if (!providerService) throw ApiError.notFound("Provider service not found");

    const referenceDate = localToUtc(input.date, "12:00");
    const dayOfWeek = getLocalDayOfWeek(referenceDate);
    const dayHours = provider.workingHours.filter((h) => h.dayOfWeek === dayOfWeek);

    if (dayHours.length === 0) return [];

    const slotStep = Math.max(provider.slotDurationMinutes, providerService.duration);
    const serviceDuration = providerService.duration;
    const now = new Date();
    const todayLocal = formatLocalDate(now);

    const candidateSlots: { startAt: Date; endAt: Date }[] = [];

    for (const range of dayHours) {
      let cursor = timeToMinutes(range.startTime);
      const rangeEnd = timeToMinutes(range.endTime);

      while (cursor + serviceDuration <= rangeEnd) {
        const startAt = localToUtc(input.date, minutesToTime(cursor));
        const endAt = localToUtc(input.date, minutesToTime(cursor + serviceDuration));

        if (input.date === todayLocal && startAt <= now) {
          cursor += slotStep;
          continue;
        }

        candidateSlots.push({ startAt, endAt });
        cursor += slotStep;
      }
    }

    if (candidateSlots.length === 0) return [];

    const dayStart = localToUtc(input.date, "00:00");
    const dayEnd = localToUtc(input.date, "23:59");

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId: input.providerId,
        status: { not: AppointmentStatus.CANCELLED },
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
      },
      select: { startAt: true, endAt: true },
    });

    return candidateSlots.filter((slot) =>
      !appointments.some(
        (appt) => appt.startAt < slot.endAt && appt.endAt > slot.startAt,
      ),
    );
  }
}

export const slotService = new SlotService();
