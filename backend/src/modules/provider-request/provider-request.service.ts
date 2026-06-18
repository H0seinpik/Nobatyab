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

    try {
      return await this.repo.create({
        userId,
        note: input.note,
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
      const user = await tx.user.findUnique({
        where: { id: request.userId },
        include: { providerProfile: true },
      });
      if (!user) throw ApiError.notFound("User not found");

      if (!user.providerProfile) {
        await tx.providerProfile.create({ data: { userId: request.userId } });
      }

      await tx.user.update({
        where: { id: request.userId },
        data: { role: Role.PROVIDER },
      });

      return tx.providerRequest.update({
        where: { id },
        data: {
          status: ProviderRequestStatus.APPROVED,
          adminNote: input.adminNote,
        },
        include: {
          user: { select: { id: true, fullName: true, email: true, phone: true, role: true } },
        },
      });
    });

    await authRepository.revokeAllUserTokens(request.userId);
    return updated;
  }
}

export const providerRequestService = new ProviderRequestService();
