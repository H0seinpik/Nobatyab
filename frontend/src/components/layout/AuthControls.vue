<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/composables/useLogout";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const logout = useLogout();
</script>

<template>
  <div class="flex items-center gap-2">
    <template v-if="auth.isAuthenticated">
      <RouterLink to="/profile" class="text-sm hover:text-[var(--color-primary)]">پروفایل</RouterLink>
      <RouterLink
        v-if="auth.user?.role === 'ADMIN'"
        to="/admin"
        class="text-sm hover:text-[var(--color-primary)]"
      >
        پنل مدیریت
      </RouterLink>
      <RouterLink
        v-else-if="auth.user?.role === 'PROVIDER'"
        to="/provider"
        class="text-sm hover:text-[var(--color-primary)]"
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
