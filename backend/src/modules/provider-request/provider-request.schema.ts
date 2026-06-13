import { z } from "zod";

export const submitProviderRequestSchema = z.object({
  note: z.string().max(1000).optional(),
});

export const providerRequestQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
