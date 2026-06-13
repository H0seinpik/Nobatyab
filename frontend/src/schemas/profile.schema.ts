import { z } from "zod";

const email = z.string().min(1, "ایمیل الزامی است").email("ایمیل معتبر نیست");

export const updateProfileFormSchema = z.object({
  fullName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email,
  phone: z.string().optional(),
});

export const dashboardNameFormSchema = z.object({
  fullName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "رمز فعلی الزامی است"),
    newPassword: z.string().min(6, "رمز جدید باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string().min(1, "تکرار رمز الزامی است"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "رمز جدید و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export type UpdateProfileForm = z.infer<typeof updateProfileFormSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordFormSchema>;
