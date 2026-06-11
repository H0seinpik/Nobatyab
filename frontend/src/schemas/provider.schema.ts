import { z } from "zod";

export const providerProfileFormSchema = z.object({
  bio: z.string().max(2000, "بیوگرافی حداکثر ۲۰۰۰ کاراکتر").optional().or(z.literal("")),
  slotDurationMinutes: z.coerce.number().int().min(5, "حداقل ۵ دقیقه").max(240, "حداکثر ۲۴۰ دقیقه"),
  isAcceptingBookings: z.boolean(),
});

export const workingHoursFormSchema = z.object({
  hours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "فرمت ساعت: 09:00"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "فرمت ساعت: 17:00"),
      }),
    )
    .min(1, "حداقل یک بازه کاری لازم است"),
});

export const cancellationPolicyFormSchema = z.object({
  minHoursBefore: z.coerce.number().int().min(0, "حداقل ۰ ساعت").max(168, "حداکثر ۱۶۸ ساعت"),
  description: z.string().max(1000, "حداکثر ۱۰۰۰ کاراکتر").optional().or(z.literal("")),
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
    if (data.serviceId) {
      if (!z.string().cuid().safeParse(data.serviceId).success) {
        ctx.addIssue({ code: "custom", message: "شناسه خدمت معتبر نیست", path: ["serviceId"] });
      }
      return;
    }
    if (!data.proposedName || data.proposedName.length < 2) {
      ctx.addIssue({ code: "custom", message: "نام پیشنهادی الزامی است", path: ["proposedName"] });
    }
    if (data.proposedPrice === undefined || data.proposedPrice < 0) {
      ctx.addIssue({ code: "custom", message: "قیمت معتبر وارد کنید", path: ["proposedPrice"] });
    }
    if (!data.proposedDuration || data.proposedDuration < 5) {
      ctx.addIssue({ code: "custom", message: "مدت باید حداقل ۵ دقیقه باشد", path: ["proposedDuration"] });
    }
  });

export type ProviderProfileForm = z.infer<typeof providerProfileFormSchema>;
export type WorkingHoursForm = z.infer<typeof workingHoursFormSchema>;
export type CancellationPolicyForm = z.infer<typeof cancellationPolicyFormSchema>;
export type ServiceRequestForm = z.infer<typeof serviceRequestFormSchema>;
