import { z } from "zod";

export const createServiceSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  defaultDuration: z.number().int().min(5),
  basePrice: z.number().min(0),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();
export const serviceQuerySchema = z.object({
  categoryId: z.string().cuid().optional(),
  q: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
export const serviceIdSchema = z.object({ id: z.string().cuid() });
