import { apiGet, apiPost } from "./api";

export type NotificationCategory = "booking" | "payment" | "request" | "system";

export type NotificationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type NotificationFilterStatus =
  | "all"
  | "unread"
  | "confirmed"
  | "cancelled"
  | "pending"
  | "completed";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  status: NotificationStatus;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
}

export interface NotificationListMeta {
  page: number;
  pageSize: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResult {
  items: NotificationItem[];
  meta: NotificationListMeta;
}

export interface NotificationTabCounts {
  all: number;
  unread: number;
  confirmed: number;
  cancelled: number;
  pending: number;
  completed: number;
}

export interface NotificationFilter {
  filter?: NotificationFilterStatus;
  unreadOnly?: boolean;
  category?: NotificationCategory;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export async function getNotifications(
  filter: NotificationFilter = {},
): Promise<NotificationListResult> {
  const page = filter.page ?? DEFAULT_PAGE;
  const limit = filter.limit ?? DEFAULT_LIMIT;

  const params: Record<string, string | number | boolean> = {
    page,
    limit,
  };
  if (filter.filter && filter.filter !== "all") params.filter = filter.filter;
  if (filter.unreadOnly) params.unreadOnly = "true";
  if (filter.category) params.category = filter.category;

  const res = await apiGet<NotificationItem[]>("/notifications", params);
  const meta = res.meta as NotificationListMeta | undefined;
  return {
    items: res.data,
    meta: meta ?? {
      page,
      pageSize: limit,
      limit,
      total: res.data.length,
      totalPages: 1,
    },
  };
}

export async function getNotificationCounts(): Promise<NotificationTabCounts> {
  const res = await apiGet<NotificationTabCounts>("/notifications/counts", undefined, {
    skipGlobalLoading: true,
  });
  return res.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiGet<{ count: number }>("/notifications/unread-count", undefined, {
    skipGlobalLoading: true,
  });
  return res.data.count;
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  const res = await apiPost<NotificationItem>(`/notifications/mark-as-read/${id}`);
  return res.data;
}

export async function markAllNotificationsAsRead(): Promise<{ updated: number }> {
  const res = await apiPost<{ updated: number }>("/notifications/mark-all-read");
  return res.data;
}
