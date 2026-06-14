import { z } from "zod";
import { idSchema } from "../../shared/schemas/id.schema.js";

export const updateProviderProfileSchema = z.object({
  specialization: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
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

export const createWorkingHourSchema = workingHoursEntrySchema;

export const workingHoursIdSchema = z.object({ id: idSchema });

export const toggleWorkingDaySchema = z.object({
  isActive: z.boolean(),
});

export const updateProviderStatusSchema = toggleWorkingDaySchema;

export const providerWorkingHourIdSchema = z.object({ id: idSchema });

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

export const createProviderServiceSchema = z
  .object({
    name: z.string().min(2).optional(),
    duration: z.number().int().min(5).optional(),
    price: z.number().min(0).optional(),
    categoryId: z.string().cuid().optional(),
    description: z.string().max(2000).optional(),
    serviceId: z.string().cuid().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.serviceId) {
      if (data.price === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "price is required when linking a service" });
      }
      if (data.duration === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "duration is required when linking a service" });
      }
      return;
    }
    if (!data.name) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "name is required" });
    }
    if (data.price === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "price is required" });
    }
    if (data.duration === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "duration is required" });
    } else if (data.duration % 30 !== 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "duration must be a multiple of 30 minutes" });
    }
  });

export const updateProviderServiceSchema = z
  .object({
    name: z.string().min(2).optional(),
    duration: z.number().int().min(5).optional(),
    price: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => data.duration === undefined || data.duration % 30 === 0,
    { message: "duration must be a multiple of 30 minutes" },
  );

export const providerServiceIdSchema = z.object({ id: idSchema });
