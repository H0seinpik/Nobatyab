import { z } from "zod";

export const createServiceSchema = z.object({
  categoryId: z.string().min(1, "انتخاب دسته الزامی است"),
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  description: z.string().optional(),
  defaultDuration: z.coerce.number().int().min(5, "مدت باید حداقل ۵ دقیقه باشد"),
  basePrice: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
});

export const updateServiceSchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  defaultDuration: z.coerce.number().int().min(5).optional(),
  basePrice: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateServiceForm = z.infer<typeof createServiceSchema>;
export type UpdateServiceForm = z.infer<typeof updateServiceSchema>;
