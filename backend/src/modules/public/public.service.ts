import { Role } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class PublicService {
  async getStats() {
    const [categories, services, providers, appointments, reviews, smartBookingUsers] =
      await Promise.all([
        prisma.category.count({ where: { isActive: true } }),
        prisma.service.count({ where: { isActive: true } }),
        prisma.user.count({ where: { role: Role.PROVIDER, isActive: true } }),
        prisma.appointment.count(),
        prisma.review.count(),
        prisma.userAvailability.groupBy({
          by: ["userId"],
        }),
      ]);

    return {
      categories,
      services,
      providers,
      appointments,
      reviews,
      smartBookingEnabled: smartBookingUsers.length > 0,
    };
  }
}

export const publicService = new PublicService();
