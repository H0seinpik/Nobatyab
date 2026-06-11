import { z } from "zod";

const email = z.string().min(1, "ایمیل الزامی است").email("ایمیل معتبر نیست");
const password = z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد");

export const loginFormSchema = z.object({
  email,
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const registerFormSchema = z.object({
  fullName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email,
  phone: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 10, "شماره موبایل معتبر نیست"),
  password,
});

export const forgotPasswordFormSchema = z.object({ email });

export const resetPasswordFormSchema = z.object({
  password,
  confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "رمز عبور و تکرار آن یکسان نیستند",
  path: ["confirmPassword"],
});

export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordFormSchema>;
