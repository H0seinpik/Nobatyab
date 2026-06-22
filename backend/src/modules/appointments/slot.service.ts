import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { getActiveHoursForDay } from "../provider/workingHours.helpers.js";
import {
  formatLocalDate,
  getLocalDayOfWeek,
  localToUtc,
  timeToMinutes,
} from "../../shared/utils/datetime.js";
import { ApiError } from "../../shared/utils/apiError.js";

export type SlotStatus = "available" | "booked" | "past" | "inactive";

export interface EnrichedSlot {
  startAt: string;
  endAt: string;
  status: SlotStatus;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return formatLocalDate(dt);
}

export class SlotService {
  async getAvailableSlots(input: {
    providerId: string;
    providerServiceId: string;
    date: string;
  }) {
    return this.computeAvailableSlots(input);
  }

  async getAvailableDays(input: {
    providerId: string;
    providerServiceId: string;
    from?: string;
    horizonDays?: number;
  }) {
    const horizonDays = Math.min(60, Math.max(1, input.horizonDays ?? 30));
    const todayLocal = formatLocalDate(new Date());
    const requestedFrom = input.from ?? todayLocal;
    const startDate = requestedFrom < todayLocal ? todayLocal : requestedFrom;
    const dates: string[] = [];

    for (let i = 0; i < horizonDays; i++) {
      const date = addDays(startDate, i);
      const slots = await this.computeAvailableSlots({
        providerId: input.providerId,
        providerServiceId: input.providerServiceId,
        date,
      });
      if (slots.some((s) => s.status === "available")) {
        dates.push(date);
      }
    }

    return dates;
  }

  private async computeAvailableSlots(input: {
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
    });

    if (!provider) throw ApiError.notFound("ارائه‌دهنده یافت نشد");

    const providerService = await prisma.providerService.findFirst({
      where: {
        id: input.providerServiceId,
        providerId: input.providerId,
        isActive: true,
        service: { isActive: true },
      },
      include: { workingHours: true },
    });

    if (!providerService) throw ApiError.notFound("خدمت ارائه‌دهنده یافت نشد");

    const todayLocal = formatLocalDate(new Date());
    if (input.date < todayLocal) return [];

    const referenceDate = localToUtc(input.date, "12:00");
    const dayOfWeek = getLocalDayOfWeek(referenceDate);
    const dayHours = getActiveHoursForDay(providerService.workingHours, dayOfWeek);

    if (dayHours.length === 0) return [];

    const slotStep = Math.max(provider.slotDurationMinutes, providerService.duration);
    const serviceDuration = providerService.duration;
    const now = new Date();

    const candidateSlots: { startAt: Date; endAt: Date; status: SlotStatus }[] = [];

    for (const range of dayHours) {
      let cursor = timeToMinutes(range.startTime);
      const rangeEnd = timeToMinutes(range.endTime);

      while (cursor + serviceDuration <= rangeEnd) {
        const startAt = localToUtc(input.date, minutesToTime(cursor));
        const endAt = localToUtc(input.date, minutesToTime(cursor + serviceDuration));

        if (input.date === todayLocal && startAt <= now) {
          candidateSlots.push({ startAt, endAt, status: "past" });
        } else {
          candidateSlots.push({ startAt, endAt, status: "available" });
        }

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

    return candidateSlots
      .map((slot) => {
        const isBooked = appointments.some(
          (appt) => appt.startAt < slot.endAt && appt.endAt > slot.startAt,
        );
        const status: SlotStatus =
          isBooked && slot.status === "available" ? "booked" : slot.status;

        return {
          startAt: slot.startAt.toISOString(),
          endAt: slot.endAt.toISOString(),
          status,
        };
      })
      .filter((slot) => slot.status !== "past");
  }
}

export const slotService = new SlotService();
