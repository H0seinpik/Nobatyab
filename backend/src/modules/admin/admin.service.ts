import { Role, ServiceRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import type { BaseListQuery } from "../../shared/schemas/listQuery.schema.js";
import {
  appointmentListConfig,
  buildListQuery,
  userListConfig,
} from "../../shared/utils/queryBuilder.js";
import { adminRepository } from "./admin.repository.js";
import type { adminReviewServiceRequestSchema, adminUpdateUserSchema } from "./admin.schema.js";
import type { z } from "zod";

type UpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
type ReviewServiceRequestInput = z.infer<typeof adminReviewServiceRequestSchema>;

export class AdminService {
  private repo = adminRepository;

  async listUsers(query: BaseListQuery) {
    const built = buildListQuery(userListConfig, query);
    const [items, total] = await this.repo.findUsers({
      where: built.where,
      orderBy: built.orderBy,
      skip: built.skip,
      take: built.take,
    });
    return { items, meta: paginationMeta(built.page, built.pageSize, total) };
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const existing = await this.repo.findUserById(id);
    if (!existing) throw ApiError.notFound("User not found");

    if (input.role === Role.PROVIDER && !existing.providerProfile) {
      await prisma.providerProfile.create({ data: { userId: id } });
    }

    return this.repo.updateUser(id, input);
  }

  async listServiceRequests(query: {
    status?: ServiceRequestStatus;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await this.repo.findServiceRequests({
      status: query.status,
      skip,
      take: limit,
    });
    return { items, meta: paginationMeta(page, limit, total) };
  }

  async reviewServiceRequest(id: string, input: ReviewServiceRequestInput) {
    const request = await this.repo.findServiceRequestById(id);
    if (!request) throw ApiError.notFound("Service request not found");
    if (request.status !== ServiceRequestStatus.PENDING) {
      throw ApiError.badRequest("Only pending requests can be reviewed");
    }

    if (input.status === ServiceRequestStatus.REJECTED) {
      return this.repo.updateServiceRequest(id, {
        status: ServiceRequestStatus.REJECTED,
        adminNote: input.adminNote,
      });
    }

    return prisma.$transaction(async (tx) => {
      let serviceId = request.serviceId;
      let price = Number(request.proposedPrice ?? request.service?.basePrice ?? 0);
      let duration = request.proposedDuration ?? request.service?.defaultDuration ?? 30;

      if (!serviceId) {
        if (!input.categoryId) {
          throw ApiError.badRequest("categoryId is required when approving a new service proposal");
        }
        if (!request.proposedName || request.proposedPrice === null || !request.proposedDuration) {
          throw ApiError.badRequest("Service request is missing proposed service fields");
        }

        const service = await tx.service.create({
          data: {
            categoryId: input.categoryId,
            name: request.proposedName,
            description: request.proposedDescription ?? undefined,
            defaultDuration: request.proposedDuration,
            basePrice: request.proposedPrice,
          },
        });
        serviceId = service.id;
        price = Number(request.proposedPrice);
        duration = request.proposedDuration;
      } else if (request.service) {
        price = Number(request.proposedPrice ?? request.service.basePrice);
        duration = request.proposedDuration ?? request.service.defaultDuration;
      }

      const existingLink = await tx.providerService.findUnique({
        where: {
          providerId_serviceId: { providerId: request.providerId, serviceId },
        },
      });

      if (!existingLink) {
        await tx.providerService.create({
          data: {
            providerId: request.providerId,
            serviceId,
            price,
            duration,
          },
        });
      }

      return tx.serviceRequest.update({
        where: { id },
        data: {
          status: ServiceRequestStatus.APPROVED,
          adminNote: input.adminNote,
          serviceId,
        },
        include: {
          service: true,
          provider: { include: { user: { select: { fullName: true, email: true } } } },
        },
      });
    });
  }

  async listAppointments(query: BaseListQuery) {
    const built = buildListQuery(appointmentListConfig, query);
    const [items, total] = await this.repo.findAppointments({
      where: built.where,
      orderBy: built.orderBy,
      skip: built.skip,
      take: built.take,
    });
    return { items, meta: paginationMeta(built.page, built.pageSize, total) };
  }
}

export const adminService = new AdminService();
