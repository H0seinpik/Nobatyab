import { prisma } from "../../config/database.js";

export class UserAvailabilityRepository {
  findByUserId(userId: string) {
    return prisma.userAvailability.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  replaceAll(userId: string, entries: { dayOfWeek: number; startTime: string; endTime: string }[]) {
    return prisma.$transaction(async (tx) => {
      await tx.userAvailability.deleteMany({ where: { userId } });
      if (entries.length === 0) return [];

      await tx.userAvailability.createMany({
        data: entries.map((e) => ({ ...e, userId })),
      });

      return tx.userAvailability.findMany({
        where: { userId },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });
    });
  }

  findByIdForUser(userId: string, id: string) {
    return prisma.userAvailability.findFirst({
      where: { id, userId },
    });
  }

  deleteById(userId: string, id: string) {
    return prisma.userAvailability.deleteMany({
      where: { id, userId },
    });
  }
}

export const userAvailabilityRepository = new UserAvailabilityRepository();
