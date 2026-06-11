import { z } from "zod";

export const updateUserSchema = z.object({
  role: z.enum(["USER", "PROVIDER", "ADMIN"]),
  isActive: z.boolean(),
});

export type UpdateUserForm = z.infer<typeof updateUserSchema>;
