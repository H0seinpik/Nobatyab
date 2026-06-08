import { AppointmentStatus, Prisma, Role, ServiceRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class AdminRepository {
  findUsers(filters: {
    q?: string;
    role?: Role;
    isActive?: boolean;
    skip?: number;
    take?: number;
  }) {
    const where = {
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      ...(filters.q
        ? {
            OR: [
              { email: { contains: filters.q, mode: "insensitive" as const } },
              { fullName: { contains: filters.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    return Promise.all([
      prisma.user.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          providerProfile: { select: { id: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
  }

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        providerProfile: { select: { id: true } },
      },
    });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        providerProfile: { select: { id: true } },
      },
    });
  }

  findServiceRequests(filters: {
    status?: ServiceRequestStatus;
    skip?: number;
    take?: number;
  }) {
    const where = {
      ...(filters.status ? { status: filters.status } : {}),
    };

    return Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: "desc" },
        include: {
          service: true,
          provider: { include: { user: { select: { fullName: true, email: true } } } },
          requestedBy: { select: { fullName: true, email: true } },
        },
      }),
      prisma.serviceRequest.count({ where }),
    ]);
  }

  findServiceRequestById(id: string) {
    return prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: true,
        provider: { include: { user: { select: { fullName: true, email: true } } } },
        requestedBy: { select: { fullName: true, email: true } },
      },
    });
  }

  updateServiceRequest(
    id: string,
    data: { status: ServiceRequestStatus; adminNote?: string },
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.serviceRequest.update({
      where: { id },
      data,
      include: {
        service: true,
        provider: { include: { user: { select: { fullName: true, email: true } } } },
      },
    });
  }

  createService(data: {
    categoryId: string;
    name: string;
    description?: string;
    defaultDuration: number;
    basePrice: number;
  }) {
    return prisma.service.create({ data });
  }

  createProviderService(data: {
    providerId: string;
    serviceId: string;
    price: number;
    duration: number;
  }) {
    return prisma.providerService.create({ data });
  }

  findProviderService(providerId: string, serviceId: string) {
    return prisma.providerService.findUnique({
      where: { providerId_serviceId: { providerId, serviceId } },
    });
  }

  findAppointments(filters: {
    status?: AppointmentStatus;
    providerId?: string;
    from?: Date;
    to?: Date;
    skip?: number;
    take?: number;
  }) {
    const where = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.providerId ? { providerId: filters.providerId } : {}),
      ...(filters.from || filters.to
        ? {
            startAt: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };

    return Promise.all([
      prisma.appointment.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { startAt: "desc" },
        include: {
          provider: { include: { user: { select: { fullName: true } } } },
          providerService: { include: { service: true } },
          user: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);
  }
}

export const adminRepository = new AdminRepository();
