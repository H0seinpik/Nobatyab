import { z } from "zod";

const email = z.string().min(1, "ایمیل الزامی است").email("ایمیل معتبر نیست");

function isValidNationalCode(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(code[i]) * (10 - i);
  }
  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

const iranianPhone = z
  .string()
  .regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با 09 شروع شود");

export const updateProfileFormSchema = z.object({
  firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
  nationalCode: z
    .string()
    .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد")
    .refine(isValidNationalCode, { message: "کد ملی معتبر نیست" })
    .optional()
    .or(z.literal("")),
  age: z.preprocess(
    (val) => (val === "" || val === undefined || Number.isNaN(val) ? undefined : Number(val)),
    z.number().int("سن باید عدد صحیح باشد").min(1, "سن باید حداقل ۱ باشد").max(120, "سن باید حداکثر ۱۲۰ باشد").optional(),
  ),
  phone: iranianPhone.optional().or(z.literal("")),
  address: z.string().max(500, "آدرس حداکثر ۵۰۰ کاراکتر").optional().or(z.literal("")),
  email,
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
