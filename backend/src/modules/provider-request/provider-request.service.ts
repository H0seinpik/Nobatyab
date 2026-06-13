import { Role, ProviderRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { ApiError } from "../../shared/utils/apiError.js";
import { isUniqueConstraintError } from "../../shared/utils/prismaErrors.js";
import { providerRequestRepository } from "./provider-request.repository.js";
import type { submitProviderRequestSchema } from "./provider-request.schema.js";
import type { z } from "zod";

type SubmitInput = z.infer<typeof submitProviderRequestSchema>;

export class ProviderRequestService {
  private repo = providerRequestRepository;

  async submit(userId: string, input: SubmitInput) {
    console.log("[ProviderRequest] submit body:", JSON.stringify(input));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { providerProfile: true },
    });

    if (!user) throw ApiError.unauthorized();
    if (user.role === Role.PROVIDER || user.providerProfile) {
      throw ApiError.badRequest("You are already a provider");
    }

    const pending = await this.repo.findPendingByUserId(userId);
    if (pending) {
      throw ApiError.conflict("You already have a pending provider request");
    }

    try {
      const created = await this.repo.create({
        userId,
        note: input.note,
      });
      console.log("[ProviderRequest] created:", created.id, "userId:", created.userId);
      return created;
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw ApiError.conflict("You already have a pending provider request");
      }
      console.error("[ProviderRequest] create failed:", error);
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

    const [items, total] = await this.repo.findMany({
      status: query.status ?? ProviderRequestStatus.PENDING,
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
}

export const providerRequestService = new ProviderRequestService();
