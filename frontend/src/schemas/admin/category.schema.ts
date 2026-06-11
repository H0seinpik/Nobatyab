import { z } from "zod";

const slug = z
  .string()
  .min(2, "slug باید حداقل ۲ کاراکتر باشد")
  .regex(/^[a-z0-9-]+$/, "slug فقط حروف کوچک انگلیسی، اعداد و خط تیره");

export const createCategorySchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  slug,
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").optional(),
  slug: slug.optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCategoryForm = z.infer<typeof createCategorySchema>;
export type UpdateCategoryForm = z.infer<typeof updateCategorySchema>;
