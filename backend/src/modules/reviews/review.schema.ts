import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const providerReviewsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const appointmentIdParamSchema = z.object({
  id: z.string().min(1),
});

export const providerIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
