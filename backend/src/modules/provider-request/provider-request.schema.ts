import { z } from "zod";
import { serviceDurationSchema } from "../../shared/schemas/duration.schema.js";
import { priceSchema } from "../../shared/schemas/price.schema.js";

export const submitProviderRequestSchema = z
  .object({
    note: z.string().max(1000).optional(),
    categoryId: z.string().cuid().optional(),
    proposedCategoryName: z.string().trim().min(2).max(100).optional(),
    proposedCategoryDescription: z.string().max(2000).optional(),
    proposedServiceName: z.string().trim().min(2).max(200),
    proposedServiceDescription: z.string().max(2000).optional(),
    proposedServicePrice: priceSchema,
    proposedServiceDuration: serviceDurationSchema,
  })
  .superRefine((data, ctx) => {
    const hasCategory = !!data.categoryId;
    const hasProposal = !!data.proposedCategoryName;
    if (hasCategory === hasProposal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either categoryId or proposedCategoryName is required (not both)",
        path: ["categoryId"],
      });
    }
  });

export const providerRequestQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
