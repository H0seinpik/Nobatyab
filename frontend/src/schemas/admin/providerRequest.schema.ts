import { z } from "zod";

export const reviewProviderRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().max(1000).optional(),
});

export type ReviewProviderRequestInput = z.infer<typeof reviewProviderRequestSchema>;
