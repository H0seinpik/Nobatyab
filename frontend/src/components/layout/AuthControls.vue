<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/composables/useLogout";
import UiButton from "@/components/ui/UiButton.vue";
import NotificationBell from "@/components/notifications/NotificationBell.vue";

const auth = useAuthStore();
const logout = useLogout();
</script>

<template>
  <div class="auth-controls">
    <template v-if="auth.isAuthenticated">
      <NotificationBell />
      <RouterLink to="/profile" class="auth-controls__link">پروفایل</RouterLink>
      <RouterLink
        v-if="auth.user?.role === 'USER'"
        to="/appointments"
        class="auth-controls__link"
      >
        نوبت‌های من
      </RouterLink>
      <RouterLink
        v-else-if="auth.user?.role === 'PROVIDER'"
        to="/provider/appointments"
        class="auth-controls__link"
      >
        نوبت‌ها
      </RouterLink>
      <RouterLink
        v-else-if="auth.user?.role === 'ADMIN'"
        to="/admin/appointments"
        class="auth-controls__link"
      >
        نوبت‌ها
      </RouterLink>
      <RouterLink
        v-if="auth.user?.role === 'ADMIN'"
        to="/admin"
        class="auth-controls__link"
      >
        پنل مدیریت
      </RouterLink>
      <RouterLink
        v-else-if="auth.user?.role === 'PROVIDER'"
        to="/provider"
        class="auth-controls__link"
      >
        پنل ارائه‌دهنده
      </RouterLink>
      <UiButton variant="secondary" @click="logout">خروج</UiButton>
    </template>
    <RouterLink v-else to="/login">
      <UiButton variant="secondary">ورود</UiButton>
    </RouterLink>
  </div>
</template>

<style scoped>
.auth-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: visible;
}

.auth-controls__link {
  font-size: 0.875rem;
  color: inherit;
  text-decoration: none;
}

.auth-controls__link:hover {
  color: var(--color-primary);
}
</style>
