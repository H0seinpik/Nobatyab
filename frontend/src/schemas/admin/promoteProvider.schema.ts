import { z } from "zod";

export const adminPromoteProviderSchema = z.object({
  categoryId: z.string().min(1, "انتخاب دسته‌بندی الزامی است"),
  serviceName: z.string().min(2, "نام خدمت حداقل ۲ کاراکتر"),
  serviceDescription: z.string().max(2000).optional().or(z.literal("")),
  servicePrice: z.coerce.number().min(0, "قیمت الزامی است").max(99_999_999, "قیمت بیش از حد مجاز است"),
  serviceDuration: z.coerce
    .number()
    .int()
    .min(30, "حداقل ۳۰ دقیقه")
    .refine((d) => d % 30 === 0, "مدت باید مضرب ۳۰ باشد"),
});

export type AdminPromoteProviderInput = z.infer<typeof adminPromoteProviderSchema>;

export const adminPromoteProviderInitialValues: AdminPromoteProviderInput = {
  categoryId: "",
  serviceName: "",
  serviceDescription: "",
  servicePrice: 0,
  serviceDuration: 30,
};

export const providerOnboardingFormFields = {
  categoryId: z.string().optional().or(z.literal("")),
  serviceName: z.string().optional().or(z.literal("")),
  serviceDescription: z.string().max(2000).optional().or(z.literal("")),
  servicePrice: z.coerce.number().optional(),
  serviceDuration: z.coerce.number().optional(),
  hasProviderProfile: z.boolean().optional(),
};

type ProviderOnboardingRefineInput = {
  role?: string;
  hasProviderProfile?: boolean;
  categoryId?: string;
  serviceName?: string;
  serviceDescription?: string;
  servicePrice?: number;
  serviceDuration?: number;
};

export function refineProviderOnboarding(data: ProviderOnboardingRefineInput, ctx: z.RefinementCtx) {
  if (data.role !== "PROVIDER" || data.hasProviderProfile) return;

  const result = adminPromoteProviderSchema.safeParse({
    categoryId: data.categoryId,
    serviceName: data.serviceName,
    serviceDescription: data.serviceDescription,
    servicePrice: data.servicePrice,
    serviceDuration: data.serviceDuration,
  });

  if (!result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue(issue);
    }
  }
}
