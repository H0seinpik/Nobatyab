import { z } from "zod";

export const createCategoryFormSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  slug: z
    .string()
    .min(2, "slug باید حداقل ۲ کاراکتر باشد")
    .regex(/^[a-z0-9-]+$/, "slug فقط حروف کوچک انگلیسی، اعداد و خط تیره"),
});

export const createServiceFormSchema = z.object({
  categoryId: z.string().min(1, "انتخاب دسته الزامی است"),
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  defaultDuration: z.coerce.number().int().min(5, "مدت باید حداقل ۵ دقیقه باشد"),
  basePrice: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
});

export type CreateCategoryForm = z.infer<typeof createCategoryFormSchema>;
export type CreateServiceForm = z.infer<typeof createServiceFormSchema>;
