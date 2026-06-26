<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { Bell } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useNotificationsStore } from "@/stores/notifications";
import { getNotificationsPath } from "@/utils/notificationRoute";
import { formatPersianNumber } from "@/utils/numbers";
import UiBadge from "@/components/ui/UiBadge.vue";

const auth = useAuthStore();
const store = useNotificationsStore();
const { unreadCount } = storeToRefs(store);

const notificationsPath = computed(() => getNotificationsPath(auth.user?.role));

const badgeLabel = computed(() => {
  if (unreadCount.value <= 0) return "";
  if (unreadCount.value > 99) return "۹۹+";
  return formatPersianNumber(unreadCount.value);
});
</script>

<template>
  <RouterLink :to="notificationsPath" class="notification-bell" aria-label="اعلان‌ها">
    <Bell :size="20" />
    <UiBadge v-if="unreadCount > 0" tone="danger" class="notification-bell__badge">
      {{ badgeLabel }}
    </UiBadge>
  </RouterLink>
</template>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;
  padding: 0.25rem;
  overflow: visible;
}

.notification-bell:hover {
  color: var(--color-primary);
}

.notification-bell__badge {
  position: absolute;
  top: -0.25rem;
  inset-inline-start: -0.25rem;
  min-width: 1.125rem;
  justify-content: center;
  padding: 0 0.25rem;
  font-size: 0.625rem;
  z-index: 1;
}
</style>
