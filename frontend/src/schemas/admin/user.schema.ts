import { z } from "zod";

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

const optionalPhone = iranianPhone.optional().or(z.literal("")).transform((v) => v || undefined);

const optionalNationalCode = z
  .string()
  .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد")
  .refine(isValidNationalCode, { message: "کد ملی معتبر نیست" })
  .optional()
  .or(z.literal(""))
  .transform((v) => v || undefined);

const optionalAge = z.preprocess(
  (val) => (val === "" || val === undefined || Number.isNaN(val) ? undefined : Number(val)),
  z.number().int("سن باید عدد صحیح باشد").min(1).max(120).optional(),
);

const userFieldsSchema = z.object({
  email: z.string().min(1, "ایمیل الزامی است").email("ایمیل معتبر نیست"),
  fullName: z.string().min(2, "نام کامل باید حداقل ۲ کاراکتر باشد"),
  firstName: z
    .string()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  lastName: z
    .string()
    .min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  nationalCode: optionalNationalCode,
  age: optionalAge,
  address: z
    .string()
    .max(500, "آدرس حداکثر ۵۰۰ کاراکتر")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  phone: optionalPhone,
  role: z.enum(["USER", "PROVIDER", "ADMIN"]),
  isActive: z.boolean(),
});

export const createUserSchema = userFieldsSchema.extend({
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
});

export const updateUserSchema = userFieldsSchema
  .partial()
  .extend({
    password: z
      .string()
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
      .optional()
      .or(z.literal(""))
      .transform((v) => v || undefined),
  });

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;
