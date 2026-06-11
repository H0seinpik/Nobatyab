import { z } from "zod";
import { Role, ServiceRequestStatus } from "@prisma/client";
import { baseListQuerySchema } from "../../shared/schemas/listQuery.schema.js";

export const adminUserQuerySchema = baseListQuerySchema;

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

export const adminAppointmentQuerySchema = baseListQuerySchema;
