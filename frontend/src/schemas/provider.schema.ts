import { z } from "zod";

const timeRegex = /^\d{2}:\d{2}$/;

export const workingHourEntrySchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "فرمت ساعت: 09:00"),
  endTime: z.string().regex(timeRegex, "فرمت ساعت: 17:00"),
  isActive: z.boolean().optional(),
});

export const workingHoursFormSchema = z
  .object({
    hours: z.array(workingHourEntrySchema).min(1, "حداقل یک بازه کاری لازم است"),
  })
  .superRefine((data, ctx) => {
    data.hours.forEach((h, i) => {
      const [sh, sm] = h.startTime.split(":").map(Number);
      const [eh, em] = h.endTime.split(":").map(Number);
      if (sh * 60 + sm >= eh * 60 + em) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ساعت پایان باید بعد از شروع باشد",
          path: ["hours", i, "endTime"],
        });
      }
    });
  });

export const cancellationPolicyFormSchema = z.object({
  minHoursBefore: z.coerce.number().int().min(0).max(168),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export const serviceRequestFormSchema = z
  .object({
    serviceId: z.string().optional().or(z.literal("")),
    proposedName: z.string().optional().or(z.literal("")),
    proposedDescription: z.string().optional().or(z.literal("")),
    proposedPrice: z.coerce.number().optional(),
    proposedDuration: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.serviceId) return;
    if (!data.proposedName || data.proposedName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "نام خدمت الزامی است",
        path: ["proposedName"],
      });
    }
    if (data.proposedPrice === undefined || data.proposedPrice < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "قیمت الزامی است",
        path: ["proposedPrice"],
      });
    }
    if (!data.proposedDuration || data.proposedDuration < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "مدت الزامی است",
        path: ["proposedDuration"],
      });
    }
  });

export const providerServiceFormSchema = z.object({
  name: z.string().min(2, "نام حداقل ۲ کاراکتر"),
  duration: z.coerce
    .number()
    .int()
    .min(30, "حداقل ۳۰ دقیقه")
    .refine((d) => d % 30 === 0, "مدت باید مضرب ۳۰ باشد"),
  price: z.coerce.number().min(0, "قیمت نامعتبر"),
  description: z.string().max(500).optional().or(z.literal("")),
});

export const createProviderServiceSchema = providerServiceFormSchema;
export const updateProviderServiceSchema = providerServiceFormSchema.partial();

export const providerProfileFormSchema = z.object({
  specialization: z.string().max(200, "حداکثر ۲۰۰ کاراکتر").optional().or(z.literal("")),
  bio: z.string().max(2000, "بیوگرافی حداکثر ۲۰۰۰ کاراکتر").optional().or(z.literal("")),
  address: z.string().max(500, "آدرس حداکثر ۵۰۰ کاراکتر").optional().or(z.literal("")),
  latitude: z.coerce
    .number()
    .min(-90)
    .max(90)
    .optional()
    .or(z.nan().transform(() => undefined)),
  longitude: z.coerce
    .number()
    .min(-180)
    .max(180)
    .optional()
    .or(z.nan().transform(() => undefined)),
  slotDurationMinutes: z.coerce.number().int().min(5, "حداقل ۵ دقیقه").max(240, "حداکثر ۲۴۰ دقیقه"),
  isAcceptingBookings: z.boolean(),
});
