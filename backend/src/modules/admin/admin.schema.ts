import { z } from "zod";
import { Role, ServiceRequestStatus } from "@prisma/client";

export const adminUserQuerySchema = z.object({
  q: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const adminUserIdSchema = z.object({ id: z.string().cuid() });

export const adminUpdateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.nativeEnum(Role).optional(),
});

export const adminServiceRequestQuerySchema = z.object({
  status: z.nativeEnum(ServiceRequestStatus).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const adminServiceRequestIdSchema = z.object({ id: z.string().cuid() });

export const adminReviewServiceRequestSchema = z
  .object({
    status: z.enum([ServiceRequestStatus.APPROVED, ServiceRequestStatus.REJECTED]),
    adminNote: z.string().max(1000).optional(),
    categoryId: z.string().cuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === ServiceRequestStatus.REJECTED) return;
    // categoryId validation happens in service when serviceId is absent on request
  });

export const adminAppointmentQuerySchema = z.object({
  status: z.string().optional(),
  providerId: z.string().cuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
