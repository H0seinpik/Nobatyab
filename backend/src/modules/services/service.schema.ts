import { z } from "zod";
import { baseListQuerySchema } from "../../shared/schemas/listQuery.schema.js";
import { serviceDurationSchema, optionalServiceDurationSchema } from "../../shared/schemas/duration.schema.js";

export const createServiceSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  defaultDuration: serviceDurationSchema,
  basePrice: z.number().min(0),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  defaultDuration: optionalServiceDurationSchema,
});
export const serviceQuerySchema = z.object({
  categoryId: z.string().cuid().optional(),
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const adminServiceListQuerySchema = baseListQuerySchema;
export const serviceIdSchema = z.object({ id: z.string().cuid() });
