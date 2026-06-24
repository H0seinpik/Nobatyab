import { ProviderRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
} as const;

const categorySelect = {
  id: true,
  name: true,
  slug: true,
} as const;

const serviceSelect = {
  id: true,
  name: true,
} as const;

const requestIncludes = {
  user: { select: userSelect },
  category: { select: categorySelect },
  createdCategory: { select: categorySelect },
  createdService: { select: serviceSelect },
} as const;

export type ProviderRequestCreateData = {
  userId: string;
  note?: string;
  categoryId?: string;
  proposedCategoryName?: string;
  proposedCategoryDescription?: string;
  proposedServiceName: string;
  proposedServiceDescription?: string;
  proposedServicePrice: number;
  proposedServiceDuration: number;
};

export class ProviderRequestRepository {
  findPendingByUserId(userId: string) {
    return prisma.providerRequest.findFirst({
      where: { userId, status: ProviderRequestStatus.PENDING },
      include: requestIncludes,
    });
  }

  findApprovedByUserId(userId: string) {
    return prisma.providerRequest.findFirst({
      where: { userId, status: ProviderRequestStatus.APPROVED },
      include: requestIncludes,
    });
  }

  findLatestByUserId(userId: string) {
    return prisma.providerRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: requestIncludes,
    });
  }

  create(data: ProviderRequestCreateData) {
    return prisma.providerRequest.create({
      data: {
        userId: data.userId,
        note: data.note,
        status: ProviderRequestStatus.PENDING,
        categoryId: data.categoryId,
        proposedCategoryName: data.proposedCategoryName,
        proposedCategoryDescription: data.proposedCategoryDescription,
        proposedServiceName: data.proposedServiceName,
        proposedServiceDescription: data.proposedServiceDescription,
        proposedServicePrice: data.proposedServicePrice,
        proposedServiceDuration: data.proposedServiceDuration,
      },
      include: requestIncludes,
    });
  }

  findById(id: string) {
    return prisma.providerRequest.findUnique({
      where: { id },
      include: requestIncludes,
    });
  }

  update(
    id: string,
    data: {
      status?: ProviderRequestStatus;
      adminNote?: string | null;
      createdCategoryId?: string | null;
      createdServiceId?: string | null;
    },
  ) {
    return prisma.providerRequest.update({
      where: { id },
      data,
      include: requestIncludes,
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
        include: requestIncludes,
      }),
      prisma.providerRequest.count({ where }),
    ]);
  }
}

export const providerRequestRepository = new ProviderRequestRepository();
