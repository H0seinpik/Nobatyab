import { storeToRefs } from "pinia";
import {
  useNotificationsStore,
  type NotificationTab,
} from "@/stores/notifications";

export type { NotificationTab };

export function useNotifications() {
  const store = useNotificationsStore();
  return {
    ...storeToRefs(store),
    fetchNotifications: store.fetchNotifications,
    loadMoreNotifications: store.loadMoreNotifications,
    fetchTabCounts: store.fetchTabCounts,
    refreshUnreadCount: store.fetchUnreadCount,
    markAsRead: store.markAsRead,
    markAllRead: store.markAllRead,
    startPolling: store.startPolling,
    stopPolling: store.stopPolling,
  };
}
