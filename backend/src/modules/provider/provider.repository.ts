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
        workingHours: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
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

  findWorkingHours(providerId: string) {
    return prisma.workingHours.findMany({
      where: { providerId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  replaceWorkingHours(
    providerId: string,
    hours: { dayOfWeek: number; startTime: string; endTime: string }[],
  ) {
    return prisma.$transaction([
      prisma.workingHours.deleteMany({ where: { providerId } }),
      prisma.workingHours.createMany({
        data: hours.map((h) => ({ ...h, providerId })),
      }),
    ]);
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
}

export const providerRepository = new ProviderRepository();
