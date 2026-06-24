import { Role, ServiceRequestStatus, ProviderRequestStatus } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import { hashPassword } from "../../shared/utils/password.js";
import { isUniqueConstraintError } from "../../shared/utils/prismaErrors.js";
import type { BaseListQuery } from "../../shared/schemas/listQuery.schema.js";
import {
  appointmentListConfig,
  buildListQuery,
  userListConfig,
} from "../../shared/utils/queryBuilder.js";
import { providerRequestService } from "../provider-request/provider-request.service.js";
import { authRepository } from "../auth/auth.repository.js";
import { adminRepository } from "./admin.repository.js";
import type {
  adminCreateUserSchema,
  adminReviewProviderRequestSchema,
  adminReviewServiceRequestSchema,
  adminUpdateUserSchema,
} from "./admin.schema.js";
import type { z } from "zod";

type CreateUserInput = z.infer<typeof adminCreateUserSchema>;
type UpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
type ReviewServiceRequestInput = z.infer<typeof adminReviewServiceRequestSchema>;
type ReviewProviderRequestInput = z.infer<typeof adminReviewProviderRequestSchema>;

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

  async getUser(id: string) {
    const user = await this.repo.findUserById(id);
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  async createUser(input: CreateUserInput) {
    const existingEmail = await this.repo.findUserByEmail(input.email);
    if (existingEmail) throw ApiError.conflict("Email already registered");

    if (input.nationalCode) {
      const existingCode = await this.repo.findUserByNationalCode(input.nationalCode);
      if (existingCode) throw ApiError.conflict("National code already registered");
    }

    const passwordHash = await hashPassword(input.password);
    const role = input.role ?? Role.USER;
    const fullName = `${input.firstName} ${input.lastName}`.trim();

    const {
      categoryId,
      serviceName,
      serviceDescription,
      servicePrice,
      serviceDuration,
      ...userFields
    } = input;

    if (role === Role.PROVIDER) {
      if (!categoryId || !serviceName || servicePrice === undefined || !serviceDuration) {
        throw ApiError.badRequest(
          "categoryId, serviceName, servicePrice, and serviceDuration are required when creating a provider",
        );
      }
    }

    const user = await this.repo.createUser({
      email: userFields.email,
      passwordHash,
      fullName,
      firstName: userFields.firstName,
      lastName: userFields.lastName,
      nationalCode: userFields.nationalCode,
      age: userFields.age,
      address: userFields.address,
      phone: userFields.phone,
      latitude: userFields.latitude,
      longitude: userFields.longitude,
      role,
      isActive: userFields.isActive ?? true,
    });

    if (role === Role.PROVIDER) {
      await this.setupProviderOnboarding(user.id, {
        categoryId: categoryId!,
        serviceName: serviceName!,
        serviceDescription,
        servicePrice: servicePrice!,
        serviceDuration: serviceDuration!,
      });
    }

    return user;
  }

  private async setupProviderOnboarding(
    userId: string,
    input: {
      categoryId: string;
      serviceName: string;
      serviceDescription?: string;
      servicePrice: number;
      serviceDuration: number;
    },
  ) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, isActive: true },
    });
    if (!category) throw ApiError.notFound("Category not found");

    try {
      await prisma.$transaction(async (tx) => {
        const profile = await tx.providerProfile.create({ data: { userId } });

        await tx.user.update({
          where: { id: userId },
          data: { role: Role.PROVIDER },
        });

        const service = await tx.service.create({
          data: {
            categoryId: category.id,
            name: input.serviceName,
            description: input.serviceDescription ?? undefined,
            defaultDuration: input.serviceDuration,
            basePrice: input.servicePrice,
          },
        });

        await tx.providerService.create({
          data: {
            providerId: profile.id,
            serviceId: service.id,
            price: input.servicePrice,
            duration: input.serviceDuration,
          },
        });
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw ApiError.conflict("Provider profile or service link already exists");
      }
      throw error;
    }
  }

  async updateUser(id: string, input: UpdateUserInput) {
    const existing = await this.repo.findUserById(id);
    if (!existing) throw ApiError.notFound("User not found");

    if (input.email && input.email !== existing.email) {
      const emailTaken = await this.repo.findUserByEmail(input.email);
      if (emailTaken && emailTaken.id !== id) {
        throw ApiError.conflict("Email already registered");
      }
    }

    if (input.nationalCode && input.nationalCode !== existing.nationalCode) {
      const codeTaken = await this.repo.findUserByNationalCode(input.nationalCode);
      if (codeTaken && codeTaken.id !== id) {
        throw ApiError.conflict("National code already registered");
      }
    }

    if (input.role === Role.PROVIDER && existing.role !== Role.PROVIDER && !existing.providerProfile) {
      if (
        !input.categoryId ||
        !input.serviceName ||
        input.servicePrice === undefined ||
        !input.serviceDuration
      ) {
        throw ApiError.badRequest(
          "categoryId, serviceName, servicePrice, and serviceDuration are required when promoting a user to provider",
        );
      }

      await this.setupProviderOnboarding(id, {
        categoryId: input.categoryId,
        serviceName: input.serviceName,
        serviceDescription: input.serviceDescription,
        servicePrice: input.servicePrice,
        serviceDuration: input.serviceDuration,
      });

      await authRepository.revokeAllUserTokens(id);
    }

    const {
      password,
      categoryId: _categoryId,
      serviceName: _serviceName,
      serviceDescription: _serviceDescription,
      servicePrice: _servicePrice,
      serviceDuration: _serviceDuration,
      ...rest
    } = input;
    const data: Record<string, unknown> = { ...rest };

    if (input.firstName !== undefined || input.lastName !== undefined) {
      const firstName = input.firstName ?? existing.firstName ?? "";
      const lastName = input.lastName ?? existing.lastName ?? "";
      data.firstName = firstName;
      data.lastName = lastName;
      data.fullName = `${firstName} ${lastName}`.trim();
    }

    if (password) {
      data.passwordHash = await hashPassword(password);
    }

    const updated = await this.repo.updateUser(id, data);

    const roleChanged = input.role !== undefined && input.role !== existing.role;
    const activeChanged = input.isActive !== undefined && input.isActive !== existing.isActive;
    if (roleChanged || activeChanged || password) {
      await authRepository.revokeAllUserTokens(id);
    }

    return updated;
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

  async listProviderRequests(query: {
    status?: ProviderRequestStatus;
    page?: string;
    limit?: string;
  }) {
    return providerRequestService.listForAdmin(query);
  }

  async reviewProviderRequest(id: string, input: ReviewProviderRequestInput) {
    return providerRequestService.reviewProviderRequest(id, input);
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
