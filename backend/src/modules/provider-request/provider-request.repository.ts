import { ProviderRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class ProviderRequestRepository {
  findPendingByUserId(userId: string) {
    return prisma.providerRequest.findFirst({
      where: { userId, status: ProviderRequestStatus.PENDING },
    });
  }

  findLatestByUserId(userId: string) {
    return prisma.providerRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: { userId: string; note?: string }) {
    return prisma.providerRequest.create({
      data: {
        userId: data.userId,
        note: data.note,
        status: ProviderRequestStatus.PENDING,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
      },
    });
  }

  findById(id: string) {
    return prisma.providerRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
      },
    });
  }

  update(
    id: string,
    data: {
      status?: ProviderRequestStatus;
      adminNote?: string | null;
    },
  ) {
    return prisma.providerRequest.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
      },
    });
  }

  findMany(filters: {
    status?: ProviderRequestStatus;
    skip?: number;
    take?: number;
  }) {
    const where = {
      ...(filters.status ? { status: filters.status } : {}),
    };

    return Promise.all([
      prisma.providerRequest.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
        },
      }),
      prisma.providerRequest.count({ where }),
    ]);
  }
}

export const providerRequestRepository = new ProviderRequestRepository();
