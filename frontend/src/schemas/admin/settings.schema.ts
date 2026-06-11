import { z } from "zod";

export const settingsFormSchema = z.object({
  "site.title": z.string().min(1, "عنوان سایت الزامی است"),
  "site.description": z.string().optional(),
  "contact.email": z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
  "contact.phone": z.string().optional(),
  "contact.address": z.string().optional(),
});

export type SettingsForm = z.infer<typeof settingsFormSchema>;
