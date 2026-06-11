import { z } from "zod";

export const reviewServiceRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().max(1000).optional(),
  categoryId: z.string().optional(),
});

export type ReviewServiceRequestForm = z.infer<typeof reviewServiceRequestSchema>;
