import { z } from "zod";

export const reviewProviderRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: z.string().max(1000).optional(),
  categoryName: z.string().max(100).optional(),
  categorySlug: z
    .string()
    .regex(/^[a-z0-9-]*$/)
    .optional()
    .or(z.literal("")),
  categoryDescription: z.string().max(2000).optional(),
});

export type ReviewProviderRequestInput = z.infer<typeof reviewProviderRequestSchema>;

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .slice(0, 50);
}
