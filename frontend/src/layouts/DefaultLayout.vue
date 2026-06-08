<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTheme } from "@/composables/useTheme";
import UiButton from "@/components/ui/UiButton.vue";

const auth = useAuthStore();
const { theme, toggle } = useTheme();
</script>

<template>
  <header class="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <RouterLink to="/" class="text-xl font-bold text-[var(--color-primary)]">نوبت‌یاب</RouterLink>
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
        <UiButton variant="ghost" @click="toggle">{{ theme === "dark" ? "☀️" : "🌙" }}</UiButton>
        <RouterLink v-if="!auth.isAuthenticated" to="/login">
          <UiButton variant="secondary">ورود</UiButton>
        </RouterLink>
        <UiButton v-else variant="secondary" @click="auth.logout()">خروج</UiButton>
      </nav>
    </div>
  </header>
  <main class="mx-auto max-w-6xl px-4 py-8">
    <slot />
  </main>
</template>
