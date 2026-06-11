<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
</script>

<template>
  <nav class="flex items-center gap-3 text-sm">
    <RouterLink to="/services" class="hover:text-[var(--color-primary)]">خدمات</RouterLink>
    <RouterLink to="/providers" class="hover:text-[var(--color-primary)]">ارائه‌دهندگان</RouterLink>
    <RouterLink v-if="auth.isAuthenticated" to="/appointments" class="hover:text-[var(--color-primary)]">
      نوبت‌های من
    </RouterLink>
    <RouterLink
      v-if="auth.user?.role === 'PROVIDER'"
      to="/provider"
      class="hover:text-[var(--color-primary)]"
    >
      پنل ارائه‌دهنده
    </RouterLink>
    <RouterLink v-if="auth.user?.role === 'ADMIN'" to="/admin" class="hover:text-[var(--color-primary)]">
      پنل مدیریت
    </RouterLink>
  </nav>
</template>
