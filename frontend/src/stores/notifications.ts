import { defineStore } from "pinia";
import { ref } from "vue";
import { getAccessToken } from "@/services/api";
import {
  getNotifications,
  getNotificationCounts,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationFilterStatus,
  type NotificationItem,
  type NotificationTabCounts,
} from "@/services/notification.service";
import { sortNotificationsByNewest } from "@/utils/notificationSort";

export type NotificationTab = NotificationFilterStatus;

const POLL_INTERVAL_MS = 20_000;
const PAGE_SIZE = 10;

const EMPTY_TAB_COUNTS: NotificationTabCounts = {
  all: 0,
  unread: 0,
  confirmed: 0,
  cancelled: 0,
  pending: 0,
  completed: 0,
};

function filterFromTab(tab: NotificationTab): { filter?: NotificationFilterStatus } {
  if (tab === "all") return {};
  return { filter: tab };
}

export const useNotificationsStore = defineStore("notifications", () => {
  const unreadCount = ref(0);
  const tabCounts = ref<NotificationTabCounts>({ ...EMPTY_TAB_COUNTS });
  const notifications = ref<NotificationItem[]>([]);
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<string | null>(null);
  const activeTab = ref<NotificationTab>("all");
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalCount = ref(0);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function applyMeta(meta: { page: number; total: number; totalPages: number }) {
    currentPage.value = meta.page;
    totalCount.value = meta.total;
    totalPages.value = meta.totalPages;
  }

  function resetPaginationState() {
    currentPage.value = 1;
    totalPages.value = 1;
    totalCount.value = 0;
  }

  async function fetchUnreadCount() {
    if (!getAccessToken()) {
      unreadCount.value = 0;
      return;
    }
    try {
      unreadCount.value = await getUnreadNotificationCount();
    } catch {
      // keep last known count on transient failures
    }
  }

  async function fetchTabCounts() {
    if (!getAccessToken()) {
      tabCounts.value = { ...EMPTY_TAB_COUNTS };
      return;
    }
    try {
      tabCounts.value = await getNotificationCounts();
    } catch {
      // keep last known counts on transient failures
    }
  }

  async function fetchNotifications(tab: NotificationTab = activeTab.value) {
    if (!getAccessToken()) return;
    activeTab.value = tab;
    loading.value = true;
    error.value = null;
    resetPaginationState();
    try {
      const result = await getNotifications({
        ...filterFromTab(tab),
        page: 1,
        limit: PAGE_SIZE,
      });
      notifications.value = sortNotificationsByNewest(result.items);
      applyMeta(result.meta);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "خطا در دریافت اعلان‌ها";
    } finally {
      loading.value = false;
      void fetchTabCounts();
    }
  }

  async function loadMoreNotifications() {
    if (!getAccessToken()) return;
    if (loadingMore.value || currentPage.value >= totalPages.value) return;

    loadingMore.value = true;
    error.value = null;
    try {
      const nextPage = currentPage.value + 1;
      const result = await getNotifications({
        ...filterFromTab(activeTab.value),
        page: nextPage,
        limit: PAGE_SIZE,
      });
      notifications.value = sortNotificationsByNewest([
        ...notifications.value,
        ...result.items,
      ]);
      applyMeta(result.meta);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "خطا در دریافت اعلان‌ها";
    } finally {
      loadingMore.value = false;
    }
  }

  async function markAsRead(id: string) {
    const item = notifications.value.find((n) => n.id === id);
    if (item && !item.isRead && unreadCount.value > 0) {
      unreadCount.value -= 1;
    }
    const updated = await markNotificationAsRead(id);
    const idx = notifications.value.findIndex((n) => n.id === id);
    if (idx !== -1) {
      if (activeTab.value === "unread") {
        notifications.value = notifications.value.filter((n) => n.id !== id);
        if (totalCount.value > 0) totalCount.value -= 1;
      } else {
        notifications.value[idx] = updated;
        notifications.value = sortNotificationsByNewest(notifications.value);
      }
    }
    await Promise.all([fetchUnreadCount(), fetchTabCounts()]);
    return updated;
  }

  async function markAllRead() {
    await markAllNotificationsAsRead();
    if (activeTab.value === "unread") {
      notifications.value = [];
      totalCount.value = 0;
    } else {
      notifications.value = notifications.value.map((n) => ({ ...n, isRead: true }));
    }
    unreadCount.value = 0;
    await fetchTabCounts();
  }

  function startPolling() {
    if (pollTimer) return;
    void fetchUnreadCount();
    pollTimer = setInterval(() => {
      void fetchUnreadCount();
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function prependNotification(item: NotificationItem) {
    const merged = sortNotificationsByNewest([item, ...notifications.value]);
    notifications.value = merged.length > PAGE_SIZE ? merged.slice(0, PAGE_SIZE) : merged;
  }

  function reset() {
    stopPolling();
    unreadCount.value = 0;
    tabCounts.value = { ...EMPTY_TAB_COUNTS };
    notifications.value = [];
    loading.value = false;
    loadingMore.value = false;
    error.value = null;
    activeTab.value = "all";
    resetPaginationState();
  }

  return {
    unreadCount,
    tabCounts,
    notifications,
    loading,
    loadingMore,
    error,
    activeTab,
    currentPage,
    totalPages,
    totalCount,
    fetchUnreadCount,
    fetchTabCounts,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllRead,
    prependNotification,
    startPolling,
    stopPolling,
    reset,
  };
});
