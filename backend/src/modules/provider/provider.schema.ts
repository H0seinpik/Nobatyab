import { z } from "zod";
import { idSchema } from "../../shared/schemas/id.schema.js";

export const updateProviderProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  slotDurationMinutes: z.number().int().min(5).max(240).optional(),
  isAcceptingBookings: z.boolean().optional(),
});

export const workingHoursEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean().optional(),
});

export const replaceWorkingHoursSchema = z.object({
  hours: z.array(workingHoursEntrySchema).max(50),
});

export const workingHoursIdSchema = z.object({ id: idSchema });

export const toggleWorkingDaySchema = z.object({
  isActive: z.boolean(),
});

export const updateCancellationPolicySchema = z.object({
  minHoursBefore: z.number().int().min(0).max(168).optional(),
  description: z.string().max(1000).optional(),
});

export const createServiceRequestSchema = z
  .object({
    serviceId: z.string().cuid().optional(),
    proposedName: z.string().min(2).optional(),
    proposedDescription: z.string().optional(),
    proposedPrice: z.number().min(0).optional(),
    proposedDuration: z.number().int().min(5).optional(),
  })
  .refine(
    (data) =>
      data.serviceId ||
      (data.proposedName && data.proposedPrice !== undefined && data.proposedDuration !== undefined),
    { message: "Either serviceId or proposed service fields are required" },
  );

export const providerAppointmentQuerySchema = z.object({
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const providerAppointmentIdSchema = z.object({ id: z.string().cuid() });

export const serviceRequestQuerySchema = z.object({
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
