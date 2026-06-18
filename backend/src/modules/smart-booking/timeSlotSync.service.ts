import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import {
  formatLocalDate,
  getLocalDayOfWeek,
  localToUtc,
  timeToMinutes,
} from "../../shared/utils/datetime.js";
import { buildExpectedStartTimes } from "./helpers/expectedSlots.js";
import { partitionSlotsForReconcile } from "./helpers/slotReconcile.js";
import { getActiveHoursForDay } from "../provider/workingHours.helpers.js";
import { SLOT_STEP_MINUTES } from "./helpers/findConsecutiveSlots.js";

const DEFAULT_HORIZON_DAYS = 14;

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

function dateRange(startDate: string, horizonDays: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < horizonDays; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

type WorkingHourRange = {
  startTime: string;
  endTime: string;
};

export class TimeSlotSyncService {
  async syncForProviders(providerIds: string[], horizonDays = DEFAULT_HORIZON_DAYS): Promise<void> {
    if (providerIds.length === 0) return;

    const services = await prisma.providerService.findMany({
      where: { providerId: { in: providerIds }, isActive: true },
      select: { id: true, providerId: true },
    });

    for (const service of services) {
      await this.syncProviderService(service.id, service.providerId, horizonDays);
    }
  }

  async syncProvider(providerId: string, horizonDays = DEFAULT_HORIZON_DAYS): Promise<void> {
    const services = await prisma.providerService.findMany({
      where: { providerId, isActive: true },
      select: { id: true },
    });

    for (const service of services) {
      await this.syncProviderService(service.id, providerId, horizonDays);
    }
  }

  async syncProviderService(
    providerServiceId: string,
    providerId: string,
    horizonDays = DEFAULT_HORIZON_DAYS,
  ): Promise<void> {
    const today = formatLocalDate(new Date());
    const dates = dateRange(today, horizonDays);

    const providerService = await prisma.providerService.findFirst({
      where: { id: providerServiceId, providerId },
      include: {
        workingHours: true,
        provider: { select: { isAcceptingBookings: true } },
      },
    });

    if (!providerService || !providerService.provider.isAcceptingBookings) {
      await this.clearSlotsInRange(providerServiceId, today, dates[dates.length - 1]);
      return;
    }

    for (const date of dates) {
      const dayOfWeek = getLocalDayOfWeek(localToUtc(date, "12:00"));
      const dayHours = getActiveHoursForDay(providerService.workingHours, dayOfWeek);
      await this.reconcileDaySlots(providerId, providerServiceId, date, dayHours);
    }

    await this.syncBookedFromAppointments(
      providerId,
      providerServiceId,
      today,
      dates[dates.length - 1],
    );
  }

  private async reconcileDaySlots(
    providerId: string,
    providerServiceId: string,
    date: string,
    dayHours: WorkingHourRange[],
  ): Promise<void> {
    const expectedStartTimes = buildExpectedStartTimes(dayHours);

    for (const startTime of expectedStartTimes) {
      const endTime = minutesToTime(timeToMinutes(startTime) + SLOT_STEP_MINUTES);
      await prisma.timeSlot.upsert({
        where: {
          providerServiceId_date_startTime: { providerServiceId, date, startTime },
        },
        create: {
          providerId,
          providerServiceId,
          date,
          startTime,
          endTime,
          isBooked: false,
          isActive: true,
        },
        update: {
          endTime,
          isActive: true,
        },
      });
    }

    const existing = await prisma.timeSlot.findMany({
      where: { providerServiceId, date },
      select: { id: true, startTime: true, isBooked: true, appointmentId: true },
    });

    const { toDelete, toDeactivate } = partitionSlotsForReconcile(existing, expectedStartTimes);

    if (toDelete.length > 0) {
      await prisma.timeSlot.deleteMany({ where: { id: { in: toDelete } } });
    }

    if (toDeactivate.length > 0) {
      await prisma.timeSlot.updateMany({
        where: { id: { in: toDeactivate } },
        data: { isActive: false },
      });
    }
  }

  private async clearSlotsInRange(
    providerServiceId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    await prisma.timeSlot.updateMany({
      where: {
        providerServiceId,
        date: { gte: startDate, lte: endDate },
        OR: [{ isBooked: true }, { appointmentId: { not: null } }],
      },
      data: { isActive: false },
    });

    await prisma.timeSlot.deleteMany({
      where: {
        providerServiceId,
        date: { gte: startDate, lte: endDate },
        isBooked: false,
        appointmentId: null,
      },
    });
  }

  private async syncBookedFromAppointments(
    providerId: string,
    providerServiceId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const rangeStart = localToUtc(startDate, "00:00");
    const rangeEnd = localToUtc(endDate, "23:59");

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId,
        providerServiceId,
        status: { not: AppointmentStatus.CANCELLED },
        startAt: { lt: rangeEnd },
        endAt: { gt: rangeStart },
      },
      select: { id: true, startAt: true, endAt: true },
    });

    const slots = await prisma.timeSlot.findMany({
      where: {
        providerServiceId,
        date: { gte: startDate, lte: endDate },
      },
    });

    for (const slot of slots) {
      const slotStart = localToUtc(slot.date, slot.startTime);
      const slotEnd = localToUtc(slot.date, slot.endTime);

      const overlapping = appointments.find(
        (appt) => appt.startAt < slotEnd && appt.endAt > slotStart,
      );

      if (overlapping) {
        await prisma.timeSlot.update({
          where: { id: slot.id },
          data: {
            isBooked: true,
            appointmentId: overlapping.id,
            isActive: true,
          },
        });
      } else if (slot.isBooked && !slot.appointmentId) {
        await prisma.timeSlot.update({
          where: { id: slot.id },
          data: { isBooked: false },
        });
      }
    }
  }
}

export const timeSlotSyncService = new TimeSlotSyncService();
