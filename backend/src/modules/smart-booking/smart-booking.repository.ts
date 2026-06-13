import { prisma } from "../../config/database.js";

export class SmartBookingRepository {
  findUserWithAvailability(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        availabilities: true,
      },
    });
  }

  findProviderServices(input: {
    serviceId: string;
    providerId?: string;
    providerServiceId?: string;
  }) {
    if (input.providerServiceId) {
      return prisma.providerService.findMany({
        where: {
          id: input.providerServiceId,
          serviceId: input.serviceId,
          isActive: true,
          service: { isActive: true },
          provider: {
            isAcceptingBookings: true,
            user: { isActive: true },
            ...(input.providerId ? { id: input.providerId } : {}),
          },
        },
        include: {
          provider: { select: { id: true, latitude: true, longitude: true } },
        },
      });
    }

    return prisma.providerService.findMany({
      where: {
        serviceId: input.serviceId,
        isActive: true,
        service: { isActive: true },
        provider: {
          isAcceptingBookings: true,
          user: { isActive: true },
          ...(input.providerId ? { id: input.providerId } : {}),
        },
      },
      include: {
        provider: { select: { id: true, latitude: true, longitude: true } },
      },
    });
  }

  findAvailableTimeSlots(providerIds: string[], startDate: string, endDate: string) {
    return prisma.timeSlot.findMany({
      where: {
        providerId: { in: providerIds },
        date: { gte: startDate, lte: endDate },
        isBooked: false,
        isActive: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  findTimeSlotsByIds(ids: string[]) {
    return prisma.timeSlot.findMany({
      where: { id: { in: ids } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }
}

export const smartBookingRepository = new SmartBookingRepository();
