import { Role, ProviderRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { isUniqueConstraintError } from "../../shared/utils/prismaErrors.js";
import { authRepository } from "../auth/auth.repository.js";
import { providerRequestRepository } from "./provider-request.repository.js";
import type { submitProviderRequestSchema } from "./provider-request.schema.js";
import type { adminReviewProviderRequestSchema } from "../admin/admin.schema.js";
import type { z } from "zod";

type SubmitInput = z.infer<typeof submitProviderRequestSchema>;
type ReviewInput = z.infer<typeof adminReviewProviderRequestSchema>;

export class ProviderRequestService {
  private repo = providerRequestRepository;

  async submit(userId: string, input: SubmitInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { providerProfile: true },
    });

    if (!user) throw ApiError.unauthorized();
    if (user.role === Role.PROVIDER || user.providerProfile) {
      throw ApiError.badRequest("You are already a provider");
    }

    const approved = await this.repo.findApprovedByUserId(userId);
    if (approved) {
      throw ApiError.badRequest("You are already a provider");
    }

    const pending = await this.repo.findPendingByUserId(userId);
    if (pending) {
      throw ApiError.conflict("You already have a pending provider request");
    }

    if (input.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: input.categoryId, isActive: true },
      });
      if (!category) {
        throw ApiError.notFound("Category not found");
      }
    }

    try {
      return await this.repo.create({
        userId,
        note: input.note,
        categoryId: input.categoryId,
        proposedCategoryName: input.proposedCategoryName,
        proposedCategoryDescription: input.proposedCategoryDescription,
        proposedServiceName: input.proposedServiceName,
        proposedServiceDescription: input.proposedServiceDescription,
        proposedServicePrice: input.proposedServicePrice,
        proposedServiceDuration: input.proposedServiceDuration,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw ApiError.conflict("You already have a pending provider request");
      }
      throw ApiError.internal("Failed to submit provider request");
    }
  }

  async getMine(userId: string) {
    return this.repo.findLatestByUserId(userId);
  }

  async listForAdmin(query: {
    status?: ProviderRequestStatus;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const status = query.status ?? ProviderRequestStatus.PENDING;
    const [items, total] = await this.repo.findMany({
      status,
      skip,
      take: limit,
    });

    return {
      items,
      meta: {
        page,
        pageSize: limit,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async reviewProviderRequest(id: string, input: ReviewInput) {
    const request = await this.repo.findById(id);
    if (!request) throw ApiError.notFound("Provider request not found");
    if (request.status !== ProviderRequestStatus.PENDING) {
      throw ApiError.badRequest("Only pending requests can be reviewed");
    }

    if (input.status === ProviderRequestStatus.REJECTED) {
      return this.repo.update(id, {
        status: ProviderRequestStatus.REJECTED,
        adminNote: input.adminNote,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      let categoryId = request.categoryId;
      let createdCategoryId: string | null = null;

      if (!categoryId) {
        if (!request.proposedCategoryName) {
          throw ApiError.badRequest("Provider request is missing category information");
        }

        const categoryName = input.categoryName ?? request.proposedCategoryName;
        const categorySlug = input.categorySlug;
        if (!categoryName || !categorySlug) {
          throw ApiError.badRequest("categoryName and categorySlug are required when approving a new category proposal");
        }

        let category;
        try {
          category = await tx.category.create({
            data: {
              name: categoryName,
              slug: categorySlug,
              description: input.categoryDescription ?? request.proposedCategoryDescription ?? undefined,
            },
          });
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            throw ApiError.conflict("Category slug already exists");
          }
          throw error;
        }

        categoryId = category.id;
        createdCategoryId = category.id;
      }

      if (!request.proposedServiceName || request.proposedServicePrice === null || !request.proposedServiceDuration) {
        throw ApiError.badRequest("Provider request is missing proposed service fields");
      }

      const user = await tx.user.findUnique({
        where: { id: request.userId },
        include: { providerProfile: true },
      });
      if (!user) throw ApiError.notFound("User not found");

      let providerProfile = user.providerProfile;
      if (!providerProfile) {
        providerProfile = await tx.providerProfile.create({ data: { userId: request.userId } });
      }

      await tx.user.update({
        where: { id: request.userId },
        data: { role: Role.PROVIDER },
      });

      const service = await tx.service.create({
        data: {
          categoryId: categoryId!,
          name: request.proposedServiceName,
          description: request.proposedServiceDescription ?? undefined,
          defaultDuration: request.proposedServiceDuration,
          basePrice: request.proposedServicePrice,
        },
      });

      await tx.providerService.create({
        data: {
          providerId: providerProfile.id,
          serviceId: service.id,
          price: request.proposedServicePrice,
          duration: request.proposedServiceDuration,
        },
      });

      return tx.providerRequest.update({
        where: { id },
        data: {
          status: ProviderRequestStatus.APPROVED,
          adminNote: input.adminNote,
          createdCategoryId,
          createdServiceId: service.id,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
          category: { select: { id: true, name: true, slug: true } },
          createdCategory: { select: { id: true, name: true, slug: true } },
          createdService: { select: { id: true, name: true } },
        },
      });
    });

    await authRepository.revokeAllUserTokens(request.userId);
    return updated;
  }
}

export const providerRequestService = new ProviderRequestService();
