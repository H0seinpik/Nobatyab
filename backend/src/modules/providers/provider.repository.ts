import { Role } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class PublicProviderRepository {
  findMany(filters: {
    serviceId?: string;
    categoryId?: string;
    q?: string;
    skip?: number;
    take?: number;
  }) {
    const serviceFilter = {
      isActive: true,
      service: { isActive: true, ...(filters.categoryId ? { categoryId: filters.categoryId } : {}) },
      ...(filters.serviceId ? { serviceId: filters.serviceId } : {}),
    };

    const where = {
      isAcceptingBookings: true,
      user: { isActive: true, role: Role.PROVIDER },
      ...(filters.serviceId || filters.categoryId
        ? { providerServices: { some: serviceFilter } }
        : {}),
      ...(filters.q
        ? {
            OR: [
              { user: { fullName: { contains: filters.q, mode: "insensitive" as const } } },
              { bio: { contains: filters.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true } },
          providerServices: {
            where: { isActive: true, service: { isActive: true } },
            include: { service: { include: { category: true } } },
          },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);
  }

  findById(id: string) {
    return prisma.providerProfile.findFirst({
      where: {
        id,
        isAcceptingBookings: true,
        user: { isActive: true, role: Role.PROVIDER },
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        providerServices: {
          where: { isActive: true, service: { isActive: true } },
          include: { service: { include: { category: true } } },
        },
        workingHours: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
        cancellationPolicy: true,
      },
    });
  }
}

export const publicProviderRepository = new PublicProviderRepository();
