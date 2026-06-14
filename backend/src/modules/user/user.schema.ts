import { z } from "zod";
import { iranianPhoneSchema, nationalCodeSchema } from "../../shared/schemas/iranianIdentity.schema.js";

export const userAppointmentsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  nationalCode: nationalCodeSchema.optional(),
  age: z.number().int().min(1).max(120).optional(),
  phone: iranianPhoneSchema.optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  email: z.string().email().optional(),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
