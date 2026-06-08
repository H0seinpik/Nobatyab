import { AppointmentStatus, PaymentStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class AppointmentRepository {
  findOverlapping(
    providerId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.appointment.findFirst({
      where: {
        providerId,
        status: { not: AppointmentStatus.CANCELLED },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  create(
    data: {
      providerId: string;
      providerServiceId: string;
      userId?: string;
      guestFullName?: string;
      guestPhone?: string;
      guestEmail?: string;
      startAt: Date;
      endAt: Date;
      notes?: string;
    },
    tx: Prisma.TransactionClient = prisma,
  ) {
    return tx.appointment.create({
      data: {
        ...data,
        status: AppointmentStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      include: {
        provider: { include: { user: { select: { fullName: true } } } },
        providerService: { include: { service: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: { include: { user: { select: { id: true, fullName: true } } } },
        providerService: { include: { service: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        paymentTransactions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }

  findByUser(userId: string, filters: { status?: AppointmentStatus; skip?: number; take?: number }) {
    const where = {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
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
        },
      }),
      prisma.appointment.count({ where }),
    ]);
  }

  cancel(id: string, reason?: string) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
      include: {
        providerService: { include: { service: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return prisma.appointment.update({
      where: { id },
      data: { paymentStatus },
      include: {
        providerService: { include: { service: true } },
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        paymentTransactions: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  }

  findProviderProfileIdByUserId(userId: string) {
    return prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  findCancellationPolicy(providerId: string) {
    return prisma.cancellationPolicy.findUnique({ where: { providerId } });
  }

  findProviderService(providerServiceId: string, providerId: string) {
    return prisma.providerService.findFirst({
      where: {
        id: providerServiceId,
        providerId,
        isActive: true,
        service: { isActive: true },
      },
      include: { service: true },
    });
  }

  findProvider(providerId: string) {
    return prisma.providerProfile.findFirst({
      where: {
        id: providerId,
        isAcceptingBookings: true,
        user: { isActive: true },
      },
    });
  }

  findUserRole(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { role: true, isActive: true } });
  }

  canAccessAppointment(
    appointment: { userId: string | null; providerId: string },
    userId: string,
    role: Role,
    providerProfileId?: string | null,
  ) {
    if (role === Role.ADMIN) return true;
    if (appointment.userId === userId) return true;
    if (role === Role.PROVIDER && providerProfileId === appointment.providerId) return true;
    return false;
  }
}

export const appointmentRepository = new AppointmentRepository();
