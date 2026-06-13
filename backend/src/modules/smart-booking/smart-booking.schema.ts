import { z } from "zod";
import { idSchema, optionalId } from "../../shared/schemas/id.schema.js";

export const suggestBookingSchema = z.object({
  serviceId: idSchema,
  providerServiceId: optionalId(),
  providerId: optionalId(),
  preference: z.enum(["time", "location"]).optional().default("time"),
  horizonDays: z.coerce.number().int().min(1).max(30).optional().default(14),
});

export const confirmBookingSchema = z.object({
  providerId: idSchema,
  providerServiceId: idSchema,
  timeSlotIds: z.array(idSchema).min(1),
  notes: z.string().max(1000).optional(),
});
