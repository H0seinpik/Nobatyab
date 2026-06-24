import { z } from "zod";

export const providerRequestFormSchema = z
  .object({
    note: z.string().max(1000).optional().or(z.literal("")),
    categoryId: z.string().optional().or(z.literal("")),
    proposedCategoryName: z.string().optional().or(z.literal("")),
    proposedCategoryDescription: z.string().max(2000).optional().or(z.literal("")),
    proposedServiceName: z.string().min(2, "نام خدمت حداقل ۲ کاراکتر"),
    proposedServiceDescription: z.string().max(2000).optional().or(z.literal("")),
    proposedServicePrice: z.coerce.number().min(0, "قیمت الزامی است").max(99_999_999, "قیمت بیش از حد مجاز است"),
    proposedServiceDuration: z.coerce.number().int(),
  })
  .superRefine((data, ctx) => {
    const hasCategory = !!data.categoryId;
    const hasProposal = !!data.proposedCategoryName && data.proposedCategoryName.length >= 2;
    if (hasCategory === hasProposal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "دسته‌بندی موجود یا پیشنهاد دسته جدید را انتخاب کنید",
        path: ["categoryId"],
      });
    }
    if (!data.proposedServiceDuration || data.proposedServiceDuration < 30) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "مدت الزامی است",
        path: ["proposedServiceDuration"],
      });
    } else if (data.proposedServiceDuration % 30 !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "مدت باید مضرب ۳۰ باشد",
        path: ["proposedServiceDuration"],
      });
    }
  });

export type ProviderRequestFormInput = z.infer<typeof providerRequestFormSchema>;

export const providerRequestFormInitialValues: ProviderRequestFormInput = {
  note: "",
  categoryId: "",
  proposedCategoryName: "",
  proposedCategoryDescription: "",
  proposedServiceName: "",
  proposedServiceDescription: "",
  proposedServicePrice: 0,
  proposedServiceDuration: 30,
};
