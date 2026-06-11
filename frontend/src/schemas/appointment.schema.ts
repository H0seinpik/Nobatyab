import { z } from "zod";

export const guestBookingFormSchema = z.object({
  guestFullName: z.string().min(2, "نام الزامی است"),
  guestPhone: z.string().min(10, "شماره موبایل معتبر نیست"),
  guestEmail: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, "ایمیل معتبر نیست"),
  notes: z.string().max(1000, "حداکثر ۱۰۰۰ کاراکتر").optional().or(z.literal("")),
});

export type GuestBookingForm = z.infer<typeof guestBookingFormSchema>;
