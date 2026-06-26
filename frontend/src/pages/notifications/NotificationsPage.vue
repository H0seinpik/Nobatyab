<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useNotificationsStore, type NotificationTab } from "@/stores/notifications";
import type { NotificationItem } from "@/services/notification.service";
import { formatJalaliRelative } from "@/utils/datetime";
import { getNotificationIcon } from "@/utils/notificationIcons";
import { getApiErrorMessage } from "@/utils/apiError";
import UiCard from "@/components/ui/UiCard.vue";
import UiButton from "@/components/ui/UiButton.vue";
import UiBadge from "@/components/ui/UiBadge.vue";
import EmptyState from "@/components/feedback/EmptyState.vue";
import NetworkErrorState from "@/components/feedback/NetworkErrorState.vue";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard.vue";
import ContentFade from "@/components/ui/ContentFade.vue";
import { Bell } from "lucide-vue-next";

const router = useRouter();
const store = useNotificationsStore();
const { notifications, loading, loadingMore, error, activeTab, currentPage, totalPages, tabCounts } =
  storeToRefs(store);

const tabs: { key: NotificationTab; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "unread", label: "نخوانده‌ها" },
  { key: "pending", label: "در انتظار" },
  { key: "confirmed", label: "تایید شده" },
  { key: "cancelled", label: "لغو شده" },
  { key: "completed", label: "تکمیل شده" },
];

function tabLabel(tab: { key: NotificationTab; label: string }) {
  const count = tabCounts.value[tab.key];
  return count > 0 ? `${tab.label} (${count})` : tab.label;
}

const emptyDescription = computed(() =>
  activeTab.value === "all"
    ? "وقتی رویداد جدیدی رخ دهد، اینجا نمایش داده می‌شود."
    : "پیامی در این بخش وجود ندارد",
);

async function onTabChange(tab: NotificationTab) {
  await store.fetchNotifications(tab);
}

async function onViewNotification(item: NotificationItem) {
  try {
    if (!item.isRead) {
      await store.markAsRead(item.id);
    }
    if (item.actionUrl) {
      await router.push(item.actionUrl);
    }
  } catch (e) {
    error.value = getApiErrorMessage(e, "خطا در باز کردن اعلان");
  }
}

async function onMarkAllRead() {
  try {
    await store.markAllRead();
  } catch (e) {
    error.value = getApiErrorMessage(e, "خطا در علامت‌گذاری همه اعلان‌ها");
  }
}

onMounted(async () => {
  await Promise.all([store.fetchNotifications("all"), store.fetchUnreadCount()]);
});
</script>

<template>
  <div class="notifications-page">
    <header class="notifications-page__header">
      <div>
        <h1 class="notifications-page__title">مرکز اعلان‌ها</h1>
        <p class="notifications-page__subtitle">پیام‌های سیستم و رویدادهای حساب شما</p>
      </div>
      <UiButton
        v-if="notifications.some((n) => !n.isRead)"
        variant="secondary"
        @click="onMarkAllRead"
      >
        همه را خواندم
      </UiButton>
    </header>

    <div class="notifications-page__tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="notifications-page__tab"
        :class="{ 'notifications-page__tab--active': activeTab === tab.key }"
        :aria-selected="activeTab === tab.key"
        @click="onTabChange(tab.key)"
      >
        {{ tabLabel(tab) }}
      </button>
    </div>

    <NetworkErrorState
      v-if="error && !loading"
      :message="error"
      @retry="store.fetchNotifications(activeTab)"
    />

    <div v-else-if="loading" class="notifications-page__list">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>

    <ContentFade v-else>
      <EmptyState
        v-if="notifications.length === 0"
        :icon="Bell"
        :title="activeTab === 'all' ? 'هیچ پیامی ندارید' : 'پیامی در این بخش وجود ندارد'"
        :description="emptyDescription"
      />

      <div v-else class="notifications-page__list">
        <UiCard
          v-for="item in notifications"
          :key="item.id"
          class="notification-card"
          :class="{ 'notification-card--unread': !item.isRead }"
        >
          <div class="notification-card__row">
            <span class="notification-card__icon" aria-hidden="true">
              {{ getNotificationIcon(item.type, item.category) }}
            </span>
            <div class="notification-card__body">
              <div class="notification-card__title-row">
                <div class="notification-card__title">{{ item.title }}</div>
                <UiBadge v-if="!item.isRead" tone="info">جدید</UiBadge>
              </div>
              <p class="notification-card__message">{{ item.message }}</p>
              <time class="notification-card__time" :datetime="item.createdAt">
                {{ formatJalaliRelative(item.createdAt) }}
              </time>
              <UiButton
                v-if="item.actionUrl"
                variant="secondary"
                class="notification-card__action"
                @click="onViewNotification(item)"
              >
                مشاهده
              </UiButton>
            </div>
          </div>
        </UiCard>

        <div v-if="notifications.length > 0" class="notifications-page__footer">
          <UiButton
            v-if="currentPage < totalPages"
            variant="secondary"
            :loading="loadingMore"
            @click="store.loadMoreNotifications()"
          >
            مشاهده بیشتر
          </UiButton>
          <p v-else class="notifications-page__end">پایان پیام‌ها</p>
        </div>
      </div>
    </ContentFade>
  </div>
</template>

<style scoped>
.notifications-page {
  max-width: 42rem;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

:global(.dashboard-layout) .notifications-page {
  max-width: none;
  padding: 0;
}

.notifications-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.notifications-page__title {
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: 700;
}

.notifications-page__subtitle {
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.notifications-page__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.notifications-page__tab {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: inherit;
  border-radius: var(--radius-full);
  padding: 0.375rem 0.875rem;
  font-size: var(--text-sm);
  cursor: pointer;
}

.notifications-page__tab--active {
  background: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.notifications-page__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.notification-card {
  transition: background-color var(--transition-base);
}

.notification-card:hover {
  background: var(--color-surface-muted);
}

.notification-card--unread {
  background: var(--color-surface-muted);
}

.notification-card--unread .notification-card__title {
  font-weight: 700;
}

.notification-card__row {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.notification-card__icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.notification-card__body {
  flex: 1;
  min-width: 0;
}

.notification-card__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.notification-card__title {
  font-size: var(--text-base);
}

.notification-card__message {
  margin: 0 0 var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.notification-card__time {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.notification-card__action {
  margin-top: var(--space-1);
}

.notifications-page__footer {
  display: flex;
  justify-content: center;
  padding-top: var(--space-4);
}

.notifications-page__end {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}
</style>
