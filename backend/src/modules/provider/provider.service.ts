import {
  AppointmentStatus,
  PaymentTransactionStatus,
  ServiceRequestStatus,
} from "@prisma/client";
import { prisma } from "../../config/database.js";
import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import { timeToMinutes } from "../../shared/utils/datetime.js";
import { timeSlotSyncService } from "../smart-booking/timeSlotSync.service.js";
import { providerRepository } from "./provider.repository.js";
import type {
  createProviderServiceSchema,
  createServiceRequestSchema,
  createWorkingHourSchema,
  replaceWorkingHoursSchema,
  updateCancellationPolicySchema,
  updateProviderProfileSchema,
  updateProviderServiceSchema,
} from "./provider.schema.js";
import type { z } from "zod";

type UpdateProfileInput = z.infer<typeof updateProviderProfileSchema>;
type ReplaceWorkingHoursInput = z.infer<typeof replaceWorkingHoursSchema>;
type CreateWorkingHourInput = z.infer<typeof createWorkingHourSchema>;
type UpdateCancellationPolicyInput = z.infer<typeof updateCancellationPolicySchema>;
type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
type CreateProviderServiceInput = z.infer<typeof createProviderServiceSchema>;
type UpdateProviderServiceInput = z.infer<typeof updateProviderServiceSchema>;

export class ProviderService {
  private repo = providerRepository;

  async getProviderProfileId(userId: string): Promise<string> {
    const profile = await this.repo.findProfileIdByUserId(userId);
    if (!profile) throw ApiError.notFound("Provider profile not found");
    return profile.id;
  }

  async getProfile(userId: string) {
    const profile = await this.repo.findProfileByUserId(userId);
    if (!profile) throw ApiError.notFound("Provider profile not found");
    return profile;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const providerId = await this.getProviderProfileId(userId);
    return this.repo.updateProfile(providerId, input);
  }

  private async resolveProviderServiceId(userId: string, providerServiceId: string) {
    const providerId = await this.getProviderProfileId(userId);
    try {
      return {
        providerId,
        providerServiceId: await this.repo.assertProviderServiceOwnership(
          providerId,
          providerServiceId,
        ),
      };
    } catch {
      throw ApiError.notFound("Provider service not found");
    }
  }

  async getWorkingHours(userId: string, providerServiceId: string) {
    const { providerServiceId: serviceId } = await this.resolveProviderServiceId(
      userId,
      providerServiceId,
    );
    return this.repo.findWorkingHours(serviceId);
  }

  async replaceWorkingHours(
    userId: string,
    providerServiceId: string,
    input: ReplaceWorkingHoursInput,
  ) {
    const { providerId, providerServiceId: serviceId } = await this.resolveProviderServiceId(
      userId,
      providerServiceId,
    );

    for (const entry of input.hours) {
      this.assertValidTimeRange(entry.startTime, entry.endTime);
    }

    await this.repo.replaceWorkingHours(serviceId, input.hours);
    await timeSlotSyncService.syncProviderService(serviceId, providerId);
    return this.repo.findWorkingHours(serviceId);
  }

  async createWorkingHour(
    userId: string,
    providerServiceId: string,
    input: CreateWorkingHourInput,
  ) {
    const { providerId, providerServiceId: serviceId } = await this.resolveProviderServiceId(
      userId,
      providerServiceId,
    );
    this.assertValidTimeRange(input.startTime, input.endTime);

    await this.repo.createWorkingHour(serviceId, {
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      isActive: input.isActive,
    });
    await timeSlotSyncService.syncProviderService(serviceId, providerId);
    return this.repo.findWorkingHours(serviceId);
  }

