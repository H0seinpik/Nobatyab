import { AppointmentStatus, ServiceRequestStatus } from "@prisma/client";
import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import { timeToMinutes } from "../../shared/utils/datetime.js";
import { timeSlotSyncService } from "../smart-booking/timeSlotSync.service.js";
import { providerRepository } from "./provider.repository.js";
import type {
  createServiceRequestSchema,
  replaceWorkingHoursSchema,
  updateCancellationPolicySchema,
  updateProviderProfileSchema,
} from "./provider.schema.js";
import type { z } from "zod";

type UpdateProfileInput = z.infer<typeof updateProviderProfileSchema>;
type ReplaceWorkingHoursInput = z.infer<typeof replaceWorkingHoursSchema>;
type UpdateCancellationPolicyInput = z.infer<typeof updateCancellationPolicySchema>;
type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;

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

  async getWorkingHours(userId: string) {
    const providerId = await this.getProviderProfileId(userId);
    return this.repo.findWorkingHours(providerId);
  }

  async replaceWorkingHours(userId: string, input: ReplaceWorkingHoursInput) {
    const providerId = await this.getProviderProfileId(userId);

    for (const entry of input.hours) {
      if (timeToMinutes(entry.startTime) >= timeToMinutes(entry.endTime)) {
        throw ApiError.badRequest("startTime must be before endTime");
      }
    }

    await this.repo.replaceWorkingHours(providerId, input.hours);
    await timeSlotSyncService.syncProvider(providerId);
    return this.repo.findWorkingHours(providerId);
  }

  async deleteWorkingHour(userId: string, hourId: string) {
    const providerId = await this.getProviderProfileId(userId);
    const existing = await this.repo.findWorkingHourById(providerId, hourId);
    if (!existing) throw ApiError.notFound("Working day not found");

    await this.repo.deleteWorkingHour(providerId, hourId);
    await timeSlotSyncService.syncProvider(providerId);
    return this.repo.findWorkingHours(providerId);
  }

  async toggleWorkingDay(userId: string, hourId: string, isActive: boolean) {
    const providerId = await this.getProviderProfileId(userId);
    const existing = await this.repo.findWorkingHourById(providerId, hourId);
    if (!existing) throw ApiError.notFound("Working day not found");

    await this.repo.updateWorkingHour(providerId, hourId, { isActive });
    await timeSlotSyncService.syncProvider(providerId);
    return this.repo.findWorkingHours(providerId);
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
}

export const providerService = new ProviderService();
