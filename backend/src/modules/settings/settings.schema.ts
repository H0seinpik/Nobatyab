import { z } from "zod";

export const updateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
    }),
  ).min(1),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const PUBLIC_SETTING_KEYS = [
  "site.title",
  "site.description",
  "contact.email",
  "contact.phone",
  "contact.address",
] as const;
