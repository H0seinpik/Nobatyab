import { z } from "zod";

export const notificationListQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  pageSize: z.string().optional(),
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  category: z.enum(["booking", "payment", "request", "system"]).optional(),
  filter: z
    .enum(["all", "unread", "confirmed", "cancelled", "pending", "completed"])
    .optional(),
});

export type NotificationListQuery = {
  page?: string;
  limit?: string;
  pageSize?: string;
  unreadOnly?: boolean;
  category?: "booking" | "payment" | "request" | "system";
  filter?: "all" | "unread" | "confirmed" | "cancelled" | "pending" | "completed";
};
