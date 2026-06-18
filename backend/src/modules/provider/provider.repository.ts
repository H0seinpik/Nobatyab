import {
  AppointmentStatus,
  Prisma,
  ServiceRequestStatus,
} from "@prisma/client";
import { prisma } from "../../config/database.js";

export class ProviderRepository {
  findProfileByUserId(userId: string) {
    return prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        cancellationPolicy: true,
      },
    });
  }

  findProfileIdByUserId(userId: string) {
    return prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  updateProfile(providerId: string, data: Prisma.ProviderProfileUpdateInput) {
    return prisma.providerProfile.update({
      where: { id: providerId },
      data,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        cancellationPolicy: true,
      },
    });
  }

  async assertProviderServiceOwnership(providerId: string, providerServiceId: string) {
    const service = await prisma.providerService.findFirst({
      where: { id: providerServiceId, providerId },
      select: { id: true },
    });
    if (!service) throw new Error("PROVIDER_SERVICE_NOT_FOUND");
    return service.id;
  }

  findWorkingHours(providerServiceId: string) {
    return prisma.workingHours.findMany({
      where: { providerServiceId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  replaceWorkingHours(
    providerServiceId: string,
    hours: { dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean }[],
  ) {
    return prisma.$transaction([
      prisma.workingHours.deleteMany({ where: { providerServiceId } }),
      prisma.workingHours.createMany({
        data: hours.map((h) => ({
          ...h,
          providerServiceId,
          isActive: h.isActive ?? true,
        })),
      }),
    ]);
  }

  createWorkingHour(
    providerServiceId: string,
    entry: { dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean },
  ) {
    return prisma.workingHours.create({
      data: {
        providerServiceId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isActive: entry.isActive ?? true,
      },
    });
  }

  findWorkingHourById(providerServiceId: string, hourId: string) {
    return prisma.workingHours.findFirst({
      where: { id: hourId, providerServiceId },
    });
  }

  updateWorkingHour(
    providerServiceId: string,
    hourId: string,
    data: { isActive?: boolean },
  ) {
    return prisma.workingHours.updateMany({
      where: { id: hourId, providerServiceId },
      data,
    });
  }

  deleteWorkingHour(providerServiceId: string, hourId: string) {
    return prisma.workingHours.deleteMany({
      where: { id: hourId, providerServiceId },
    });
  }

  copyWorkingHoursFromSibling(providerId: string, targetProviderServiceId: string) {
    return prisma.$transaction(async (tx) => {
      const sibling = await tx.providerService.findFirst({
        where: {
          providerId,
          id: { not: targetProviderServiceId },
          workingHours: { some: {} },
        },
        include: {
          workingHours: true,
        },
        orderBy: { createdAt: "asc" },
      });

      if (!sibling || sibling.workingHours.length === 0) return;

      await tx.workingHours.createMany({
        data: sibling.workingHours.map((hour) => ({
          providerServiceId: targetProviderServiceId,
          dayOfWeek: hour.dayOfWeek,
          startTime: hour.startTime,
          endTime: hour.endTime,
          isActive: hour.isActive,
        })),
      });
    });
  }

  findCancellationPolicy(providerId: string) {
    return prisma.cancellationPolicy.findUnique({ where: { providerId } });
  }

  upsertCancellationPolicy(
    providerId: string,
    data: { minHoursBefore?: number; description?: string },
  ) {
    return prisma.cancellationPolicy.upsert({
      where: { providerId },
      create: {
        providerId,
        minHoursBefore: data.minHoursBefore ?? 24,
        description: data.description,
      },
      update: data,
    });
  }

  createServiceRequest(data: {
    providerId: string;
    requestedById: string;
    serviceId?: string;
    proposedName?: string;
    proposedDescription?: string;
    proposedPrice?: number;
    proposedDuration?: number;
  }) {
    return prisma.serviceRequest.create({
      data: {
        providerId: data.providerId,
        requestedById: data.requestedById,
        serviceId: data.serviceId,
        proposedName: data.proposedName,
        proposedDescription: data.proposedDescription,
        proposedPrice: data.proposedPrice,
        proposedDuration: data.proposedDuration,
      },
      include: { service: true },
    });
  }

  findServiceRequests(
    providerId: string,
    filters: { status?: ServiceRequestStatus; skip?: number; take?: number },
  ) {
    const where = {
      providerId,
      ...(filters.status ? { status: filters.status } : {}),
    };

    return Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: "desc" },
        include: { service: true },
      }),
      prisma.serviceRequest.count({ where }),
    ]);
  }

  findAppointments(
    providerId: string,
    filters: {
      status?: AppointmentStatus;
      from?: Date;
      to?: Date;
      skip?: number;
      take?: number;
    },
  ) {
    const where = {
      providerId,
      ...(filters.status ? { status: filters.status } : {}),
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
        orderBy: { startAt: "asc" },
        include: {
          providerService: { include: { service: true } },
          user: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);
  }

  findAppointmentById(providerId: string, appointmentId: string) {
    return prisma.appointment.findFirst({
      where: { id: appointmentId, providerId },
      include: {
        providerService: { include: { service: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
      include: {
        providerService: { include: { service: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  findProviderServices(providerId: string) {
    return prisma.providerService.findMany({
      where: { providerId },
      orderBy: { createdAt: "desc" },
      include: { service: { include: { category: true } } },
    });
  }

  findProviderServiceById(providerId: string, id: string) {
    return prisma.providerService.findFirst({
      where: { id, providerId },
      include: { service: true, workingHours: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
    });
  }

  findFirstActiveCategory() {
    return prisma.category.findFirst({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  findCatalogService(serviceId: string) {
    return prisma.service.findUnique({ where: { id: serviceId } });
  }

  createProviderServiceLink(data: {
    providerId: string;
    serviceId: string;
    price: number;
    duration: number;
  }) {
    return prisma.providerService.create({
      data,
      include: { service: { include: { category: true } } },
    });
  }

  createCatalogService(data: {
    categoryId: string;
    name: string;
    description?: string;
    defaultDuration: number;
    basePrice: number;
  }) {
    return prisma.service.create({ data });
  }

  updateProviderServiceRecord(
    id: string,
    data: Partial<{ price: number; duration: number; isActive: boolean }>,
  ) {
    return prisma.providerService.update({
      where: { id },
      data,
      include: { service: { include: { category: true } } },
    });
  }

  updateCatalogServiceName(serviceId: string, name: string) {
    return prisma.service.update({
      where: { id: serviceId },
      data: { name },
    });
  }

  countAppointmentsForProviderService(providerServiceId: string) {
    return prisma.appointment.count({
      where: {
        providerServiceId,
        status: { not: AppointmentStatus.CANCELLED },
      },
    });
  }

  deleteProviderServiceRecord(id: string) {
    return prisma.$transaction(async (tx) => {
      const link = await tx.providerService.findUnique({
        where: { id },
        select: { serviceId: true },
      });
      if (!link) return null;

      await tx.providerService.delete({ where: { id } });

      const remainingLinks = await tx.providerService.count({
        where: { serviceId: link.serviceId },
      });
      if (remainingLinks === 0) {
        await tx.service.update({
          where: { id: link.serviceId },
          data: { isActive: false },
        });
      }

      return { deleted: true };
    });
  }
}

export const providerRepository = new ProviderRepository();