  private assertValidTimeRange(startTime: string, endTime: string) {
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      throw ApiError.badRequest("startTime must be before endTime");
    }
  }

  async deleteWorkingHour(userId: string, providerServiceId: string, hourId: string) {
    const { providerId, providerServiceId: serviceId } = await this.resolveProviderServiceId(
      userId,
      providerServiceId,
    );
    const existing = await this.repo.findWorkingHourById(serviceId, hourId);
    if (!existing) throw ApiError.notFound("Working day not found");

    await this.repo.deleteWorkingHour(serviceId, hourId);
    await timeSlotSyncService.syncProviderService(serviceId, providerId);
    return this.repo.findWorkingHours(serviceId);
  }

  async toggleWorkingDay(
    userId: string,
    providerServiceId: string,
    hourId: string,
    isActive: boolean,
  ) {
    const { providerId, providerServiceId: serviceId } = await this.resolveProviderServiceId(
      userId,
      providerServiceId,
    );
    const existing = await this.repo.findWorkingHourById(serviceId, hourId);
    if (!existing) throw ApiError.notFound("Working day not found");

    await this.repo.updateWorkingHour(serviceId, hourId, { isActive });
    await timeSlotSyncService.syncProviderService(serviceId, providerId);
    return this.repo.findWorkingHours(serviceId);
  }

  async getCancellationPolicy(userId: string) {
    const providerId = await this.getProviderProfileId(userId);
    const policy = await this.repo.findCancellationPolicy(providerId);
    return policy ?? { minHoursBefore: 24, description: null };
  }

  async updateCancellationPolicy(userId: string, input: UpdateCancellationPolicyInput) {
    const providerId = await this.getProviderProfileId(userId);
    return this.repo.upsertCancellationPolicy(providerId, input);
  }

  async createServiceRequest(userId: string, input: CreateServiceRequestInput) {
    const providerId = await this.getProviderProfileId(userId);
    return this.repo.createServiceRequest({
      providerId,
      requestedById: userId,
      ...input,
    });
  }

  async listServiceRequests(
    userId: string,
    query: { status?: string; page?: string; limit?: string },
  ) {
    const providerId = await this.getProviderProfileId(userId);
    const { page, limit, skip } = parsePagination(query);
    const status = query.status as ServiceRequestStatus | undefined;

    const [items, total] = await this.repo.findServiceRequests(providerId, {
      status,
      skip,
      take: limit,
    });
    return { items, meta: paginationMeta(page, limit, total) };
  }

  async listAppointments(
    userId: string,
    query: { status?: string; from?: string; to?: string; page?: string; limit?: string },
  ) {
    const providerId = await this.getProviderProfileId(userId);
    const { page, limit, skip } = parsePagination(query);
    const status = query.status as AppointmentStatus | undefined;
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    const [items, total] = await this.repo.findAppointments(providerId, {
      status,
      from,
      to,
      skip,
      take: limit,
    });
    return { items, meta: paginationMeta(page, limit, total) };
  }

  async confirmAppointment(userId: string, appointmentId: string) {
    const providerId = await this.getProviderProfileId(userId);
    const appointment = await this.repo.findAppointmentById(providerId, appointmentId);
    if (!appointment) throw ApiError.notFound("Appointment not found");
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw ApiError.badRequest("Only pending appointments can be confirmed");
    }
    return this.repo.updateAppointmentStatus(appointmentId, AppointmentStatus.CONFIRMED);
  }

  async completeAppointment(userId: string, appointmentId: string) {
    const providerId = await this.getProviderProfileId(userId);
    const appointment = await this.repo.findAppointmentById(providerId, appointmentId);
    if (!appointment) throw ApiError.notFound("Appointment not found");
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw ApiError.badRequest("Only confirmed appointments can be completed");
    }
    return this.repo.updateAppointmentStatus(appointmentId, AppointmentStatus.COMPLETED);
  }

  async listProviderServices(userId: string) {
    const providerId = await this.getProviderProfileId(userId);
    return this.repo.findProviderServices(providerId);
  }

  async createProviderService(userId: string, input: CreateProviderServiceInput) {
    const providerId = await this.getProviderProfileId(userId);

    if (input.serviceId) {
      const catalog = await this.repo.findCatalogService(input.serviceId);
      if (!catalog || !catalog.isActive) throw ApiError.notFound("Catalog service not found");

      const existing = await prisma.providerService.findUnique({
        where: {
          providerId_serviceId: { providerId, serviceId: input.serviceId },
        },
      });
      if (existing) throw ApiError.conflict("You already offer this service");

      const created = await this.repo.createProviderServiceLink({
        providerId,
        serviceId: input.serviceId,
        price: input.price!,
        duration: input.duration!,
      });
      await this.repo.copyWorkingHoursFromSibling(providerId, created.id);
      await timeSlotSyncService.syncProviderService(created.id, providerId);
      return created;
    }

    const category =
      input.categoryId
        ? await prisma.category.findFirst({ where: { id: input.categoryId, isActive: true } })
        : await this.repo.findFirstActiveCategory();
    if (!category) throw ApiError.badRequest("No active category available for new services");

    const service = await this.repo.createCatalogService({
      categoryId: category.id,
      name: input.name!,
      description: input.description,
      defaultDuration: input.duration!,
      basePrice: input.price!,
    });

    const created = await this.repo.createProviderServiceLink({
      providerId,
      serviceId: service.id,
      price: input.price!,
      duration: input.duration!,
    });
    await this.repo.copyWorkingHoursFromSibling(providerId, created.id);
    await timeSlotSyncService.syncProviderService(created.id, providerId);
    return created;
  }

  async updateProviderService(userId: string, id: string, input: UpdateProviderServiceInput) {
    const providerId = await this.getProviderProfileId(userId);
    const existing = await this.repo.findProviderServiceById(providerId, id);
    if (!existing) throw ApiError.notFound("Provider service not found");

    if (input.name) {
      await this.repo.updateCatalogServiceName(existing.serviceId, input.name);
    }

    const updateData: Partial<{ price: number; duration: number; isActive: boolean }> = {};
    if (input.price !== undefined) updateData.price = input.price;
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    return this.repo.updateProviderServiceRecord(id, updateData);
  }

  async deleteProviderService(userId: string, id: string) {
    const providerId = await this.getProviderProfileId(userId);
    const existing = await this.repo.findProviderServiceById(providerId, id);
    if (!existing) throw ApiError.notFound("Provider service not found");

    const appointmentCount = await this.repo.countAppointmentsForProviderService(id);
    if (appointmentCount > 0) {
      return this.repo.updateProviderServiceRecord(id, { isActive: false });
    }

    await this.repo.deleteProviderServiceRecord(id);
    return { deleted: true };
  }

  async getDashboardOverview(userId: string) {
    const providerId = await this.getProviderProfileId(userId);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayAppointments,
      pendingConfirmations,
      completedThisMonth,
      revenueResult,
      activeServices,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          providerId,
          startAt: { gte: todayStart, lt: todayEnd },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      prisma.appointment.count({
        where: { providerId, status: AppointmentStatus.PENDING },
      }),
      prisma.appointment.count({
        where: {
          providerId,
          status: AppointmentStatus.COMPLETED,
          startAt: { gte: monthStart },
        },
      }),
      prisma.paymentTransaction.aggregate({
        where: {
          status: PaymentTransactionStatus.SUCCESS,
          appointment: { providerId, startAt: { gte: monthStart } },
        },
        _sum: { amount: true },
      }),
      prisma.providerService.count({ where: { providerId, isActive: true } }),
    ]);

    return {
      todayAppointments,
      pendingConfirmations,
      completedThisMonth,
      revenueThisMonth: Number(revenueResult._sum.amount ?? 0),
      activeServices,
    };
  }
}

export const providerService = new ProviderService();
