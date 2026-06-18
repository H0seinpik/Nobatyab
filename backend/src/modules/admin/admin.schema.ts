import { z } from "zod";
import { Role, ServiceRequestStatus, ProviderRequestStatus } from "@prisma/client";
import { baseListQuerySchema } from "../../shared/schemas/listQuery.schema.js";
import {
  iranianPhoneSchema,
  nationalCodeSchema,
} from "../../shared/schemas/iranianIdentity.schema.js";

export const adminUserQuerySchema = baseListQuerySchema;

export const adminUserIdSchema = z.object({ id: z.string().cuid() });

const adminUserFieldsSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  nationalCode: nationalCodeSchema.optional(),
  age: z.number().int().min(1).max(120).optional(),
  address: z.string().max(500).optional(),
  phone: iranianPhoneSchema.optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});

export const adminCreateUserSchema = adminUserFieldsSchema.extend({
  password: z.string().min(8),
  role: z.nativeEnum(Role).default(Role.USER),
  isActive: z.boolean().default(true),
});

export const adminUpdateUserSchema = adminUserFieldsSchema
  .partial()
  .extend({
    password: z.string().min(8).optional(),
  });

export const adminServiceRequestQuerySchema = baseListQuerySchema.extend({
  status: z.nativeEnum(ServiceRequestStatus).optional(),
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

export const adminProviderRequestQuerySchema = baseListQuerySchema.extend({
  status: z.nativeEnum(ProviderRequestStatus).optional(),
});
