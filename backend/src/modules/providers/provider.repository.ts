import { Role } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { calculateDistance } from "../smart-booking/helpers/distance.js";

export class PublicProviderRepository {
  findMany(filters: {
    serviceId?: string;
    categoryId?: string;
    q?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
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
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          providerServices: {
            where: { isActive: true, service: { isActive: true } },
            include: { service: { include: { category: true } } },
          },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]).then(([items, total]) => {
      let mapped = items.map((item) => ({
        ...item,
        distanceKm:
          filters.lat != null && filters.lng != null
            ? calculateDistance(filters.lat, filters.lng, item.latitude, item.longitude)
            : null,
      }));

      if (filters.radiusKm != null && filters.lat != null && filters.lng != null) {
        mapped = mapped.filter(
          (p) => p.distanceKm != null && p.distanceKm <= filters.radiusKm!,
        );
      }

      if (filters.lat != null && filters.lng != null) {
        mapped.sort((a, b) => {
          if (a.distanceKm == null && b.distanceKm == null) return 0;
          if (a.distanceKm == null) return 1;
          if (b.distanceKm == null) return -1;
          return a.distanceKm - b.distanceKm;
        });
      }

      return [mapped, filters.radiusKm != null ? mapped.length : total] as const;
    });
  }

  findById(id: string) {
    return prisma.providerProfile.findFirst({
      where: {
        id,
        isAcceptingBookings: true,
        user: { isActive: true, role: Role.PROVIDER },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        providerServices: {
          where: { isActive: true, service: { isActive: true } },
          include: { service: { include: { category: true } } },
        },
        cancellationPolicy: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { fullName: true } } },
        },
      },
    });
  }
}

export const publicProviderRepository = new PublicProviderRepository();
